import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyAccess} from '../shared/auth.js';
import {bundledAssets} from '../shared/assets.js';
import publicWorker,{preferredLocale} from '../public/src/index.js';

const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'k2',alg:'RS256'};
const env={ACCESS_TEAM_DOMAIN:'hardening.cloudflareaccess.com',ACCESS_AUD:'aud-1',OWNER_EMAILS:'owner@example.com'};
const fetcher=async()=>new Response(JSON.stringify({keys:[jwk]}),{headers:{'content-type':'application/json'}});
function token(body){const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');const h=b64({alg:'RS256',kid:'k2',typ:'JWT'}),p=b64({iss:'https://hardening.cloudflareaccess.com',aud:['aud-1'],exp:Math.floor(Date.now()/1000)+300,...body});return `${h}.${p}.${sign('RSA-SHA256',Buffer.from(`${h}.${p}`),privateKey).toString('base64url')}`;}
const req=t=>new Request('https://admin.nozha-badavi.com/',{headers:{'Cf-Access-Jwt-Assertion':t}});

test('service tokens are rejected unless explicitly listed, and accepted as owner when listed',async()=>{
 const t=token({common_name:'abc123.access'});
 await assert.rejects(()=>verifyAccess(req(t),env,fetcher),e=>e.status===403);
 const s=await verifyAccess(req(t),{...env,SERVICE_TOKEN_OWNERS:'abc123.access'},fetcher);
 assert.equal(s.role,'owner');assert.match(s.email,/^service-token:/);
 const asString=await verifyAccess(req(token({common_name:'abc123.access',aud:'aud-1'})),{...env,SERVICE_TOKEN_OWNERS:'abc123.access'},fetcher);assert.equal(asString.role,'owner');
 await assert.rejects(()=>verifyAccess(req(token({common_name:'abc123.access',aud:'aud-2'})),{...env,SERVICE_TOKEN_OWNERS:'abc123.access'},fetcher),e=>e.status===401);
 await assert.rejects(()=>verifyAccess(req(token({common_name:'other.access'})),{...env,SERVICE_TOKEN_OWNERS:'abc123.access'},fetcher),e=>e.status===403);
});

test('bundled asset shim resolves indexes, redirects, 404 page, HEAD and ETag',async()=>{
 const a=bundledAssets({'/en/index.html':{type:'text/html',body:'<h1>en</h1>'},'/assets/x.css':{type:'text/css',body:'a{}'},'/404.html':{type:'text/html',body:'missing'}},{notFound:'/404.html'});
 let r=await a.fetch(new Request('https://h/en/'));assert.equal(r.status,200);assert.equal(await r.text(),'<h1>en</h1>');
 r=await a.fetch(new Request('https://h/en'));assert.equal(r.status,307);assert.equal(r.headers.get('location'),'https://h/en/');
 r=await a.fetch(new Request('https://h/assets/x.css'));assert.match(r.headers.get('cache-control'),/max-age=3600/);
 const etag=r.headers.get('etag');r=await a.fetch(new Request('https://h/assets/x.css',{headers:{'if-none-match':etag}}));assert.equal(r.status,304);
 r=await a.fetch(new Request('https://h/en/',{method:'HEAD'}));assert.equal(r.status,200);assert.equal(await r.text(),'');
 r=await a.fetch(new Request('https://h/../etc'));assert.equal(r.status,404);assert.equal(await r.text(),'missing');
});

test('bundled binary WebP media is served byte-for-byte with correct headers',async()=>{
 const bytes=Uint8Array.from([82,73,70,70,4,0,0,0,87,69,66,80,0,255,128,42]);
 const bundled=bundledAssets({'/assets/picture.webp':{type:'image/webp',base64:Buffer.from(bytes).toString('base64')}});
 let response=await bundled.fetch(new Request('https://h/assets/picture.webp'));
 assert.equal(response.status,200);
 assert.equal(response.headers.get('content-type'),'image/webp');
 assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 assert.deepEqual(new Uint8Array(await response.arrayBuffer()),bytes);
 const etag=response.headers.get('etag');
 response=await bundled.fetch(new Request('https://h/assets/picture.webp',{method:'HEAD'}));
 assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,0);
 response=await bundled.fetch(new Request('https://h/assets/picture.webp',{headers:{'if-none-match':etag}}));
 assert.equal(response.status,304);assert.equal((await response.arrayBuffer()).byteLength,0);
});

test('root negotiates all four locales with Ukrainian as the default',async()=>{
 assert.equal(preferredLocale('ar-MA,ar;q=0.9,en;q=0.5'),'ar');
 assert.equal(preferredLocale('ko-KR,ru;q=0.8'),'ru');
 assert.equal(preferredLocale('fr-FR'),'uk');assert.equal(preferredLocale(''),'uk');
 assert.equal(preferredLocale('uk-UA,en;q=0.8'),'uk');
 assert.equal(preferredLocale('uk;q=0,en;q=0.8'),'en');
 assert.equal(preferredLocale('en;q=0.1,ru;q=0.9'),'ru');
 const r=await publicWorker.fetch(new Request('https://nozha-badavi.com/',{headers:{'accept-language':'ru'}}),{},{});
 assert.equal(r.status,302);assert.equal(r.headers.get('location'),'/ru/');assert.match(r.headers.get('cache-control'),/no-store/);
});

test('staging pages are noindex while production remains indexable',async()=>{
 for(const host of ['nusya-public-staging.digitronics-electro.workers.dev','nozha-badavi.com']){
  for(const [path,status] of [['/uk/',200],['/uk/index.html',308],['/404.html',200],['/missing/',404]]){
   const response=await publicWorker.fetch(new Request(`https://${host}${path}`),{PUBLIC_HOST:host},{});
   assert.equal(response.status,status);
   assert.equal(response.headers.get('x-robots-tag'),host.endsWith('.workers.dev')?'noindex, nofollow':null);
  }
 }
});

test('HEAD requests never populate the shared HTML cache',async()=>{
 const puts=[];globalThis.caches={default:{match:async()=>undefined,put:async(k,v)=>puts.push(k)}};
 globalThis.HTMLRewriter??=class{on(){return this;}transform(r){return r;}};
 const waits=[];const ctx={waitUntil:p=>waits.push(p)};
 const e={ASSETS:{fetch:async()=>new Response('<html></html>',{headers:{'content-type':'text/html'}})},DB:{prepare:()=>({bind(){return this;},first:async()=>null})}};
 await publicWorker.fetch(new Request('https://nozha-badavi.com/en/',{method:'HEAD'}),e,ctx);
 await Promise.all(waits);assert.equal(puts.length,0);
 await publicWorker.fetch(new Request('https://nozha-badavi.com/en/'),e,ctx);
 await Promise.all(waits);assert.equal(puts.length,1);
 delete globalThis.caches;
});
