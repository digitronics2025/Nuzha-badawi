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
 const seo={title:'Published "title" & </script><img src=x>',description:'Published description العربية Українська & <text> &copy;'};
 await db.prepare("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES('home','en',?,'test')").bind(JSON.stringify({fields:{hero:'Native runtime CMS heading'},seo})).run();
 await db.prepare("INSERT INTO cms_state(page_key,locale,draft_revision,published_revision) VALUES('home','en',1,1)").run();
 let r=await runtime.dispatchFetch('https://nozha-badavi.com/en/',{headers:{'if-none-match':'old-template'}});
 assert.equal(r.status,200);assert.equal(r.headers.get('etag'),null);const home=await r.text();assert.match(home,/Native runtime CMS heading/);assert.doesNotMatch(home,/data-nusya-link="linkedin"/);
 const graph=JSON.parse(home.match(/<script id="nusya-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(graph['@graph'][2].name,seo.title);assert.equal(graph['@graph'][2].description,seo.description);
 assert.match(home,/name="twitter:title" content="Published &quot;title&quot; &amp; &lt;\/script&gt;&lt;img src=x&gt;"/);
 assert.match(home,/name="twitter:description" content="Published description العربية Українська &amp; &lt;text&gt; &amp;copy;"/);
 assert.doesNotMatch(home,/<img src=x>/);
 await db.prepare("INSERT INTO site_settings(setting_key,value_json,updated_by) VALUES('site',?,'test')").bind(JSON.stringify({links:{linkedin:'https://www.linkedin.com/in/review'}})).run();
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/about/');assert.match(await r.text(),/https:\/\/www.linkedin.com\/in\/review/);
 await db.prepare("UPDATE site_settings SET value_json=? WHERE setting_key='site'").bind(JSON.stringify({links:{linkedin:''}})).run();
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/contact/');assert.doesNotMatch(await r.text(),/data-nusya-link="linkedin"/);
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/index.html?x=1',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),'/en/?x=1');
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/',{method:'HEAD'});assert.equal(await r.text(),'');
 for(const locale of ['uk','en','ar','ru'])for(const page of ['','about/','lessons/','coaching/','translation/','contact/','privacy/']){
  r=await runtime.dispatchFetch(`https://nozha-badavi.com/${locale}/${page}`);assert.equal(r.status,200);const html=await r.text();assert.match(html,new RegExp(`lang="${locale}"`));
  const schema=JSON.parse(html.match(/<script id="nusya-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(schema['@graph'][2].url,`https://nozha-badavi.com/${locale}/${page}`);
 }
 console.log('Native HTMLRewriter, D1 migrations, CMS SEO/Twitter/JSON-LD escaping, canonical redirects, HEAD and 28 pages: PASS');
}finally{await runtime.dispose();}
