#!/usr/bin/env node
// End-to-end smoke test against a deployed NUSYA environment.
//
//   PUBLIC_URL=https://... ADMIN_URL=https://... CF_ACCESS_CLIENT_ID=... CF_ACCESS_CLIENT_SECRET=... \
//   MODE=staging node tools/e2e-smoke.mjs
//
// MODE=staging   full write flow (enquiry with Turnstile test token, CMS publish/rollback, media).
// MODE=production read checks + rejection checks only; never writes customer-visible content.
// The Access service token must be listed in the admin Worker's SERVICE_TOKEN_OWNERS.
const {PUBLIC_URL,ADMIN_URL,CF_ACCESS_CLIENT_ID:ID,CF_ACCESS_CLIENT_SECRET:SECRET,MODE='production'}=process.env;
if(!PUBLIC_URL||!ADMIN_URL)throw Error('PUBLIC_URL and ADMIN_URL are required');
const results=[];let failed=0;
const check=(name,ok,detail='')=>{results.push(`${ok?'PASS':'FAIL'}  ${name}${detail?'  — '+detail:''}`);if(!ok)failed++;};
const auth=ID&&SECRET?{'CF-Access-Client-Id':ID,'CF-Access-Client-Secret':SECRET}:null;
// Staging promotes to production, so its admin/CMS/enquiry/media checks are mandatory, never silently skipped.
if(MODE==='staging'&&!auth){console.error('FAIL  staging mode requires CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET');process.exit(1);}
async function admin(path,opts={}){const r=await fetch(ADMIN_URL+path,{redirect:'manual',...opts,headers:{...auth,origin:ADMIN_URL,...(opts.body&&!(opts.body instanceof FormData)?{'content-type':'application/json'}:{}),...(opts.headers||{})}});
 const type=r.headers.get('content-type')||'';return {status:r.status,headers:r.headers,body:type.includes('json')?await r.json():await r.text()};}
async function pub(path,opts={}){const r=await fetch(PUBLIC_URL+path,{redirect:'manual',...opts});const type=r.headers.get('content-type')||'';return {status:r.status,headers:r.headers,body:type.includes('json')?await r.json():await r.text()};}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const defaults=(await import('../shared/defaults.js')).default;
const {restoreHomepageDraft}=await import('./smoke-content.mjs');

