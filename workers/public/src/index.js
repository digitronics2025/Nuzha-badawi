import {json,problem,errorResponse,HttpError,readJson,corsSameOrigin,secureHeaders,isLocale,isPageKey} from '../../shared/http.js';
import {validateEnquiry} from '../../shared/validation.js';
import {settings,published} from '../../shared/store.js';
import {renderPublished} from '../../shared/render.js';
import {flushOutbox} from '../../shared/notify.js';
import {bundledAssets} from '../../shared/assets.js';
import STATIC from './static-assets.generated.js';

const BUNDLED=bundledAssets(STATIC,{notFound:'/404.html'});

const encoder=new TextEncoder();
async function sha256(value){const bytes=await crypto.subtle.digest('SHA-256',encoder.encode(value));return [...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');}
async function ipHash(ip,secret){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const out=await crypto.subtle.sign('HMAC',key,encoder.encode(ip));return [...new Uint8Array(out)].map(v=>v.toString(16).padStart(2,'0')).join('');}
function getServiceId(q){if(q.type==='lesson')return q.details.language;return q.type;}
function formResponse(reference,status='pending'){return json({ok:true,reference,acceptedAt:new Date().toISOString(),notificationStatus:status},201);}
async function verifyTurnstile(token,request,env){
 if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)throw new HttpError(503,'SERVICE_UNAVAILABLE','Contact verification is not configured.');
 if(typeof token!=='string'||token.length<5||token.length>2048)throw new HttpError(400,'BOT_CHECK_FAILED','Complete the security challenge.');
 const form=new FormData();form.append('secret',env.TURNSTILE_SECRET);form.append('response',token);
 const ip=request.headers.get('cf-connecting-ip');if(ip)form.append('remoteip',ip);
 let result;try{const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form,signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('unavailable');result=await response.json();}catch{throw new HttpError(503,'SERVICE_UNAVAILABLE','Security verification is temporarily unavailable.');}
 const testKey=result.metadata?.result_with_testing_key===true;
 if(testKey&&env.TURNSTILE_ALLOW_TEST_KEYS!=='true')throw new HttpError(400,'BOT_CHECK_FAILED','Security verification failed. Try again.');
 if(result.success!==true||(result.action!=='nusya_enquiry'&&!testKey)||result.hostname!==(env.TURNSTILE_EXPECTED_HOSTNAME||env.PUBLIC_HOST||'nozha-badavi.com'))throw new HttpError(400,'BOT_CHECK_FAILED','Security verification failed. Try again.');
}
async function createEnquiry(request,env,ctx){
 if(!env.DB)throw new HttpError(503,'SERVICE_UNAVAILABLE','The contact service is not configured.');
 const host=env.PUBLIC_HOST||'nozha-badavi.com';corsSameOrigin(request,host);
 const body=await readJson(request,12000),req=validateEnquiry(body);
 const key=req.idempotencyKey;
 const canonical={...req};const digest=await sha256(JSON.stringify(canonical));
 const existing=await env.DB.prepare('SELECT reference,request_hash FROM enquiries WHERE idempotency_key=?').bind(key).first();
 if(existing){if(existing.request_hash!==digest)throw new HttpError(409,'EDIT_CONFLICT','Submission reference was already used for another request.');return formResponse(existing.reference);}
 const conf=await settings(env.DB),serviceId=getServiceId(req);
 if(!conf.services[serviceId]?.visible||!conf.services[serviceId]?.acceptingRequests)throw new HttpError(409,'SERVICE_UNAVAILABLE','This service is not currently accepting online enquiries.');
 if(req.type==='translation'||req.type==='interpretation'){
   const pair=req.details.sourceLanguage+':'+req.details.targetLanguage;
   if(!conf.approvedTranslationPairs.includes(pair))throw new HttpError(400,'VALIDATION_FAILED','This language direction is not currently offered.',{languagePair:'Choose an approved language direction.'});
 }
 await verifyTurnstile(body.turnstileToken,request,env);
 const ip=request.headers.get('cf-connecting-ip');if(!ip||!env.RATE_LIMIT_SALT)throw new HttpError(503,'SERVICE_UNAVAILABLE','Contact protection is not configured.');
 const hash=await ipHash(ip,env.RATE_LIMIT_SALT),bucket=Math.floor(Date.now()/900000);
 const rate=await env.DB.prepare('INSERT INTO rate_buckets(hashed_ip,time_bucket,hits) VALUES(?,?,1) ON CONFLICT(hashed_ip,time_bucket) DO UPDATE SET hits=hits+1 RETURNING hits').bind(hash,bucket).first();
 if(rate.hits>5)throw new HttpError(429,'RATE_LIMITED','Too many requests. Please try later.');
 const reference='NS-'+crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase();
 try{
   await env.DB.batch([
     env.DB.prepare('INSERT INTO enquiries(reference,idempotency_key,request_hash,ip_hash,locale,type,name,email,message,details_json) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(reference,key,digest,hash,req.locale,req.type,req.name,req.email,req.message,JSON.stringify(req.details)),
     env.DB.prepare('INSERT INTO notification_outbox(reference) VALUES(?)').bind(reference)
   ]);
 }catch(e){
   const repeat=await env.DB.prepare('SELECT reference,request_hash FROM enquiries WHERE idempotency_key=?').bind(key).first();
   if(repeat){if(repeat.request_hash!==digest)throw new HttpError(409,'EDIT_CONFLICT','Submission reference was already used.');return formResponse(repeat.reference);}
   throw e;
 }
 if(ctx?.waitUntil)ctx.waitUntil(flushOutbox(env.DB,env,reference));
 return formResponse(reference);
}
function publicSecurity(response,env={}){const r=secureHeaders(response);const h=new Headers(r.headers);
 if(env.PUBLIC_HOST?.endsWith('.workers.dev'))h.set('x-robots-tag','noindex, nofollow');
 h.set('strict-transport-security','max-age=31536000; includeSubDomains');
 h.set('content-security-policy',"default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://player.vimeo.com https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; frame-ancestors 'none'; upgrade-insecure-requests");
 return new Response(r.body,{status:r.status,headers:h});
}
async function serveMedia(request,env){
 const id=new URL(request.url).pathname.split('/')[2]||'';if(!/^[a-z0-9_-]{10,80}$/i.test(id)||!env.MEDIA||!env.DB)return problem(404,'NOT_FOUND','Asset not found.');
 const row=await env.DB.prepare('SELECT object_key,content_type FROM media_assets WHERE id=? AND published=1').bind(id).first();if(!row)return problem(404,'NOT_FOUND','Asset not found.');
 const obj=await env.MEDIA.get(row.object_key);if(!obj)return problem(404,'NOT_FOUND','Asset not found.');
 return new Response(obj.body,{headers:{'content-type':row.content_type,'cache-control':'public, max-age=300, s-maxage=300','x-content-type-options':'nosniff'}});
}
function pageFromPath(path){const match=path.match(/^\/(uk|en|ar|ru)\/(about|lessons|coaching|translation|contact|privacy)?\/?$/);if(!match)return null;return {locale:match[1],key:match[2]||'home'};}
async function servePublished(request,env,ctx){
 const parsed=pageFromPath(new URL(request.url).pathname);
 if(!parsed||!env.ASSETS)return env.ASSETS?env.ASSETS.fetch(request):problem(503,'SERVICE_UNAVAILABLE','Static assets are not configured.');
 const cache=globalThis.caches?.default;
 const cacheKey=new Request('https://nusya-cache.local'+new URL(request.url).pathname);
 if(cache){const saved=await cache.match(cacheKey);if(saved)return publicSecurity(saved,env);}
 const asset=await env.ASSETS.fetch(request);if(!asset.ok||!asset.headers.get('content-type')?.includes('text/html'))return publicSecurity(asset,env);
 if(!env.DB)return publicSecurity(asset,env);
 const conf=await settings(env.DB),revision=await published(env.DB,parsed.key,parsed.locale);
 let html=renderPublished(asset,revision?.payload||{},conf,{locale:parsed.locale,turnstileSiteKey:parsed.key==='contact'?env.TURNSTILE_SITE_KEY:null});
 const h=new Headers(html.headers);h.set('cache-control','public, max-age=0, s-maxage=90');h.set('content-type','text/html; charset=utf-8');
 html=new Response(html.body,{status:200,headers:h});
 if(cache&&ctx?.waitUntil&&request.method==='GET')ctx.waitUntil(cache.put(cacheKey,html.clone()));
 return publicSecurity(html,env);
}
/** `/` sends visitors to their preferred supported locale (Ukrainian default); never cached across languages. */
export function preferredLocale(header){
 const prefs=String(header||'').split(',').map((part,i)=>{const [tag,...params]=part.trim().toLowerCase().split(';');const q=params.find(x=>x.trim().startsWith('q='));return {lang:tag.split('-')[0],q:q?Number(q.trim().slice(2))||0:1,i};}).filter(x=>x.lang&&x.q>0).sort((a,b)=>b.q-a.q||a.i-b.i);
 return prefs.find(x=>['uk','en','ar','ru'].includes(x.lang))?.lang||'uk';
}
function rootRedirect(request){const loc=preferredLocale(request.headers.get('accept-language'));return new Response(null,{status:302,headers:{location:`/${loc}/`,'cache-control':'private, no-store','vary':'accept-language'}});}
async function maintenance(env){
 if(!env.DB)return;
 // Rate-limit buckets are 15-minute windows; anything older than a day is useless.
 await env.DB.prepare('DELETE FROM rate_buckets WHERE time_bucket<?').bind(Math.floor(Date.now()/900000)-96).run();
 if(env.ENABLE_OUTBOX_CRON==='true')await flushOutbox(env.DB,env);
}
const worker={
 async fetch(request,env,ctx){try{
  if(!env.ASSETS)env={...env,ASSETS:BUNDLED};
  const url=new URL(request.url),p=url.pathname;
  if(p==='/api/v1/config'&&request.method==='GET'){
    const conf=env.DB?await settings(env.DB):null;
    return json({ok:true,ready:!!(env.DB&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&env.RATE_LIMIT_SALT),turnstileSiteKey:env.TURNSTILE_SITE_KEY||null,services:conf?.services||{},approvedTranslationPairs:conf?.approvedTranslationPairs||[]});
  }
  if(p==='/api/v1/enquiries'){
    if(request.method!=='POST')throw new HttpError(405,'METHOD_NOT_ALLOWED','Method not allowed.');
    return await createEnquiry(request,env,ctx);
  }
  if(p.startsWith('/api/'))return problem(404,'NOT_FOUND','API endpoint not found.');
  if(p.startsWith('/media/')){if(request.method!=='GET'&&request.method!=='HEAD')throw new HttpError(405,'METHOD_NOT_ALLOWED','Method not allowed.');return await serveMedia(request,env);}
  if(request.method!=='GET'&&request.method!=='HEAD')throw new HttpError(405,'METHOD_NOT_ALLOWED','Method not allowed.');
  if(p==='/'||p==='/index.html')return rootRedirect(request);
  return await servePublished(request,env,ctx);
 }catch(e){return errorResponse(e);}},
 async scheduled(event,env,ctx){ctx.waitUntil(maintenance(env));}
};
export default worker;
