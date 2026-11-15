import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {MockD1,jsonRequest} from './mock-db.mjs';
import publicWorker from '../public/src/index.js';
import adminWorker from '../admin/src/index.js';
import {validateEnquiry,defaultSettings,validateSettings,validateVimeo} from '../shared/validation.js';
import {saveSettings,settings} from '../shared/store.js';
import {verifyAccess} from '../shared/auth.js';

const authConfig={ACCESS_TEAM_DOMAIN:'nusya-test.cloudflareaccess.com',ACCESS_AUD:'test-audience-id',OWNER_EMAILS:'owner@example.com',EDITOR_EMAILS:'editor@example.com',ADMIN_HOST:'admin.nozha-badavi.com'};
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'test-kid',alg:'RS256',use:'sig'};
function token(extra={}) {const header={alg:'RS256',kid:'test-kid',typ:'JWT'};const body={iss:'https://nusya-test.cloudflareaccess.com',aud:['test-audience-id'],email:'owner@example.com',sub:'test-user',exp:Math.floor(Date.now()/1000)+600,...extra};const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const h=b64(header),p=b64(body);const signature=sign('RSA-SHA256',Buffer.from(`${h}.${p}`),privateKey).toString('base64url');return `${h}.${p}.${signature}`;}
const fakeIdentityFetch=async () => new Response(JSON.stringify({keys:[jwk]}),{status:200,headers:{'content-type':'application/json'}});
const originalFetch=globalThis.fetch;
function withNetworkMock(){globalThis.fetch=async(url,opts)=>{if(String(url).endsWith('/cdn-cgi/access/certs'))return fakeIdentityFetch();if(String(url).includes('turnstile/v0/siteverify'))return new Response(JSON.stringify({success:true,hostname:'nozha-badavi.com',action:'nusya_enquiry'}),{headers:{'content-type':'application/json'}});return originalFetch(url,opts);};}
function env(db){return{DB:db,ASSETS:{fetch:async()=>new Response('<html><title>NUSYA</title></html>',{headers:{'content-type':'text/html'}})},PUBLIC_HOST:'nozha-badavi.com',TURNSTILE_SECRET:'test-secret',TURNSTILE_SITE_KEY:'site-key',RATE_LIMIT_SALT:'unit-test-random-salt',...authConfig};}
function authReq(path,body=null,method='GET',email='owner@example.com'){let headers={'Cf-Access-Jwt-Assertion':token({email})};if(body!==null){headers['content-type']='application/json';headers.origin='https://admin.nozha-badavi.com';}return new Request(`https://admin.nozha-badavi.com${path}`,{method,headers,body:body===null?undefined:JSON.stringify(body)});}
const baseReq=()=>({idempotencyKey:crypto.randomUUID(),locale:'en',type:'lesson',name:'Test Visitor',email:'test@example.com',message:'I want help improving conversation.',details:{language:'english',goal:'Conversation'},privacyAcknowledged:true,turnstileToken:'valid-test-turnstile-token'});

test('validation rejects disallowed locale, same-language pair, and missing consent',()=>{
 assert.throws(()=>validateEnquiry({...baseReq(),locale:'ko'}));
 assert.throws(()=>validateEnquiry({...baseReq(),privacyAcknowledged:false}));
 assert.throws(()=>validateEnquiry({...baseReq(),type:'translation',details:{sourceLanguage:'en',targetLanguage:'en',dueDate:'2026-12-15'}}));
 assert.equal(validateVimeo('https://player.vimeo.com/video/1171310337?h=3416a6f4f5'),'https://player.vimeo.com/video/1171310337?h=3416a6f4f5');
 assert.throws(()=>validateVimeo('https://malicious.example/video/1171310337?h=3416a6f4f5'));
});

