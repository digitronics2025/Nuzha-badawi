import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import files from '../public/src/static-assets.generated.js';
import {bundledAssets} from '../shared/assets.js';
import {pageSchema,safeJson} from '../shared/seo.js';
import worker from '../public/src/index.js';

test('bundling and serving preserve every binary byte, HEAD and validators',async()=>{
 const assets=bundledAssets(files,{notFound:'/404.html'});
 for(const [path,type] of [['/favicon.ico','image/x-icon'],['/apple-touch-icon.png','image/png'],['/assets/social-card-ar.png','image/png']]){
  assert.equal(typeof files[path].base64,'string',path+' must be binary');assert.equal(files[path].type,type);
 }
 for(const [path,file] of Object.entries(files).filter(([,v])=>v.base64!==undefined)){
  const r=await assets.fetch(new Request('https://site'+path+'?v=test'));
  assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),file.type);
  assert.deepEqual(Buffer.from(await r.arrayBuffer()),readFileSync(new URL('../../frontend/dist-public'+path,import.meta.url)));
  const head=await assets.fetch(new Request('https://site'+path,{method:'HEAD'}));assert.equal(await head.text(),'');assert.equal(head.headers.get('etag'),r.headers.get('etag'));
  const cached=await assets.fetch(new Request('https://site'+path,{headers:{'if-none-match':r.headers.get('etag')}}));assert.equal(cached.status,304);assert.equal(await cached.text(),'');
 }
 const manifest=await assets.fetch(new Request('https://site/site.webmanifest'));
 assert.equal(manifest.headers.get('content-type'),'application/manifest+json; charset=utf-8');assert.equal((await manifest.json()).start_url,'/uk/');
});
test('missing pages and direct error page are 404/noindex; APIs remain private',async()=>{
 for(const path of ['/404.html','/unknown/']){
  const r=await worker.fetch(new Request('https://nozha-badavi.com'+path),{},{});
  assert.equal(r.status,404);assert.match(r.headers.get('x-robots-tag'),/noindex/);
  const html=await r.text();assert.doesNotMatch(html,/rel="canonical"|hreflang=|nusya-schema/);
 }
 for(const path of ['/api/v1/config','/api/v1/admin/me']){
  const r=await worker.fetch(new Request('https://nozha-badavi.com'+path),{},{});
  assert.equal(r.headers.get('cache-control'),'no-store');assert.match(r.headers.get('x-robots-tag'),/noindex/);
 }
});
test('JSON-LD escapes closing script tags and contains only verified identity facts',()=>{
 const seo={title:'Title </script><img src=x> & "quote"',description:'Arabic العربية and Ukrainian Українська\u2028end'};
 const data=pageSchema('ar','about',seo),encoded=safeJson(data);
 assert.doesNotMatch(encoded,/<|>|&|\u2028/);assert.deepEqual(JSON.parse(encoded),data);
 assert.equal(data['@graph'][2].name,seo.title);assert.equal(data['@graph'][2].url,'https://nozha-badavi.com/ar/about/');
 assert.deepEqual(Object.keys(data['@graph'][1]).sort(),['@id','@type','name','url']);
});
