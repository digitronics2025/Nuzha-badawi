import {json,problem,errorResponse,HttpError,readJson,corsSameOrigin,noStore,isPageKey,isLocale,secureHeaders} from '../../shared/http.js';
import {verifyAccess,requireRole} from '../../shared/auth.js';
import {settings,saveSettings,state,revision,published,allPageStates,insertDraft,publishDraft,rollBack,markReviewed,loadEnquiry,counts,audit,PAGE_KEYS,LOCALES} from '../../shared/store.js';
import {validateSettings,validatePagePayload} from '../../shared/validation.js';
import {renderPublished} from '../../shared/render.js';
import {flushOutbox} from '../../shared/notify.js';
import defaults from '../../shared/defaults.js';

const current=()=>new Date().toISOString();
const statuses=new Set(['new','reviewing','awaiting_customer','quoted','booked','completed','closed','spam']);
const editId=/^[a-z0-9_-]{8,80}$/i;
function needLocale(url){const loc=url.searchParams.get('locale')||'uk';if(!isLocale(loc))throw new HttpError(400,'VALIDATION_FAILED','Unknown locale.');return loc;}
function pageSummary(states){const map=new Map(states.map(s=>[s.page_key+':'+s.locale,s]));return PAGE_KEYS.map(key=>({key,route:`/${key==='home'?'':key+'/'}`,locales:Object.fromEntries(LOCALES.map(loc=>{
 const row=map.get(key+':'+loc);return [loc,{locale:loc,revision:row?.draft_revision||0,publishedRevision:row?.published_revision||0,status:row?.review_status||'needs_review',title:defaults?.[loc]?.[key]?.fields?.title||''}];
 }))}));}
async function getPage(db,key,loc){const st=await state(db,key,loc),draft=await revision(db,st?.draft_revision),pub=await revision(db,st?.published_revision);
 return {ok:true,key,locale:loc,draftRevision:st?.draft_revision??null,publishedRevision:st?.published_revision??null,reviewStatus:st?.review_status||'needs_review',defaultContent:defaults?.[loc]?.[key]||{fields:{},seo:{}},draft:draft?.payload||null,published:pub?.payload||null,updatedAt:st?.updated_at||null};}
