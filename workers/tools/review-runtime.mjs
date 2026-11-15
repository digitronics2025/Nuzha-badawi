// Native Workers runtime regression checks. Run after `wrangler deploy --dry-run --outdir <dir>`.
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const scriptPath=process.argv[2];
if(!scriptPath)throw Error('Provide the public dry-run bundle path');
const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:readFileSync(scriptPath,'utf8'),compatibilityDate:'2026-11-01',d1Databases:{DB:'review-db'},bindings:{PUBLIC_HOST:'nozha-badavi.com'}}));
try{
 const db=await runtime.getD1Database('DB');
 for(const file of readdirSync(new URL('../migrations/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort()){
  const sql=readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8').replace(/^--.*$/gm,'');
  await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 }
 await db.prepare("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES('home','en',?,'test')").bind(JSON.stringify({fields:{hero:'Native runtime CMS heading'}})).run();
 await db.prepare("INSERT INTO cms_state(page_key,locale,draft_revision,published_revision) VALUES('home','en',1,1)").run();
 let r=await runtime.dispatchFetch('https://nozha-badavi.com/en/',{headers:{'if-none-match':'old-template'}});
 assert.equal(r.status,200);assert.equal(r.headers.get('etag'),null);const home=await r.text();assert.match(home,/Native runtime CMS heading/);assert.doesNotMatch(home,/data-nusya-link="linkedin"/);
 await db.prepare("INSERT INTO site_settings(setting_key,value_json,updated_by) VALUES('site',?,'test')").bind(JSON.stringify({links:{linkedin:'https://www.linkedin.com/in/review'}})).run();
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/about/');assert.match(await r.text(),/https:\/\/www.linkedin.com\/in\/review/);
 await db.prepare("UPDATE site_settings SET value_json=? WHERE setting_key='site'").bind(JSON.stringify({links:{linkedin:''}})).run();
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/contact/');assert.doesNotMatch(await r.text(),/data-nusya-link="linkedin"/);
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/index.html?x=1',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),'/en/?x=1');
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/',{method:'HEAD'});assert.equal(await r.text(),'');
 for(const locale of ['uk','en','ar','ru']){r=await runtime.dispatchFetch(`https://nozha-badavi.com/${locale}/`);assert.equal(r.status,200);assert.match(await r.text(),new RegExp(`lang="${locale}"`));}
 for(const locale of ['uk','en','ar','ru']){
  for(const path of [`/${locale}/missing-page/`,`/${locale}/404.html`]){
   r=await runtime.dispatchFetch('https://nozha-badavi.com'+path);
   assert.equal(r.status,404);assert.match(await r.text(),new RegExp(`lang="${locale}"`));assert.match(r.headers.get('x-robots-tag'),/noindex/);
  }
 }
 r=await runtime.dispatchFetch('https://nozha-badavi.com/assets/fonts/body-400-latin.woff2');
 assert.equal(r.headers.get('content-type'),'font/woff2');assert.equal(new TextDecoder().decode((await r.arrayBuffer()).slice(0,4)),'wOF2');
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/translation/');
 const services=await r.text();assert.doesNotMatch(services,/data-nusya-enquiry="translation"/);assert.match(services,/Not accepting online enquiries/);
 // Old partial CMS revisions keep their override and use new infographic defaults.
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/');const infographic=await r.text();assert.match(infographic,/Native runtime CMS heading/);assert.match(infographic,/data-nusya-field="journey_3_body"/);
 console.log('Native HTMLRewriter, D1 migrations, CMS rendering, conditional requests, canonical redirects, HEAD and four locales: PASS');
}finally{await runtime.dispose();}
