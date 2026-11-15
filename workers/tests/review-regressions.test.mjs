import test from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../shared/defaults.js';
import {validatePagePayload} from '../shared/validation.js';
import {insertDraft,publishDraft,rollBack,markReviewed,state} from '../shared/store.js';
import {MockD1} from './mock-db.mjs';
import worker from '../public/src/index.js';
import {bundledAssets} from '../shared/assets.js';

test('all 28 shipped content payloads can be saved and still enforce bounds',()=>{
 for(const [loc,pages] of Object.entries(defaults))for(const [page,payload] of Object.entries(pages))assert.doesNotThrow(()=>validatePagePayload(page,loc,payload),`${loc}/${page}`);
 assert.throws(()=>validatePagePayload('home','en',{fields:{hero:'x'.repeat(261)}}));
 assert.throws(()=>validatePagePayload('about','en',{fields:{story_body:'x'.repeat(2501)}}));
});
test('rollback only restores published content and rechecks media consent',async()=>{
 const db=new MockD1();try{
 const a=await insertDraft(db,'home','en',{fields:{hero:'First release'}},'owner',null);
 await assert.rejects(()=>rollBack(db,'home','en',a,'owner'),e=>e.code==='PUBLICATION_REQUIRED');
 await publishDraft(db,'home','en',a,'owner');
 const b=await insertDraft(db,'home','en',{fields:{hero:'Second release'}},'owner',a);
 await publishDraft(db,'home','en',b,'owner');
 await rollBack(db,'home','en',a,'owner');assert.equal((await state(db,'home','en')).published_revision,a);
 db.raw.prepare('UPDATE cms_revisions SET payload_json=? WHERE id=?').run(JSON.stringify({media:{heroPortrait:'unapproved123'}}),a);
 await assert.rejects(()=>rollBack(db,'home','en',a,'owner'),e=>e.code==='MEDIA_APPROVAL_REQUIRED');
 }finally{db.close();}
});
test('translation edits stay unreviewed and Ukrainian persists through full schema',async()=>{
 const db=new MockD1();try{
 let uk=await insertDraft(db,'home','uk',{fields:{hero:'Українська'}},'owner',null);
 await assert.rejects(()=>publishDraft(db,'home','uk',uk,'owner'),e=>e.code==='REVIEW_REQUIRED');
 await markReviewed(db,'home','uk',uk,'reviewer');await publishDraft(db,'home','uk',uk,'owner');
 await insertDraft(db,'home','en',{fields:{hero:'Changed source'}},'owner',null);
 uk=await insertDraft(db,'home','uk',{fields:{hero:'Оновлено'}},'owner',uk);
 assert.equal((await state(db,'home','uk')).review_status,'needs_review');
 await assert.rejects(()=>publishDraft(db,'home','uk',uk,'owner'),e=>e.code==='REVIEW_REQUIRED');
 }finally{db.close();}
});
test('alternate page URLs redirect with query intact and every response has security headers',async()=>{
 for(const [path,target] of [['/en/index.html?x=1','/en/?x=1'],['/%65n/','/en/'],['/ar/contact/index.html','/ar/contact/'],['/uk/about','/uk/about/']]){
 const r=await worker.fetch(new Request('https://nozha-badavi.com'+path),{},{});assert.equal(r.status,308);assert.equal(r.headers.get('location'),target);assert.ok(r.headers.has('content-security-policy'));
 }
 for(const path of ['/404','/api/missing','/']){const r=await worker.fetch(new Request('https://nozha-badavi.com'+path),{},{});assert.ok(r.headers.has('strict-transport-security'));}
});
test('conditional HTML requests never bypass CMS and HEAD never returns a body',async()=>{
 const original=globalThis.HTMLRewriter;
 globalThis.HTMLRewriter=class{on(){return this;}transform(r){return r;}};
 const db=new MockD1();try{
 const assets=bundledAssets({'/en/index.html':{body:'<h1>template</h1>',type:'text/html'}});
 const staticRes=await assets.fetch(new Request('https://site/en/'));
 let reads=0;const counted={prepare(...args){reads++;return db.prepare(...args);}};
 const r=await worker.fetch(new Request('https://nozha-badavi.com/en/',{headers:{'if-none-match':staticRes.headers.get('etag')}}),{ASSETS:assets,DB:counted},{});
 assert.equal(r.status,200);assert.ok(reads>0);assert.equal(r.headers.get('etag'),null);
 const head=await worker.fetch(new Request('https://nozha-badavi.com/en/',{method:'HEAD'}),{ASSETS:assets,DB:db},{});assert.equal(await head.text(),'');
 }finally{db.close();globalThis.HTMLRewriter=original;}
});
