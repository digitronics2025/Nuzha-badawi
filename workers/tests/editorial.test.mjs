import test from 'node:test';
import assert from 'node:assert/strict';
import {MockD1} from './mock-db.mjs';
import {counts} from '../shared/store.js';
import {fieldSchema} from '../shared/content-schema.js';
import defaults from '../shared/defaults.js';
import {validatePagePayload} from '../shared/validation.js';

test('dashboard publication is absent until an audited publish, then follows successful restoration',async()=>{
 const db=new MockD1();
 try{
  assert.deepEqual(await counts(db),{openEnquiries:0,translationsToReview:0,lastPublication:null});
  await db.prepare("INSERT INTO admin_audit(actor,action,target,revision) VALUES('private@example.invalid','save_draft','home:uk',1)").run();
  assert.equal((await counts(db)).lastPublication,null);
  await db.prepare("INSERT INTO admin_audit(actor,action,target,revision) VALUES('private@example.invalid','publish','home:uk',2)").run();
  let last=(await counts(db)).lastPublication;
  assert.deepEqual(Object.keys(last).sort(),['action','locale','occurredAt','pageKey','revision']);
  assert.equal(last.locale,'uk');assert.equal(last.revision,2);assert.equal(last.action,'publish');
  await db.prepare("INSERT INTO admin_audit(actor,action,target,revision) VALUES('private@example.invalid','rollback','home:ar',1)").run();
  last=(await counts(db)).lastPublication;
  assert.equal(last.locale,'ar');assert.equal(last.action,'rollback');assert.equal(last.revision,1);
 }finally{db.close();}
});

test('infographic fields remain bounded, localized and compatible with partial historical revisions',()=>{
 for(const locale of ['uk','en','ar','ru']){
  const schema=fieldSchema(locale,'home');
  assert.ok(Object.keys(schema).length<=65);
  assert.equal(schema.journey_3_date.maxLength,60);
  assert.equal(schema.journey_3_body.group,'Experience timeline');
  assert.equal(schema.faq_0_question.multiline,false);
  assert.equal(schema.process_0_body.multiline,true);
  assert.doesNotThrow(()=>validatePagePayload('home',locale,{fields:{hero:'Owner override'},seo:{},media:{}}));
  assert.equal(defaults[locale].home.fields.hero.length>0,true);
  assert.throws(()=>validatePagePayload('home',locale,{fields:{journey_3_date:'x'.repeat(61)}}));
 }
});
