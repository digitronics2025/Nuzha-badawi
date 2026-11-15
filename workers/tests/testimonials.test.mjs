import test from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../shared/defaults.js';
import {validatePagePayload} from '../shared/validation.js';
import {insertDraft,publishDraft,published,rollBack,markReviewed,state,revision} from '../shared/store.js';
import {restoreHomepageDraft} from '../tools/smoke-content.mjs';
import {MockD1} from './mock-db.mjs';
import worker from '../public/src/index.js';

test('testimonials are opt-in, bounded, homepage-only and backwards compatible',()=>{
  assert.equal(validatePagePayload('home','en',{fields:{hero:'Existing owner copy'}}).testimonialsEnabled,false);
  for(const locale of ['uk','en','ar','ru']){
    const content=structuredClone(defaults[locale].home);
    assert.ok(Object.keys(content.fields).length<=65);
    content.testimonialsEnabled=true;
    content.media.reviewYuraScreenshot='approvedimage123';
    assert.equal(validatePagePayload('home',locale,content).media.reviewYuraScreenshot,'approvedimage123');
    assert.equal(defaults[locale].home.testimonialsEnabled,false);
  }
  for(const value of ['true',1,null,{}])assert.throws(()=>validatePagePayload('home','en',{fields:{},testimonialsEnabled:value}));
  assert.throws(()=>validatePagePayload('about','en',{fields:{},testimonialsEnabled:true}));
  assert.throws(()=>validatePagePayload('lessons','en',{fields:{},media:{reviewMScreenshot:'approvedimage123'}}));
  for(const value of ['..','https://example.com/image.png','../secret',1234567890])assert.throws(()=>validatePagePayload('home','en',{fields:{},media:{reviewMScreenshot:value}}));
  assert.throws(()=>validatePagePayload('home','en',{fields:{review_m_quote:'x'.repeat(2501)}}));
  assert.throws(()=>validatePagePayload('home','en',{fields:{review_m_author:'x'.repeat(261)}}));
});

test('review drafts stay private, need media consent and translation review, and roll back to hidden',async()=>{
  const db=new MockD1();
  try{
    const old=await insertDraft(db,'home','en',{fields:{hero:'Owner headline'}},'owner',null);
    await publishDraft(db,'home','en',old,'owner');
    const content=validatePagePayload('home','en',{...defaults.en.home,testimonialsEnabled:true,media:{reviewYuraScreenshot:'approvedimage123'}});
    content.fields.hero='Owner headline';
    const draft=await insertDraft(db,'home','en',content,'owner',old);
    assert.equal((await published(db,'home','en')).id,old);
    await assert.rejects(()=>publishDraft(db,'home','en',draft,'owner'),e=>e.code==='MEDIA_APPROVAL_REQUIRED');
    await db.prepare("INSERT INTO media_assets(id,object_key,content_type,byte_size,alt_text,source,published,consent_confirmed,created_by) VALUES('approvedimage123','approved.png','image/png',12,'Cropped review','Test fixture',1,1,'owner')").run();
    await publishDraft(db,'home','en',draft,'owner');
    assert.equal((await published(db,'home','en')).payload.testimonialsEnabled,true);
    const ar=await insertDraft(db,'home','ar',validatePagePayload('home','ar',{...defaults.ar.home,testimonialsEnabled:true}),'owner',null);
    await assert.rejects(()=>publishDraft(db,'home','ar',ar,'owner'),e=>e.code==='REVIEW_REQUIRED');
    await markReviewed(db,'home','ar',ar,'owner');await publishDraft(db,'home','ar',ar,'owner');
    await rollBack(db,'home','en',old,'owner');
    assert.equal((await published(db,'home','en')).payload.testimonialsEnabled,undefined);
    assert.equal((await published(db,'home','en')).payload.fields.hero,'Owner headline');
  }finally{db.close();}
});

test('published media without publication consent is not publicly readable',async()=>{
  const db=new MockD1();
  try{
    await db.prepare("INSERT INTO media_assets(id,object_key,content_type,byte_size,alt_text,source,published,consent_confirmed,created_by) VALUES('unapproved123','private.png','image/png',12,'Private','Test fixture',1,0,'owner')").run();
    let reads=0;
    const response=await worker.fetch(new Request('https://nozha-badavi.com/media/unapproved123'),{DB:db,MEDIA:{get(){reads++;throw Error('Private media must not be read');}}},{});
    assert.equal(response.status,404);assert.equal(reads,0);
  }finally{db.close();}
});

test('smoke cleanup restores an unpublished owner draft and refuses concurrent changes',async()=>{
 const db=new MockD1();
 const ownerDraft=validatePagePayload('home','en',{fields:{hero:'Unpublished owner work',review_yura_quote:'Owner draft excerpt'},testimonialsEnabled:false});
 const admin=async(path,opts={})=>{
  if(opts.method==='PUT'){
   const body=JSON.parse(opts.body);
   try{const id=await insertDraft(db,'home','en',validatePagePayload('home','en',body.payload),'test',body.baseRevision);return{status:200,body:{ok:true,revision:id}};}
   catch(error){return{status:error.status||409,body:{ok:false}};}
  }
  const current=await state(db,'home','en');
  return{status:200,body:{draftRevision:current.draft_revision,publishedRevision:current.published_revision,draft:(await revision(db,current.draft_revision)).payload}};
 };
 try{
  const original=await insertDraft(db,'home','en',{fields:{hero:'Published owner copy'}},'owner',null);await publishDraft(db,'home','en',original,'owner');
  const owner=await insertDraft(db,'home','en',ownerDraft,'owner',original);
  const probe=await insertDraft(db,'home','en',{fields:{hero:'Synthetic smoke draft'},testimonialsEnabled:true},'test',owner);await publishDraft(db,'home','en',probe,'test');
  await rollBack(db,'home','en',original,'test');
  const restored=await restoreHomepageDraft(admin,ownerDraft,probe);
  assert.deepEqual(restored.draft.fields,ownerDraft.fields);assert.deepEqual(restored.draft.media,ownerDraft.media);assert.equal(restored.draft.testimonialsEnabled,false);assert.equal(restored.publishedRevision,original);
  const concurrent=await insertDraft(db,'home','en',{fields:{hero:'New concurrent owner work'}},'owner',restored.draftRevision);
  await assert.rejects(()=>restoreHomepageDraft(admin,ownerDraft,probe),/concurrent edit/);
  assert.equal((await state(db,'home','en')).draft_revision,concurrent);
  assert.equal((await revision(db,concurrent)).payload.fields.hero,'New concurrent owner work');
 }finally{db.close();}
});