// ---- Public site
for(const loc of ['uk','en','ar','ru'])for(const page of ['','about/','lessons/','coaching/','translation/','contact/','privacy/']){
 const r=await pub(`/${loc}/${page}`);check(`GET /${loc}/${page}`,r.status===200&&r.body.includes(`lang="${loc}"`)&&(loc!=='ar'||r.body.includes('dir="rtl"')),String(r.status));
 const canonical=`https://nozha-badavi.com/${loc}/${page}`;
 check(`SEO /${loc}/${page}`,r.body.includes(`rel="canonical" href="${canonical}"`)&&r.body.includes('hreflang="x-default"')&&r.body.includes('property="og:image:width" content="1200"')&&r.body.includes('name="twitter:image:alt"'));
 try{const schema=JSON.parse(r.body.match(/<script id="nusya-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);check(`JSON-LD /${loc}/${page}`,schema['@graph'][2].url===canonical&&schema['@graph'][2].inLanguage===loc);}catch{check(`JSON-LD /${loc}/${page}`,false);}
}
for(const loc of ['uk','en','ar','ru']){
 const asset=await fetch(PUBLIC_URL+`/assets/social-card-${loc}.png`);const bytes=new Uint8Array(await asset.arrayBuffer());const view=new DataView(bytes.buffer);
 check(`PNG social card ${loc}`,asset.status===200&&asset.headers.get('content-type')==='image/png'&&Buffer.from(bytes.slice(0,8)).toString('hex')==='89504e470d0a1a0a'&&view.getUint32(16)===1200&&view.getUint32(20)===630);
}
for(const [path,size] of [['/apple-touch-icon.png',180],['/assets/icon-192.png',192],['/assets/icon-512.png',512]]){
 const asset=await fetch(PUBLIC_URL+path);const bytes=new Uint8Array(await asset.arrayBuffer());const view=new DataView(bytes.buffer);
 check(`device icon ${path}`,asset.status===200&&asset.headers.get('content-type')==='image/png'&&Buffer.from(bytes.slice(0,8)).toString('hex')==='89504e470d0a1a0a'&&view.getUint32(16)===size&&view.getUint32(20)===size);
}
{
 const asset=await fetch(PUBLIC_URL+'/favicon.ico');const bytes=new Uint8Array(await asset.arrayBuffer());
 check('real ICO fallback',asset.status===200&&asset.headers.get('content-type')==='image/x-icon'&&Buffer.from(bytes.slice(0,6)).toString('hex')==='000001000300');
 const manifest=await pub('/site.webmanifest');check('minimal Ukrainian device manifest',manifest.status===200&&manifest.body.start_url==='/uk/'&&manifest.body.display==='browser');
 const robots=await pub('/robots.txt');check('production sitemap in robots',robots.body.includes('Sitemap: https://nozha-badavi.com/sitemap.xml'));
 const sitemap=await pub('/sitemap.xml');check('28 canonical sitemap entries',(sitemap.body.match(/<loc>/g)||[]).length===28&&!sitemap.body.includes('admin.')&&!sitemap.body.includes('workers.dev'));
}
let r;
for(const language of ['', 'en-US,en;q=0.9', 'ar', 'ru', 'fr-FR', 'uk-UA']){
 r=await pub('/',{headers:{'accept-language':language}});
 check(`root → /uk/ for ${language||'no language preference'}`,r.status===302&&r.headers.get('location')==='/uk/'&&r.headers.get('cache-control')?.includes('no-store'));
}
for(const name of ['nozha-portrait-optimized.webp','nusya-introduction-cover-optimized.webp']){
 const asset=await fetch(PUBLIC_URL+'/assets/'+name);
 const bytes=new Uint8Array(await asset.arrayBuffer());
 const signature=new TextDecoder('ascii');
 check(`WebP ${name}`,asset.status===200&&asset.headers.get('content-type')==='image/webp'&&signature.decode(bytes.slice(0,4))==='RIFF'&&signature.decode(bytes.slice(8,12))==='WEBP');
}
r=await pub('/ko/');check('no Korean locale',r.status===404);
r=await pub('/api/v1/admin/me');check('admin API absent on public host',r.status===404);
r=await pub('/en/');check('public CSP + HSTS',!!r.headers.get('content-security-policy')&&!!r.headers.get('strict-transport-security'));
check('search indexing matches environment',new URL(PUBLIC_URL).hostname.endsWith('.workers.dev')?r.headers.get('x-robots-tag')?.includes('noindex'):!r.headers.get('x-robots-tag')?.includes('noindex'));
for(const path of ['/404.html','/uk/index.html']){
 const response=await pub(path);
 const canonical=path==='/uk/index.html';
 const noindex=!canonical||new URL(PUBLIC_URL).hostname.endsWith('.workers.dev');
 check(`direct HTML indexing ${path}`,response.status===(canonical?308:404)&&(noindex?response.headers.get('x-robots-tag')?.includes('noindex'):!response.headers.get('x-robots-tag')?.includes('noindex')),String(response.status));
 if(canonical){check('direct index redirects to canonical Ukrainian page',response.headers.get('location')==='/uk/');const target=await pub('/uk/');check('canonical redirect destination is localized and has correct indexing',target.status===200&&target.body.includes('lang="uk"')&&(new URL(PUBLIC_URL).hostname.endsWith('.workers.dev')?target.headers.get('x-robots-tag')?.includes('noindex'):!target.headers.get('x-robots-tag')?.includes('noindex')));}
}
check('Vimeo ID + privacy hash present',r.body.includes('player.vimeo.com/video/1171310337?h=3416a6f4f5'));
r=await pub('/api/v1/config');check('public config ready',r.body.ok===true&&r.body.ready===true,JSON.stringify(r.body.services||{}).slice(0,80));
const base=()=>({idempotencyKey:crypto.randomUUID(),locale:'en',type:'lesson',name:'QA Probe',email:'qa@example.com',message:'Automated verification probe.',details:{language:'english'},privacyAcknowledged:true});
// Staging uses Cloudflare's always-pass Turnstile test secret, so forged tokens are only meaningful in production.
if(MODE==='production'){r=await pub('/api/v1/enquiries',{method:'POST',headers:{'content-type':'application/json',origin:PUBLIC_URL},body:JSON.stringify({...base(),turnstileToken:'forged-token-value'})});
check('forged Turnstile token rejected',r.status===400&&r.body.code==='BOT_CHECK_FAILED',JSON.stringify(r.body));}
r=await pub('/api/v1/enquiries',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.example'},body:JSON.stringify(base())});
check('cross-origin enquiry rejected',r.status===403);

// ---- Admin protection
r=await fetch(ADMIN_URL+'/',{redirect:'manual'});check('admin requires Access login',r.status===302&&String(r.headers.get('location')).includes('cloudflareaccess.com'));
r=await fetch(ADMIN_URL+'/api/v1/admin/me',{redirect:'manual',headers:{'Cf-Access-Jwt-Assertion':'a.b.c'}});check('forged Access JWT header does not bypass Access',r.status===302||r.status===401||r.status===403,String(r.status));
if(auth){
 r=await admin('/api/v1/admin/me');check('service token authenticates as owner',r.body.role==='owner',JSON.stringify(r.body));
 r=await admin('/');check('admin UI served no-store',r.status===200&&r.headers.get('cache-control')==='no-store');
 check('admin shares branded favicon',r.body.includes('href="/favicon.ico"')&&r.body.includes('sizes="180x180"'));
 const adminIcon=await fetch(ADMIN_URL+'/favicon.ico',{headers:auth});const adminBytes=new Uint8Array(await adminIcon.arrayBuffer());check('authenticated admin ICO stays private',adminIcon.status===200&&adminIcon.headers.get('cache-control')==='no-store'&&Buffer.from(adminBytes.slice(0,6)).toString('hex')==='000001000300');
 r=await admin('/api/v1/admin/summary');check('admin summary',r.body.ok===true,JSON.stringify(r.body));
 r=await admin('/api/v1/admin/pages');check('admin lists 7 pages × 4 locales',r.body.pages?.length===7&&r.body.pages.every(p=>['uk','en','ar','ru'].every(loc=>p.locales[loc])));
 r=await admin('/api/v1/admin/settings');check('admin settings readable',r.body.ok===true);
 r=await admin('/api/v1/admin/enquiries?limit=5');check('admin enquiry list',r.body.ok===true,`${r.body.items?.length} items`);
}

// ---- Full write flow (staging only)
if(MODE==='staging'&&auth){
 const settings=(await admin('/api/v1/admin/settings')).body.settings;
 for(const s of Object.values(settings.services)){s.visible=true;s.acceptingRequests=true;}
 settings.approvedTranslationPairs=['en:ru','ru:en'];
 r=await admin('/api/v1/admin/settings',{method:'PUT',body:JSON.stringify({settings})});check('owner updates service settings',r.body.ok===true);
 const enquiry={...base(),locale:'uk',type:'translation',name:'Тест перевірки',details:{sourceLanguage:'en',targetLanguage:'ru',dueDate:'2026-12-20'},turnstileToken:'XXXX.DUMMY.TOKEN.XXXX'};
 const post=e=>pub('/api/v1/enquiries',{method:'POST',headers:{'content-type':'application/json',origin:PUBLIC_URL},body:JSON.stringify(e)});
 r=await post(enquiry);check('enquiry accepted (201) and persisted',r.status===201&&/^NS-[A-Z0-9]{16}$/.test(r.body.reference||''),JSON.stringify(r.body));
 const ref=r.body.reference;
 r=await post(enquiry);check('idempotent retry returns same reference',!!ref&&r.body.reference===ref);
 r=await post({...enquiry,message:'Changed message with same key.'});check('same key with changed content → 409',r.status===409);
 r=await post({...enquiry,idempotencyKey:crypto.randomUUID(),details:{...enquiry.details,targetLanguage:'ar'}});check('unapproved direction en:ar rejected',r.status===400);
 await sleep(5000);
 r=await admin('/api/v1/admin/enquiries?limit=10');const item=r.body.items?.find(i=>i.reference===ref);
 check('enquiry visible in admin',!!item&&item.locale==='uk'&&item.name==='Тест перевірки');
 check('owner email notification sent',item?.notificationStatus==='sent',item?.notificationStatus);
 r=await admin(`/api/v1/admin/enquiries/${ref}`,{method:'PATCH',body:JSON.stringify({status:'closed',note:'automated verification'})});check('enquiry status update',r.body.status==='closed');
 r=await admin(`/api/v1/admin/enquiries/${ref}`);check('status change audited',r.body.events?.some(e=>e.event_type==='status_change'));

 // CMS: draft → preview → publish → public → rollback
 const marker=`Verification ${Date.now()}`;
 let page=(await admin('/api/v1/admin/pages/about?locale=uk')).body;
 const content=structuredClone(page.draft||page.published||page.defaultContent);content.fields.title=marker;
 r=await admin('/api/v1/admin/pages/about?locale=uk',{method:'PUT',body:JSON.stringify({baseRevision:page.draftRevision,payload:content})});check('save UK draft',r.body.ok===true,JSON.stringify(r.body));
 const rev=r.body.revision;
 r=await admin('/api/v1/admin/pages/about?locale=uk',{method:'PUT',body:JSON.stringify({baseRevision:page.draftRevision,payload:content})});check('stale baseRevision → 409',r.status===409);
 r=await pub('/uk/about/');check('draft NOT public before publish',!r.body.includes(marker));
 r=await admin('/preview/uk/about/');check('private preview shows draft',r.body.includes(marker)&&r.headers.get('cache-control')==='no-store');
 r=await admin('/api/v1/admin/pages/about/publish?locale=uk',{method:'POST',body:JSON.stringify({revision:rev})});check('unreviewed translation cannot publish',r.status===409);
 r=await admin('/api/v1/admin/pages/about/review?locale=uk',{method:'POST',body:JSON.stringify({revision:rev})});check('approve UK translation',r.body.ok===true);
 r=await admin('/api/v1/admin/pages/about/publish?locale=uk',{method:'POST',body:JSON.stringify({revision:rev})});check('publish UK about',r.body.ok===true,JSON.stringify(r.body));
 let seen=false;for(let i=0;i<14&&!seen;i++){await sleep(10000);seen=(await pub(`/uk/about/?cb=${i}`)).body.includes(marker)||(await pub('/uk/about/')).body.includes(marker);}
 check('published copy live on public site (≤140s)',seen);
 r=await pub('/en/about/');check('no cross-locale leak (EN unchanged)',!r.body.includes(marker));
 const prior=page.publishedRevision;
 if(prior){r=await admin('/api/v1/admin/pages/about/rollback?locale=uk',{method:'POST',body:JSON.stringify({toRevision:prior})});check('rollback to prior revision',r.body.ok===true);}
 else{const base2=(await admin('/api/v1/admin/pages/about?locale=uk')).body;const orig=structuredClone(base2.defaultContent);
  r=await admin('/api/v1/admin/pages/about?locale=uk',{method:'PUT',body:JSON.stringify({baseRevision:base2.draftRevision,payload:orig})});
  await admin('/api/v1/admin/pages/about/review?locale=uk',{method:'POST',body:JSON.stringify({revision:r.body.revision})});
  const r2=await admin('/api/v1/admin/pages/about/publish?locale=uk',{method:'POST',body:JSON.stringify({revision:r.body.revision})});
  const hist=(await admin('/api/v1/admin/pages/about/revisions?locale=uk')).body.revisions;
  const r3=await admin('/api/v1/admin/pages/about/rollback?locale=uk',{method:'POST',body:JSON.stringify({toRevision:rev})});
  const r4=await admin('/api/v1/admin/pages/about/rollback?locale=uk',{method:'POST',body:JSON.stringify({toRevision:r.body.revision})});
  check('restore default + rollback roundtrip',r2.body.ok&&r3.body.ok&&r4.body.ok&&hist.length>=2);}
 // Translation workflow: EN edit flags AR/RU for review
 page=(await admin('/api/v1/admin/pages/privacy?locale=en')).body;const en=structuredClone(page.draft||page.defaultContent);
 r=await admin('/api/v1/admin/pages/privacy?locale=en',{method:'PUT',body:JSON.stringify({baseRevision:page.draftRevision,payload:en})});
 r=await admin('/api/v1/admin/pages');const priv=r.body.pages.find(p=>p.key==='privacy');
 check('EN source edit flags UK/AR/RU needs_review',priv.locales.uk.status==='needs_review'&&priv.locales.ar.status==='needs_review'&&priv.locales.ru.status==='needs_review');

 // Media: upload (private) → publish → public
 const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64'));
 const form=new FormData();form.append('file',new Blob([png],{type:'image/png'}),'probe.png');form.append('altText','Verification pixel');form.append('source','Generated test image, owner licence');
 r=await admin('/api/v1/admin/media',{method:'POST',body:form});check('media upload (private)',r.status===201,JSON.stringify(r.body));
 const mid=r.body.id;
 r=await pub(`/media/${mid}`);check('unpublished media hidden publicly',r.status===404);
 // Exercise the new revision fields through the supported admin API only.
 let home=(await admin('/api/v1/admin/pages/home?locale=en')).body;
 const previousHome=structuredClone(home.published||home.defaultContent);
 const previousHomeDraft=structuredClone(home.draft||previousHome);
 let previousHomeRevision=home.publishedRevision;
 let verificationDraftRevision=null;
 let reviewRevision=null;
 try{
 if(!previousHomeRevision){
  const baseline=await admin('/api/v1/admin/pages/home?locale=en',{method:'PUT',body:JSON.stringify({baseRevision:home.draftRevision,payload:previousHome})});
  verificationDraftRevision=baseline.body.revision||null;
  const baselinePublish=await admin('/api/v1/admin/pages/home/publish?locale=en',{method:'POST',body:JSON.stringify({revision:baseline.body.revision})});
  check('establish rollback baseline for review verification',baselinePublish.body.ok===true);
  previousHomeRevision=baseline.body.revision;
  home=(await admin('/api/v1/admin/pages/home?locale=en')).body;
 }
 const reviewMarker=`Staging review verification ${Date.now()}`;
 const reviewContent={...previousHome,fields:{...defaults.en.home.fields,...previousHome.fields,review_yura_quote:reviewMarker,review_yura_author:'Automated test'},testimonialsEnabled:true,media:{...previousHome.media,reviewYuraScreenshot:mid}};
 const savedHome=await admin('/api/v1/admin/pages/home?locale=en',{method:'PUT',body:JSON.stringify({baseRevision:home.draftRevision,payload:reviewContent})});
 check('save testimonial draft with existing owner fields preserved',savedHome.body.ok===true);
 reviewRevision=savedHome.body.revision;
 verificationDraftRevision=reviewRevision||verificationDraftRevision;
 r=await admin('/preview/en/home/');check('private review preview uses protected screenshot link',r.body.includes(reviewMarker)&&r.body.includes(`/api/v1/admin/media/${mid}`)&&!r.body.includes('data-nusya-testimonials hidden'));
 r=await admin('/api/v1/admin/pages/home/publish?locale=en',{method:'POST',body:JSON.stringify({revision:reviewRevision})});
 check('unapproved review screenshot blocks page publication',r.status===409&&r.body.code==='MEDIA_APPROVAL_REQUIRED');
 r=await admin(`/api/v1/admin/media/${mid}/publish`,{method:'POST',body:JSON.stringify({consentConfirmed:true})});check('media publish with consent',r.body.published===true);
 r=await pub(`/media/${mid}`);check('published media served publicly',r.status===200&&r.headers.get('content-type')==='image/png');
  r=await admin('/api/v1/admin/pages/home/publish?locale=en',{method:'POST',body:JSON.stringify({revision:reviewRevision})});check('publish enabled reviews after screenshot approval',r.body.ok===true);
  let visible=false;
  for(let i=0;i<14&&!visible;i++){const result=await pub('/en/');visible=result.body.includes(reviewMarker)&&result.body.includes(`/media/${mid}`)&&!result.body.includes('data-nusya-testimonials hidden');if(!visible)await sleep(10000);}
  check('enabled review and source link reach public staging',visible);
 }finally{
  try{
   const current=(await admin('/api/v1/admin/pages/home?locale=en')).body;
   if(previousHomeRevision&&[previousHomeRevision,reviewRevision].includes(current.publishedRevision)){
    r=await admin('/api/v1/admin/pages/home/rollback?locale=en',{method:'POST',body:JSON.stringify({toRevision:previousHomeRevision})});check('restore previous homepage review visibility and owner content',r.body.ok===true);
    const restored=(await admin('/api/v1/admin/pages/home?locale=en')).body;
    check('homepage rollback preserves earlier content and visibility',restored.publishedRevision===previousHomeRevision&&restored.published?.fields?.hero===previousHome.fields.hero&&Boolean(restored.published?.testimonialsEnabled)===Boolean(previousHome.testimonialsEnabled));
   }else check('homepage publication changed concurrently; preserve owner publication',false);
  }finally{
   if(verificationDraftRevision){await restoreHomepageDraft(admin,previousHomeDraft,verificationDraftRevision);check('restore the original unpublished homepage draft without replacing concurrent edits',true);}
  }
 }
 const bad=new FormData();bad.append('file',new Blob([new TextEncoder().encode('<svg onload=alert(1)>')],{type:'image/png'}),'x.png');bad.append('altText','Malicious file');bad.append('source','test source');
 r=await admin('/api/v1/admin/media',{method:'POST',body:bad});check('spoofed image rejected',r.status===400);
}
console.log(results.join('\n'));console.log(`\n${results.length-failed}/${results.length} checks passed (${MODE})`);
process.exit(failed?1:0);