function parseIntStrict(v){if(v===null||v===undefined)return null;if(typeof v!=='number'||!Number.isSafeInteger(v)||v<1)throw new HttpError(400,'VALIDATION_FAILED','Invalid revision.');return v;}
async function previewHtml(request,env,loc,key){
 if(!env.ASSETS)throw new HttpError(503,'SERVICE_UNAVAILABLE','Preview assets not configured.');
 const base=`https://${env.ADMIN_HOST||'admin.nozha-badavi.com'}/preview-public/${loc}/${key==='home'?'':key+'/'}index.html`;
 const asset=await env.ASSETS.fetch(new Request(base));
 if(!asset.ok)throw new HttpError(404,'NOT_FOUND','Preview not found.');
 const st=await state(env.DB,key,loc),draft=await revision(env.DB,st?.draft_revision);const conf=await settings(env.DB);
 let res=renderPublished(asset,draft?.payload||{},conf);
 res=noStore(res);return secureHeaders(res,true);
}
async function handleMedia(req,env,user,path){
 if(!env.MEDIA)throw new HttpError(503,'SERVICE_UNAVAILABLE','Media storage is not configured.');
 const upload=path==='/api/v1/admin/media'&&req.method==='POST';
 if(upload){
   const len=Number(req.headers.get('content-length')||0);if(len>4.5*1024*1024)throw new HttpError(413,'PAYLOAD_TOO_LARGE','File is too large.');
   const data=await req.formData();const file=data.get('file'),alt=data.get('altText'),source=data.get('source');
   if(!(file instanceof File)||file.size<20||file.size>4*1024*1024)throw new HttpError(400,'VALIDATION_FAILED','Provide a valid image under 4 MB.');
   if(typeof alt!=='string'||alt.trim().length<5||alt.length>240||typeof source!=='string'||source.trim().length<3||source.length>260)throw new HttpError(400,'VALIDATION_FAILED','An image description and licensed source are required.');
   const type=file.type;if(!['image/jpeg','image/png','image/webp'].includes(type))throw new HttpError(400,'VALIDATION_FAILED','Only JPEG, PNG and WebP are permitted.');
   const bytes=new Uint8Array(await file.arrayBuffer());const isJpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   const isPng=bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10';
   const isWebp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
   if(!(type==='image/jpeg'&&isJpg||type==='image/png'&&isPng||type==='image/webp'&&isWebp))throw new HttpError(400,'VALIDATION_FAILED','File contents do not match the claimed image format.');
   const id=crypto.randomUUID().replace(/-/g,''),ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[type];const key=`approved-media/${id}.${ext}`;
   await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:type}});
   try{await env.DB.prepare('INSERT INTO media_assets(id,object_key,content_type,byte_size,alt_text,source,created_by) VALUES(?,?,?,?,?,?,?)').bind(id,key,type,file.size,alt.trim(),source.trim(),user.email).run();}catch(e){await env.MEDIA.delete(key);throw e;}
   await audit(env.DB,user.email,'upload_media',id);return json({ok:true,id,status:'draft'},201);
 }
 const m=path.match(/^\/api\/v1\/admin\/media\/([a-zA-Z0-9_-]+)(?:\/(publish))?$/);if(!m)throw new HttpError(404,'NOT_FOUND','Unknown media request.');
 const id=m[1];if(!editId.test(id))throw new HttpError(404,'NOT_FOUND','Asset not found.');
 const row=await env.DB.prepare('SELECT id,object_key,content_type,published,alt_text,source,created_at FROM media_assets WHERE id=?').bind(id).first();if(!row)throw new HttpError(404,'NOT_FOUND','Asset not found.');
 if(m[2]==='publish'&&req.method==='POST'){
   requireRole(user);const body=await readJson(req);if(body.consentConfirmed!==true)throw new HttpError(400,'VALIDATION_FAILED','Explicit image publication consent is required.');
   await env.DB.prepare('UPDATE media_assets SET published=1,consent_confirmed=1 WHERE id=?').bind(id).run();await audit(env.DB,user.email,'publish_media',id);
   return json({ok:true,id,published:true});
 }
 if(req.method==='GET'&&!m[2]){const obj=await env.MEDIA.get(row.object_key);if(!obj)throw new HttpError(404,'NOT_FOUND','Media not found.');return noStore(new Response(obj.body,{headers:{'content-type':row.content_type,'x-content-type-options':'nosniff'}}));}
 throw new HttpError(405,'METHOD_NOT_ALLOWED','Method not allowed.');
}
async function handleAPI(request,env,ctx,user){
 const url=new URL(request.url),path=url.pathname,method=request.method;
 if(method!=='GET')corsSameOrigin(request,env.ADMIN_HOST||'admin.nozha-badavi.com');
 if(path==='/api/v1/admin/me'&&method==='GET')return json({ok:true,...user});
 if(!env.DB)throw new HttpError(503,'SERVICE_UNAVAILABLE','Database not configured.');
 if(path==='/api/v1/admin/summary'&&method==='GET')return json({ok:true,...await counts(env.DB)});
 if(path==='/api/v1/admin/pages'&&method==='GET')return json({ok:true,pages:pageSummary(await allPageStates(env.DB))});
 const pageMatch=path.match(/^\/api\/v1\/admin\/pages\/([a-z]+)(?:\/(review|publish|rollback|revisions))?$/);
 if(pageMatch){
   const key=pageMatch[1],action=pageMatch[2],loc=needLocale(url);
   if(!isPageKey(key))throw new HttpError(404,'NOT_FOUND','Unknown page.');
   if(!action&&method==='GET')return json(await getPage(env.DB,key,loc));
   if(!action&&method==='PUT'){
     const body=await readJson(request);const payload=validatePagePayload(key,loc,body.payload);
     const rev=await insertDraft(env.DB,key,loc,payload,user.email,parseIntStrict(body.baseRevision));
     return json({ok:true,revision:rev,status:'draft'});
   }
   if(action==='revisions'&&method==='GET'){
     const rows=await env.DB.prepare('SELECT id,created_by,created_at FROM cms_revisions WHERE page_key=? AND locale=? ORDER BY id DESC LIMIT 20').bind(key,loc).all();return json({ok:true,revisions:rows.results||[]});
   }
   if(action==='review'&&method==='POST'){
     const body=await readJson(request);return json({ok:true,revision:await markReviewed(env.DB,key,loc,parseIntStrict(body.revision),user.email)});
   }
   if(action==='publish'&&method==='POST'){
     requireRole(user);const body=await readJson(request);
     const st=await state(env.DB,key,loc),draft=await revision(env.DB,st?.draft_revision);
     for(const id of Object.values(draft?.payload?.media||{})){const m=await env.DB.prepare('SELECT id FROM media_assets WHERE id=? AND published=1 AND consent_confirmed=1').bind(id).first();if(!m)throw new HttpError(409,'MEDIA_APPROVAL_REQUIRED','Referenced image is not approved for publication.');}
     const result=await publishDraft(env.DB,key,loc,parseIntStrict(body.revision),user.email);
     return json({ok:true,...result,cacheRefreshWithinSeconds:90});
   }
   if(action==='rollback'&&method==='POST'){
     requireRole(user);const body=await readJson(request);const result=await rollBack(env.DB,key,loc,parseIntStrict(body.toRevision),user.email);
     return json({ok:true,...result,cacheRefreshWithinSeconds:90});
   }
   throw new HttpError(405,'METHOD_NOT_ALLOWED','Method not allowed.');
 }
 if(path==='/api/v1/admin/settings'){
   if(method==='GET')return json({ok:true,settings:await settings(env.DB)});
   if(method==='PUT'){
     requireRole(user);const body=await readJson(request);const clean=validateSettings(body.settings);
     await saveSettings(env.DB,clean,user.email);await audit(env.DB,user.email,'update_settings','site');
     return json({ok:true,settings:clean,cacheRefreshWithinSeconds:90});
   }
 }
 if(path==='/api/v1/admin/enquiries'&&method==='GET'){
   const lim=Math.min(50,Math.max(1,Number.parseInt(url.searchParams.get('limit')||'20',10)||20));
   const cursor=Number.parseInt(url.searchParams.get('cursor')||'0',10);
   const status=url.searchParams.get('status')||null;if(status&&!statuses.has(status))throw new HttpError(400,'VALIDATION_FAILED','Invalid status.');
   if(cursor&&!Number.isSafeInteger(cursor))throw new HttpError(400,'VALIDATION_FAILED','Invalid cursor.');
   const query=status?'SELECT e.*,o.state AS notification_status FROM enquiries e LEFT JOIN notification_outbox o ON e.reference=o.reference WHERE e.id<? AND e.status=? ORDER BY e.id DESC LIMIT ?':'SELECT e.*,o.state AS notification_status FROM enquiries e LEFT JOIN notification_outbox o ON e.reference=o.reference WHERE e.id<? ORDER BY e.id DESC LIMIT ?';
   const params=status?[cursor||Number.MAX_SAFE_INTEGER,status,lim+1]:[cursor||Number.MAX_SAFE_INTEGER,lim+1];const rows=(await env.DB.prepare(query).bind(...params).all()).results||[];
   const items=rows.slice(0,lim).map(r=>({reference:r.reference,locale:r.locale,type:r.type,status:r.status,name:r.name,email:r.email,message:r.message,details:JSON.parse(r.details_json),createdAt:r.created_at,updatedAt:r.updated_at,notificationStatus:r.notification_status}));
   return json({ok:true,items,nextCursor:rows.length>lim?String(rows[lim-1].id):null});
 }
 const em=path.match(/^\/api\/v1\/admin\/enquiries\/(NS-[A-Z0-9]{16})$/);
 if(em){
   const ref=em[1];if(method==='GET'){
     const row=await loadEnquiry(env.DB,ref);if(!row)throw new HttpError(404,'NOT_FOUND','Enquiry not found.');
     const events=(await env.DB.prepare('SELECT actor,event_type,payload_json,created_at FROM enquiry_events WHERE reference=? ORDER BY id DESC LIMIT 50').bind(ref).all()).results;
     return json({ok:true,enquiry:{...row,details:JSON.parse(row.details_json)},events:events||[]});
   }
   if(method==='PATCH'){
     const body=await readJson(request);if(!statuses.has(body.status))throw new HttpError(400,'VALIDATION_FAILED','Invalid enquiry status.');
     const note=body.note||'';if(typeof note!=='string'||note.length>1000)throw new HttpError(400,'VALIDATION_FAILED','Note exceeds allowed length.');
     const before=await loadEnquiry(env.DB,ref);if(!before)throw new HttpError(404,'NOT_FOUND','Enquiry not found.');
     await env.DB.batch([
       env.DB.prepare('UPDATE enquiries SET status=?,updated_at=? WHERE reference=?').bind(body.status,current(),ref),
       env.DB.prepare('INSERT INTO enquiry_events(reference,actor,event_type,payload_json) VALUES(?,?,?,?)').bind(ref,user.email,'status_change',JSON.stringify({from:before.status,to:body.status,note:note.trim()}))
     ]);return json({ok:true,reference:ref,status:body.status});
   }
 }
 if(path==='/api/v1/admin/notifications/retry'&&method==='POST'){
   requireRole(user);const result=await flushOutbox(env.DB,env,null,5);return json({ok:true,...result});
 }
 if(path.startsWith('/api/v1/admin/media'))return handleMedia(request,env,user,path);
 throw new HttpError(404,'NOT_FOUND','API endpoint not found.');
}
const worker={async fetch(request,env,ctx){
 try{
  const url=new URL(request.url),host=env.ADMIN_HOST||'admin.nozha-badavi.com';
  if(url.hostname!==host)throw new HttpError(421,'WRONG_HOST','Incorrect admin hostname.');
  const user=await verifyAccess(request,env);
  if(url.pathname.startsWith('/api/v1/admin/'))return await handleAPI(request,env,ctx,user);
  if(url.pathname.startsWith('/api/'))return problem(404,'NOT_FOUND','Unknown endpoint.');
  const m=url.pathname.match(/^\/preview\/([a-z]{2})\/(home|about|lessons|coaching|translation|contact|privacy)\/?$/);
  if(m){if(!isLocale(m[1]))throw new HttpError(404,'NOT_FOUND','Unknown language.');return previewHtml(request,env,m[1],m[2]);}
  if(!env.ASSETS)throw new HttpError(503,'SERVICE_UNAVAILABLE','Admin assets unavailable.');
  const asset=await env.ASSETS.fetch(request),safe=noStore(asset);
  const h=new Headers(safe.headers);
  h.set('content-security-policy',"default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'");
  return new Response(safe.body,{status:safe.status,headers:h});
 }catch(e){return errorResponse(e);}}
};
export default worker;
