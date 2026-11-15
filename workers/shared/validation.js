import {HttpError,isLocale,isPageKey,isSafeKey} from './http.js';
import defaults from './defaults.js';

const text=(v,min,max,label)=>{
 if(typeof v!=='string')throw new HttpError(400,'VALIDATION_FAILED',`${label} must be text.`);
 const s=v.trim();if(s.length<min||s.length>max)throw new HttpError(400,'VALIDATION_FAILED',`${label} must be between ${min} and ${max} characters.`);
 if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s))throw new HttpError(400,'VALIDATION_FAILED',`${label} contains invalid characters.`);
 return s;
};
const optional=(v,max,label)=>v==null||v===''?'':text(v,0,max,label);
const emailRegex=/^[^\s@<>]+@[^\s@<>]+\.[a-zA-Z]{2,}$/;
export function validateEnquiry(d){
 const errors={};
 if(typeof d.idempotencyKey!=='string'||!(/^[0-9a-f-]{36}$/i.test(d.idempotencyKey)||/^[a-z0-9_-]{12,80}$/i.test(d.idempotencyKey)))errors.idempotencyKey='Invalid submission reference.';
 if(!isLocale(d.locale))errors.locale='Invalid language.';
 if(!['lesson','coaching','translation','interpretation'].includes(d.type))errors.type='Unknown service.';
 if(d.privacyAcknowledged!==true)errors.privacyAcknowledged='Privacy acknowledgement required.';
 try{d.name=text(d.name,2,120,'Name');}catch{errors.name='Enter your name.';}
 try{d.email=text(d.email,4,254,'Email').toLowerCase();if(!emailRegex.test(d.email))throw Error();}catch{errors.email='Enter a valid email address.';}
 try{d.message=text(d.message,8,2500,'Message');}catch{errors.message='Please explain your request (at least eight characters).';}
 const details=d.details;
 if(!details||Array.isArray(details)||typeof details!=='object')errors.details='Invalid details.';
 else if(Object.keys(details).length>8)errors.details='Too many fields.';
 const allowed=new Set(['language','goal','sourceLanguage','targetLanguage','dueDate','eventDate','format']);
 const clean={};
 if(details&&typeof details==='object'&&!Array.isArray(details)){
   for(const [key,value] of Object.entries(details)){
     if(!allowed.has(key)||typeof value!=='string'){errors.details='Unknown detail field.';continue;}
     clean[key]=optional(value,160,key);
   }
   if(d.type==='lesson'&&!['english','russian','arabic'].includes(clean.language))errors.language='Select a language.';
   if(d.type==='coaching'&&!clean.goal)errors.goal='Explain the coaching goal.';
   if(['translation','interpretation'].includes(d.type)){
     if(!['en','ar','ru','uk'].includes(clean.sourceLanguage)||!['en','ar','ru','uk'].includes(clean.targetLanguage)||clean.sourceLanguage===clean.targetLanguage)errors.languagePair='Select two different supported languages.';
     if(d.type==='interpretation'&&!clean.eventDate)errors.eventDate='Specify the event date.';
     if(d.type==='translation'&&!clean.dueDate)errors.dueDate='Specify the requested deadline.';
   }
   for(const dateField of ['dueDate','eventDate']) if(clean[dateField]){const iso=clean[dateField];const date=new Date(iso+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==iso)errors[dateField]='Invalid calendar date.';}
   if(clean.format&&!['remote','in_person','unsure'].includes(clean.format))errors.format='Unknown meeting format.';
 }
 if(Object.keys(errors).length)throw new HttpError(400,'VALIDATION_FAILED','Please check the highlighted fields.',errors);
 return {idempotencyKey:d.idempotencyKey,locale:d.locale,type:d.type,name:d.name,email:d.email,message:d.message,details:clean,privacyAcknowledged:true};
}
export const SERVICE_IDS=['english','russian','arabic','coaching','translation','interpretation'];
export function defaultSettings(){return{
  services:Object.fromEntries(SERVICE_IDS.map(id=>[id,{visible:true,acceptingRequests:false}])),
  approvedTranslationPairs:[],
  video:{enabled:true,url:'https://player.vimeo.com/video/1171310337?h=3416a6f4f5',posterMediaId:null},
  contact:{email:'',phone:''},
  links:{preply:'https://preply.com/en/tutor/522376',instagram:'https://www.instagram.com/nusyabadavi',linkedin:''}
};}
export function validateVimeo(input){let u;try{u=new URL(input);}catch{throw new HttpError(400,'VALIDATION_FAILED','Invalid Vimeo URL.');}
 if(u.protocol!=='https:'||u.hostname!=='player.vimeo.com'||!/^\/video\/\d{3,18}$/.test(u.pathname)||!(/^[a-zA-Z0-9]{6,32}$/.test(u.searchParams.get('h')||'')))throw new HttpError(400,'VALIDATION_FAILED','Only privacy-hashed Vimeo player URLs are allowed.');
 return `${u.origin}${u.pathname}?h=${encodeURIComponent(u.searchParams.get('h'))}`;
}
function safeHttpsUrl(v,allowlist=[]){if(!v)return '';let u;try{u=new URL(v)}catch{throw new HttpError(400,'VALIDATION_FAILED','Invalid external link.');}
 if(u.protocol!=='https:'||u.username||u.password|| (allowlist.length&&!allowlist.some(host=>u.hostname===host||u.hostname.endsWith('.'+host))))throw new HttpError(400,'VALIDATION_FAILED','Link domain is not approved.');return u.toString();}