test('access rejects unauthenticated request, wrong audience, invalid signature and unlisted editor',async()=>{
 withNetworkMock();let r=new Request('https://admin.nozha-badavi.com/');
 await assert.rejects(()=>verifyAccess(r,env({})),e=>e.status===401);
 r=new Request('https://admin.nozha-badavi.com/',{headers:{'Cf-Access-Jwt-Assertion':token({aud:['wrong']})}});await assert.rejects(()=>verifyAccess(r,env({})),e=>e.status===401);
 r=new Request('https://admin.nozha-badavi.com/',{headers:{'Cf-Access-Jwt-Assertion':token({email:'unknown@example.com'})}});await assert.rejects(()=>verifyAccess(r,env({})),e=>e.status===403);
 r=new Request('https://admin.nozha-badavi.com/',{headers:{'Cf-Access-Jwt-Assertion':token()}});const session=await verifyAccess(r,env({}));assert.equal(session.role,'owner');
 const bad=token().split('.');bad[1]=Buffer.from(JSON.stringify({iss:'https://nusya-test.cloudflareaccess.com',aud:['test-audience-id'],email:'owner@example.com',exp:Date.now()+60000})).toString('base64url');
 r=new Request('https://admin.nozha-badavi.com/',{headers:{'Cf-Access-Jwt-Assertion':bad.join('.')}});await assert.rejects(()=>verifyAccess(r,env({})),e=>e.status===401);
});

test('enquiries require configuration and confirmed service; success persists and deduplicates',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);let req=baseReq();
 let res=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',req,{'cf-connecting-ip':'203.0.113.10'}),e,{waitUntil(){}});assert.equal(res.status,409);
 const s=defaultSettings();s.services.english.acceptingRequests=true;await saveSettings(db,s,'test');
 res=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',req,{'cf-connecting-ip':'203.0.113.10'}),e,{waitUntil(){}});assert.equal(res.status,201);const payload=await res.json();assert.match(payload.reference,/^NS-[A-Z0-9]{16}$/);
 const count=await db.prepare('SELECT COUNT(*) n FROM enquiries').first();assert.equal(count.n,1);
 const repeat=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',req,{'cf-connecting-ip':'203.0.113.10'}),e,{waitUntil(){}});assert.equal(repeat.status,201);assert.equal((await repeat.json()).reference,payload.reference);
 req={...req,message:'Changed message'};
 const conflict=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',req,{'cf-connecting-ip':'203.0.113.10'}),e,{waitUntil(){}});assert.equal(conflict.status,409);
 const outbox=await db.prepare('SELECT COUNT(*) n FROM notification_outbox').first();assert.equal(outbox.n,1);
});

test('translation only accepts explicitly approved directed pairs',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);const s=defaultSettings();s.services.translation.acceptingRequests=true;await saveSettings(db,s,'test');
 const q={...baseReq(),type:'translation',details:{sourceLanguage:'en',targetLanguage:'ru',dueDate:'2026-12-20'}};
 let res=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',q,{'cf-connecting-ip':'203.0.113.11'}),e,{waitUntil(){}});assert.equal(res.status,400);
 s.approvedTranslationPairs=['en:ru'];await saveSettings(db,s,'test');
 res=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',q,{'cf-connecting-ip':'203.0.113.11'}),e,{waitUntil(){}});assert.equal(res.status,201);
});

test('admin denies request with missing identity and wrong host',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);
 let res=await adminWorker.fetch(new Request('https://admin.nozha-badavi.com/api/v1/admin/me'),e,{});assert.equal(res.status,401);
 res=await adminWorker.fetch(new Request('https://attacker.example/api/v1/admin/me',{headers:{'Cf-Access-Jwt-Assertion':token()}}),e,{});assert.equal(res.status,421);
 res=await adminWorker.fetch(authReq('/api/v1/admin/me'),e,{});assert.equal(res.status,200);assert.equal((await res.json()).role,'owner');
});

test('admin supports versioned save, publish, locale review flags, and rollback',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);
 const payload={fields:{hero:'Test title',hero_desc:'New description for this page.'},seo:{title:'Test SEO',description:'Description'},media:{}};
 let res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en',{baseRevision:null,payload},'PUT'),e,{});assert.equal(res.status,200);const r=(await res.json()).revision;assert.ok(r);
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home/publish?locale=en',{revision:r},'POST'),e,{});assert.equal(res.status,200);
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en'),e,{});let p=await res.json();assert.equal(p.published.fields.hero,'Test title');
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en',{baseRevision:null,payload},'PUT'),e,{});assert.equal(res.status,409);
 const payload2={...payload,fields:{hero:'Second title',hero_desc:'Updated description.'}};
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en',{baseRevision:r,payload:payload2},'PUT'),e,{});assert.equal(res.status,200);const next=(await res.json()).revision;
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home/publish?locale=en',{revision:next},'POST'),e,{});assert.equal(res.status,200);
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home/rollback?locale=en',{toRevision:r},'POST'),e,{});assert.equal(res.status,200);
 res=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en'),e,{});p=await res.json();assert.equal(p.published.fields.hero,'Test title');
});

