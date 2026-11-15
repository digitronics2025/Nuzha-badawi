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
 assert.equal(r.status,200);assert.equal(r.headers.get('etag'),null);assert.match(await r.text(),/Native runtime CMS heading/);
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/index.html?x=1',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),'/en/?x=1');
 r=await runtime.dispatchFetch('https://nozha-badavi.com/en/',{method:'HEAD'});assert.equal(await r.text(),'');
 for(const locale of ['uk','en','ar','ru']){r=await runtime.dispatchFetch(`https://nozha-badavi.com/${locale}/`);assert.equal(r.status,200);assert.match(await r.text(),new RegExp(`lang="${locale}"`));}
 console.log('Native HTMLRewriter, D1 migrations, CMS rendering, conditional requests, canonical redirects, HEAD and four locales: PASS');
}finally{await runtime.dispose();}
