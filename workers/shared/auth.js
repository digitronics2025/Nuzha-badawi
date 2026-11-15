import {HttpError} from './http.js';

const jwkCache=new Map();
function b64part(part){if(!/^[A-Za-z0-9_-]+$/.test(part))throw Error('invalid base64url');const normalized=part.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')),c=>c.charCodeAt(0));}
function parseJSONPart(part){return JSON.parse(new TextDecoder().decode(b64part(part)));}
function teamDomain(env){const d=(env.ACCESS_TEAM_DOMAIN||'').toLowerCase().trim();if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(d))throw new HttpError(503,'AUTH_NOT_CONFIGURED','Access identity configuration missing.');return d;}
export async function verifyAccess(request,env,fetcher=fetch){
 const token=request.headers.get('Cf-Access-Jwt-Assertion');
 if(!token)throw new HttpError(401,'NOT_AUTHENTICATED','A verified administrator session is required.');
 const parts=token.split('.');if(parts.length!==3)throw new HttpError(401,'NOT_AUTHENTICATED','Invalid Access token.');
 let header,claims;try{header=parseJSONPart(parts[0]);claims=parseJSONPart(parts[1]);}catch{throw new HttpError(401,'NOT_AUTHENTICATED','Invalid Access token.');}
 if(header.alg!=='RS256'||!header.kid||header.typ && header.typ!=='JWT')throw new HttpError(401,'NOT_AUTHENTICATED','Invalid token signature configuration.');
 const team=teamDomain(env),expectedAud=env.ACCESS_AUD;
 const audiences=typeof claims.aud==='string'?[claims.aud]:claims.aud; // RFC 7519: string or array (service tokens use a string)
 if(!expectedAud||!Array.isArray(audiences)||!audiences.includes(expectedAud)||claims.iss!==`https://${team}`)throw new HttpError(401,'NOT_AUTHENTICATED','Wrong Access audience or issuer.');
 const t=Math.floor(Date.now()/1000);
 if(typeof claims.exp!=='number'||claims.exp<=t||claims.nbf!=null && claims.nbf>t+60||claims.iat!=null&&claims.iat>t+60)throw new HttpError(401,'NOT_AUTHENTICATED','Access session expired.');
 // Access service tokens carry `common_name` (the client ID) instead of an email. They are honoured only
 // when that client ID is explicitly listed in SERVICE_TOKEN_OWNERS (empty in production by default).
 const serviceIds=(env.SERVICE_TOKEN_OWNERS||'').split(',').map(s=>s.trim()).filter(Boolean);
 const serviceId=!claims.email&&typeof claims.common_name==='string'&&serviceIds.includes(claims.common_name)?claims.common_name:null;
 if(!serviceId&&(!claims.email||typeof claims.email!=='string'))throw new HttpError(403,'NOT_AUTHORISED','Administrator email missing.');
 let jwks=jwkCache.get(team);if(!jwks||jwks.expiresAt<Date.now()||!jwks.keys.some(k=>k.kid===header.kid)){
   let data;try{const resp=await fetcher(`https://${team}/cdn-cgi/access/certs`,{headers:{accept:'application/json'},signal:AbortSignal.timeout(4000)});if(!resp.ok)throw Error('certs unavailable');data=await resp.json();}catch{throw new HttpError(503,'AUTH_UNAVAILABLE','Identity verification is temporarily unavailable.');}
   if(!Array.isArray(data.keys))throw new HttpError(503,'AUTH_UNAVAILABLE','Identity keys unavailable.');jwks={keys:data.keys,expiresAt:Date.now()+10*60*1000};jwkCache.set(team,jwks);
 }
 const jwk=jwks.keys.find(k=>k.kid===header.kid&&k.kty==='RSA');
 if(!jwk)throw new HttpError(401,'NOT_AUTHENTICATED','Unrecognised identity signing key.');
 let verified=false;try{const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64part(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));}catch{verified=false;}
 if(!verified)throw new HttpError(401,'NOT_AUTHENTICATED','Access signature invalid.');
 if(serviceId)return {email:`service-token:${serviceId.slice(0,8)}`,role:'owner',expiresAt:new Date(claims.exp*1000).toISOString(),userId:serviceId};
 const email=claims.email.toLowerCase();const owners=(env.OWNER_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);const editors=(env.EDITOR_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
 const role=owners.includes(email)?'owner':editors.includes(email)?'editor':null;
 if(!role)throw new HttpError(403,'NOT_AUTHORISED','This account is not authorised.');
 return {email,role,expiresAt:new Date(claims.exp*1000).toISOString(),userId:claims.sub||email};
}
export function requireRole(user,role='owner'){if(role==='owner'&&user.role!=='owner')throw new HttpError(403,'NOT_AUTHORISED','Owner approval is required.');}