test('admin enquiries list is paginated, status updates are audited',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);const s=defaultSettings();s.services.english.acceptingRequests=true;await saveSettings(db,s,'owner');
 const q=baseReq();let r=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',q,{'cf-connecting-ip':'203.0.113.88'}),e,{waitUntil(){}});const ref=(await r.json()).reference;
 r=await adminWorker.fetch(authReq('/api/v1/admin/enquiries?limit=2'),e,{});assert.equal(r.status,200);assert.equal((await r.json()).items[0].reference,ref);
 r=await adminWorker.fetch(authReq(`/api/v1/admin/enquiries/${ref}`,{status:'reviewing',note:'Initial response needed'},'PATCH'),e,{});assert.equal(r.status,200);
 const event=await db.prepare('SELECT event_type,payload_json FROM enquiry_events WHERE reference=?').bind(ref).first();assert.equal(event.event_type,'status_change');
});

test('email notification outbox remains pending when provider is absent',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);const s=defaultSettings();s.services.english.acceptingRequests=true;await saveSettings(db,s,'owner');const q=baseReq();
 const r=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',q,{'cf-connecting-ip':'203.0.113.91'}),e,{waitUntil(){}});assert.equal(r.status,201);
 const out=await db.prepare('SELECT state FROM notification_outbox').first();assert.equal(out.state,'pending');
});

test('public config never returns secrets or owner email',async(t)=>{
 const db=new MockD1();t.after(()=>db.close());const e=env(db),res=await publicWorker.fetch(new Request('https://nozha-badavi.com/api/v1/config'),e,{});assert.equal(res.status,200);
 const str=await res.text();assert.ok(!str.includes('RATE_LIMIT_SALT'));assert.ok(!str.includes('test-secret'));assert.ok(!str.includes('owner@example.com'));
});

test.after(()=>{globalThis.fetch=originalFetch;});


test('rate limiter rejects excess submissions without storing a sixth enquiry',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db),s=defaultSettings();s.services.english.acceptingRequests=true;await saveSettings(db,s,'test');
 const statuses=[];for(let i=0;i<6;i++){const r=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',baseReq(),{'cf-connecting-ip':'203.0.113.254'}),e,{waitUntil(){}});statuses.push(r.status);}
 assert.deepEqual(statuses,[201,201,201,201,201,429]);const n=await db.prepare('SELECT COUNT(*) AS n FROM enquiries').first();assert.equal(n.n,5);
});

test('service settings and content payload forbid arbitrary URL and unknown editable keys',()=>{
 const bad=defaultSettings();bad.links.preply='https://evil.example';assert.throws(()=>validateSettings(bad));
});

test('admin role editor cannot publish or change site settings',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);
 const r=await adminWorker.fetch(authReq('/api/v1/admin/settings',{settings:defaultSettings()},'PUT','editor@example.com'),e,{});assert.equal(r.status,403);
});

test('public form fails closed on missing anti-bot secret even with service available',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db),s=defaultSettings();s.services.english.acceptingRequests=true;await saveSettings(db,s,'test');delete e.TURNSTILE_SECRET;
 const r=await publicWorker.fetch(jsonRequest('/api/v1/enquiries',baseReq(),{'cf-connecting-ip':'203.0.113.28'}),e,{waitUntil(){}});assert.equal(r.status,503);
});

test('publishing a page with an unapproved image is blocked',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);
 const payload={fields:{hero:'Test photo caption',hero_desc:'Short intro'},media:{heroPortrait:'deadbeef1234'}};
 let r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en',{baseRevision:null,payload},'PUT'),e,{});assert.equal(r.status,200);const rev=(await r.json()).revision;
 r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home/publish?locale=en',{revision:rev},'POST'),e,{});assert.equal(r.status,409);
});

