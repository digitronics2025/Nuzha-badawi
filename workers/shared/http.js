export class HttpError extends Error {
  constructor(status, code, message, fieldErrors) {
    super(message); this.status=status; this.code=code; this.fieldErrors=fieldErrors;
  }
}
export function json(data,status=200,additional={}) {
  return new Response(JSON.stringify(data), { status, headers: {
    'content-type':'application/json; charset=utf-8', 'cache-control':'no-store',
    'x-content-type-options':'nosniff', 'referrer-policy':'no-referrer', ...additional
  }});
}
export function problem(status, code, message, fieldErrors) {
  return json({ok:false,code,message,...(fieldErrors?{fieldErrors}:{})},status);
}
export function errorResponse(e) {
  if(e instanceof HttpError) return problem(e.status,e.code,e.message,e.fieldErrors);
  // Do not log payloads, tokens, names or other personal details in production.
  console.error('NUSYA API internal failure', e?.name || 'UnknownError');
  return problem(503,'SERVICE_UNAVAILABLE','This service is temporarily unavailable. Please try again later.');
}
export async function readJson(request,maxBytes=16384) {
  const type=request.headers.get('content-type') || '';
  if(!/^application\/json(?:\s*;|$)/i.test(type)) throw new HttpError(415,'INVALID_CONTENT_TYPE','Only application/json is accepted.');
  const length=Number(request.headers.get('content-length')||0);
  if(length>maxBytes) throw new HttpError(413,'PAYLOAD_TOO_LARGE','Request size limit exceeded.');
  const reader=request.body?.getReader();if(!reader) throw new HttpError(400,'VALIDATION_FAILED','Missing request body.');
  const parts=[];let count=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;count+=value.byteLength;if(count>maxBytes)throw new HttpError(413,'PAYLOAD_TOO_LARGE','Request size limit exceeded.');parts.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(count);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
  let data;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new HttpError(400,'VALIDATION_FAILED','Invalid JSON.');}
  if(!data||Array.isArray(data)||typeof data!=='object')throw new HttpError(400,'VALIDATION_FAILED','Expected a JSON object.');
  return data;
}
export function corsSameOrigin(request,expectedHostname) {
  const origin=request.headers.get('origin');
  if(origin){let url;try{url=new URL(origin);}catch{throw new HttpError(403,'INVALID_ORIGIN','Invalid request origin.');}
    if(url.protocol!=='https:'||url.hostname!==expectedHostname||url.port)throw new HttpError(403,'INVALID_ORIGIN','This origin is not authorised.');
  } else if(request.headers.get('sec-fetch-site')==='cross-site') throw new HttpError(403,'INVALID_ORIGIN','Cross-site request blocked.');
}
export function requireMethod(request,method) {if(request.method!==method)throw new HttpError(405,'METHOD_NOT_ALLOWED', 'Method not allowed.');}
export function noStore(response) {const h=new Headers(response.headers);h.set('cache-control','no-store');h.set('x-robots-tag','noindex,nofollow');h.set('x-content-type-options','nosniff');return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
export function isLocale(v){return ['en','ar','ru'].includes(v);}
export function isPageKey(v){return ['home','about','lessons','coaching','translation','contact','privacy'].includes(v);}
export function isSafeKey(v){return /^[a-z0-9_.-]{1,80}$/.test(String(v||''));}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
export function secureHeaders(res,preview=false) {const headers=new Headers(res.headers);headers.set('x-content-type-options','nosniff');headers.set('referrer-policy','strict-origin-when-cross-origin');headers.set('x-frame-options',preview?'SAMEORIGIN':'DENY');headers.set('permissions-policy','camera=(), microphone=(), geolocation=()');if(preview)headers.set('content-security-policy',"default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data: https:; frame-ancestors 'self'");return new Response(res.body,{status:res.status,headers});}