export function validateSettings(s){if(!s||typeof s!=='object'||Array.isArray(s))throw new HttpError(400,'VALIDATION_FAILED','Invalid settings.');
 const defaults=defaultSettings();const out=structuredClone(defaults);
 if(s.services){if(typeof s.services!=='object'||Object.keys(s.services).some(k=>!SERVICE_IDS.includes(k)))throw new HttpError(400,'VALIDATION_FAILED','Invalid service key.');for(const id of SERVICE_IDS){const service=s.services[id];if(service){if(typeof service.visible!=='boolean'||typeof service.acceptingRequests!=='boolean')throw new HttpError(400,'VALIDATION_FAILED','Invalid service flag.');out.services[id]={visible:service.visible,acceptingRequests:service.acceptingRequests};}}}
 if(s.approvedTranslationPairs){if(!Array.isArray(s.approvedTranslationPairs)||s.approvedTranslationPairs.length>12)throw new HttpError(400,'VALIDATION_FAILED','Invalid translation pairs.');out.approvedTranslationPairs=Array.from(new Set(s.approvedTranslationPairs.map(p=>{
    if(!/^(en|ar|ru|uk):(en|ar|ru|uk)$/.test(p)||p.split(':')[0]===p.split(':')[1])throw new HttpError(400,'VALIDATION_FAILED','Invalid translation pair.');return p;
 })));}
 if(s.video){out.video.enabled=s.video.enabled===true;out.video.url=validateVimeo(s.video.url??defaults.video.url);if(s.video.posterMediaId!=null){if(!isSafeKey(s.video.posterMediaId))throw new HttpError(400,'VALIDATION_FAILED','Invalid media identifier.');out.video.posterMediaId=s.video.posterMediaId;}}
 if(s.contact){out.contact.email=optional(s.contact.email,254,'Contact email');if(out.contact.email&&!emailRegex.test(out.contact.email))throw new HttpError(400,'VALIDATION_FAILED','Invalid email.');out.contact.phone=optional(s.contact.phone,30,'Phone');}
 if(s.links){out.links.preply=safeHttpsUrl(s.links.preply??defaults.links.preply,['preply.com']);out.links.instagram=safeHttpsUrl(s.links.instagram??defaults.links.instagram,['instagram.com']);out.links.linkedin=safeHttpsUrl(s.links.linkedin??'', ['linkedin.com']);}
 return out;
}
export function validatePagePayload(pageKey,loc,payload){
 if(!isPageKey(pageKey)||!isLocale(loc))throw new HttpError(404,'NOT_FOUND','Unknown page.');
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new HttpError(400,'VALIDATION_FAILED','Invalid page content.');
 const f=payload.fields;if(!f||typeof f!=='object'||Array.isArray(f)||Object.keys(f).length>65)throw new HttpError(400,'VALIDATION_FAILED','Invalid page fields.');
 const fields={};for(const [k,v] of Object.entries(f)){
   if(!/^[a-z][a-zA-Z0-9_.]{0,63}$/.test(k)||!Object.hasOwn(defaults?.[loc]?.[pageKey]?.fields||{},k))throw new HttpError(400,'VALIDATION_FAILED','Unsupported content field.');
   fields[k]=text(v,0, k==='description'||/Body|Description|Copy|Desc/.test(k)?2500:260,k);
 }
 const seo={};if(payload.seo){seo.title=optional(payload.seo.title,100,'SEO title');seo.description=optional(payload.seo.description,260,'SEO description');}
 const media={};if(payload.media){for(const [k,v] of Object.entries(payload.media)){if(!['heroPortrait','aboutPortrait'].includes(k)||!isSafeKey(v))throw new HttpError(400,'VALIDATION_FAILED','Invalid media reference.');media[k]=v;}}
 return {fields,seo,media};
}