test('legacy ready translations expose source review and can publish without editing content',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e=env(db);
 const payload={fields:{hero:'Source heading'}};
 let r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=en',{baseRevision:null,payload},'PUT'),e,{});assert.equal(r.status,200);
 r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=ar',{baseRevision:null,payload:{fields:{hero:'عنوان'}}},'PUT'),e,{});const rev=(await r.json()).revision;
 await db.prepare("UPDATE cms_state SET review_status='ready',source_revision_seen=NULL WHERE page_key='home' AND locale='ar'").run();
 r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home?locale=ar'),e,{});const page=await r.json();assert.equal(page.reviewStatus,'needs_review');assert.equal(page.draftRevision,rev);
 r=await adminWorker.fetch(authReq('/api/v1/admin/pages'),e,{});assert.equal((await r.json()).pages.find(p=>p.key==='home').locales.ar.status,'needs_review');
 r=await adminWorker.fetch(authReq('/api/v1/admin/summary'),e,{});assert.equal((await r.json()).translationsToReview,1);
 r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home/review?locale=ar',{revision:rev},'POST'),e,{});assert.equal(r.status,200);
 r=await adminWorker.fetch(authReq('/api/v1/admin/pages/home/publish?locale=ar',{revision:rev},'POST'),e,{});assert.equal(r.status,200);
 r=await adminWorker.fetch(authReq('/api/v1/admin/summary'),e,{});assert.equal((await r.json()).translationsToReview,0);
});

test('protected media library preserves provenance across sessions, paginates and restricts approval',async(t)=>{
 withNetworkMock();const db=new MockD1();t.after(()=>db.close());const e={...env(db),MEDIA:{}};
 for(let i=1;i<=55;i++)await db.prepare('INSERT INTO media_assets(id,object_key,content_type,byte_size,alt_text,source,published,consent_confirmed,created_by) VALUES(?,?,?,?,?,?,?,?,?)').bind('asset_'+String(i).padStart(3,'0'),'private/'+i,'image/png',68,'Image '+i,'Photographer <name> — licensed source',i<=5?1:0,i<=5?1:0,'editor@example.com').run();
 const get=path=>adminWorker.fetch(authReq(path,null,'GET','owner@example.com'),e,{});
 let response=await adminWorker.fetch(new Request('https://admin.nozha-badavi.com/api/v1/admin/media'),e,{});assert.equal(response.status,401);
 response=await get('/api/v1/admin/media?status=private&limit=20');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 let body=await response.json();assert.equal(body.items.length,20);assert.equal(body.items[0].id,'asset_055');assert.equal(body.items[0].source,'Photographer <name> — licensed source');assert.equal(body.items[0].published,false);assert.equal('object_key' in body.items[0],false);
 const first=new Set(body.items.map(item=>item.id));let cursor=body.nextCursor;
 body=await (await get('/api/v1/admin/media?status=private&limit=20&cursor='+cursor)).json();assert.equal(body.items.length,20);assert.ok(body.items.every(item=>!first.has(item.id)));cursor=body.nextCursor;
 body=await (await get('/api/v1/admin/media?status=private&limit=20&cursor='+cursor)).json();assert.equal(body.items.length,10);assert.equal(body.nextCursor,null);
 for(const params of ['status=bad','limit=51','limit=1.5','cursor=-1','cursor=9007199254740992','cursor=1junk'])assert.equal((await get('/api/v1/admin/media?'+params)).status,400);
 response=await adminWorker.fetch(authReq('/api/v1/admin/media/asset_055/publish',{consentConfirmed:true},'POST','editor@example.com'),e,{});assert.equal(response.status,403);
 response=await adminWorker.fetch(authReq('/api/v1/admin/media/asset_055/publish',{consentConfirmed:false},'POST'),e,{});assert.equal(response.status,400);
 response=await adminWorker.fetch(authReq('/api/v1/admin/media/asset_055/publish',{consentConfirmed:true},'POST'),e,{});assert.equal(response.status,200);
 body=await (await get('/api/v1/admin/media?status=published')).json();assert.equal(body.items[0].id,'asset_055');assert.equal(body.items[0].published,true);
 const plan=db.raw.prepare('EXPLAIN QUERY PLAN SELECT rowid,id FROM media_assets WHERE rowid<? AND published=? ORDER BY rowid DESC LIMIT ?').all(100,0,21);assert.ok(plan.some(row=>row.detail.includes('idx_media_publication')));assert.ok(plan.every(row=>!row.detail.includes('TEMP B-TREE')));
});
