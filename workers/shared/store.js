import {HttpError,isLocale,isPageKey} from './http.js';
import {defaultSettings,validateSettings} from './validation.js';
const byIdRow=(id,locale)=>({page_key:id,locale});
const now=()=>new Date().toISOString();
export const PAGE_KEYS=['home','about','lessons','coaching','translation','contact','privacy'];
export const LOCALES=['uk','en','ar','ru'];
export function needsSourceReview(row,source,locale){return locale!=='en'&&!!row?.draft_revision&&(row.source_revision_seen??null)!==(source?.draft_revision??null);}
export async function settings(db){const row=await db.prepare("SELECT value_json FROM site_settings WHERE setting_key='site'").first();return row?validateSettings(JSON.parse(row.value_json)):defaultSettings();}
export async function saveSettings(db,settings,actor){await db.prepare("INSERT INTO site_settings(setting_key,value_json,updated_at,updated_by) VALUES('site',?, ?,?) ON CONFLICT(setting_key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at, updated_by=excluded.updated_by").bind(JSON.stringify(settings),now(),actor).run();}
export async function state(db,key,loc){return db.prepare('SELECT page_key,locale,draft_revision,published_revision,review_status,source_revision_seen,updated_at FROM cms_state WHERE page_key=? AND locale=?').bind(key,loc).first();}
export async function revision(db,id){if(!id)return null;const r=await db.prepare('SELECT id,page_key,locale,payload_json,source_revision,created_at,created_by FROM cms_revisions WHERE id=?').bind(id).first();return r?{...r,payload:JSON.parse(r.payload_json)}:null;}
export async function published(db,key,loc){const st=await state(db,key,loc);return st?.published_revision?revision(db,st.published_revision):null;}
export async function allPageStates(db){const res=await db.prepare('SELECT page_key,locale,draft_revision,published_revision,review_status,source_revision_seen,updated_at FROM cms_state ORDER BY page_key,locale').all();return res.results||[];}
export async function insertDraft(db,key,loc,content,actor,expectedRevision){
 if(!isPageKey(key)||!isLocale(loc))throw new HttpError(404,'NOT_FOUND','Unknown page.');
 const before=await state(db,key,loc),beforeRev=before?.draft_revision??null;
 if((expectedRevision??null)!==beforeRev)throw new HttpError(409,'EDIT_CONFLICT','Page was changed elsewhere. Refresh before saving.');
 const newRevision=await db.prepare('INSERT INTO cms_revisions(page_key,locale,payload_json,source_revision,created_by) VALUES(?,?,?,?,?) RETURNING id').bind(key,loc,JSON.stringify(content),beforeRev,actor).first();
 const r=await db.prepare(`INSERT INTO cms_state(page_key,locale,draft_revision,review_status,updated_at)
 VALUES(?, ?, ?, ?, ?)
 ON CONFLICT(page_key,locale) DO UPDATE SET draft_revision=excluded.draft_revision, review_status=excluded.review_status,updated_at=excluded.updated_at
 WHERE cms_state.draft_revision IS ? RETURNING draft_revision`).bind(key,loc,newRevision.id,loc==='en'?'ready':'needs_review',now(),beforeRev).first();
 if(!r)throw new HttpError(409,'EDIT_CONFLICT','Page changed while you were editing.');
 // Changed English copy must not overwrite already-published translations.
 if(loc==='en')await db.prepare("UPDATE cms_state SET review_status='needs_review',updated_at=? WHERE page_key=? AND locale IN ('uk','ar','ru')").bind(now(),key).run();
 await audit(db,actor,'save_draft',`${key}:${loc}`,newRevision.id);
 return newRevision.id;
}
export async function validatePublicationMedia(db,payload){for(const id of Object.values(payload?.media||{})){const row=await db.prepare('SELECT id FROM media_assets WHERE id=? AND published=1 AND consent_confirmed=1').bind(id).first();if(!row)throw new HttpError(409,'MEDIA_APPROVAL_REQUIRED','Referenced image is not approved for publication.');}}
export async function publishDraft(db,key,loc,expectedRevision,actor){
 const st=await state(db,key,loc);if(!st?.draft_revision||st.draft_revision!==expectedRevision)throw new HttpError(409,'EDIT_CONFLICT','Draft revision changed.');
 await validatePublicationMedia(db,(await revision(db,expectedRevision))?.payload);
 const source=loc==='en'?null:await state(db,key,'en');
 if(st.review_status==='needs_review'||(loc!=='en'&&(st.source_revision_seen??null)!==(source?.draft_revision??null)))throw new HttpError(409,'REVIEW_REQUIRED','Review this translation before publishing.');
 const r=await db.prepare("UPDATE cms_state SET published_revision=?,review_status='published',updated_at=? WHERE page_key=? AND locale=? AND draft_revision=? AND review_status!='needs_review' AND (?='en' OR source_revision_seen IS (SELECT draft_revision FROM cms_state WHERE page_key=? AND locale='en')) RETURNING published_revision").bind(expectedRevision,now(),key,loc,expectedRevision,loc,key).first();
 if(!r)throw new HttpError(409,'EDIT_CONFLICT','Page changed during publish.');
 await audit(db,actor,'publish',`${key}:${loc}`,expectedRevision);
 return {revision:expectedRevision,publishedAt:now()};
}
export async function rollBack(db,key,loc,toRevision,actor){
 const target=await revision(db,toRevision);if(!target||target.page_key!==key||target.locale!==loc)throw new HttpError(400,'VALIDATION_FAILED','Revision does not belong to this page.');
 const approved=await db.prepare("SELECT id FROM admin_audit WHERE target=? AND revision=? AND action='publish' LIMIT 1").bind(`${key}:${loc}`,toRevision).first();
 if(!approved)throw new HttpError(409,'PUBLICATION_REQUIRED','Only previously published revisions can be restored.');
 await validatePublicationMedia(db,target.payload);
 const changed=await db.prepare("UPDATE cms_state SET published_revision=?,updated_at=? WHERE page_key=? AND locale=? RETURNING published_revision").bind(toRevision,now(),key,loc).first();
 if(!changed)throw new HttpError(409,'EDIT_CONFLICT','Page state is missing.');
 await audit(db,actor,'rollback',`${key}:${loc}`,toRevision);
 return {revision:toRevision,publishedAt:now()};
}
export async function markReviewed(db,key,loc,expectedDraft,actor,expectedSourceRevision=undefined){
 const r=await db.prepare("UPDATE cms_state SET review_status='ready',source_revision_seen=(SELECT draft_revision FROM cms_state WHERE page_key=? AND locale='en'),updated_at=? WHERE page_key=? AND locale=? AND draft_revision=? AND (?=0 OR ? IS (SELECT draft_revision FROM cms_state WHERE page_key=? AND locale='en')) RETURNING draft_revision").bind(key,now(),key,loc,expectedDraft,expectedSourceRevision===undefined?0:1,expectedSourceRevision??null,key).first();
 if(!r)throw new HttpError(409,'EDIT_CONFLICT','The translation or English source changed. Reload before approving.');
 await audit(db,actor,'review',`${key}:${loc}`,expectedDraft);return r.draft_revision;
}
export async function audit(db,actor,action,target,rev=null){await db.prepare('INSERT INTO admin_audit(actor,action,target,revision) VALUES(?,?,?,?)').bind(actor,action,target,rev).run();}
export async function loadEnquiry(db,reference){return db.prepare('SELECT reference,locale,type,name,email,message,details_json,status,created_at,updated_at FROM enquiries WHERE reference=?').bind(reference).first();}
export async function counts(db){const a=await db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status IN ('new','reviewing')").first();const b=await db.prepare("SELECT COUNT(*) AS count FROM cms_state s LEFT JOIN cms_state source ON source.page_key=s.page_key AND source.locale='en' WHERE s.review_status='needs_review' OR (s.locale!='en' AND s.draft_revision IS NOT NULL AND s.source_revision_seen IS NOT source.draft_revision)").first();const last=await db.prepare("SELECT action,target,revision,created_at FROM admin_audit WHERE action IN ('publish','rollback') AND revision IS NOT NULL ORDER BY id DESC LIMIT 1").first();const [pageKey,locale]=(last?.target||'').split(':');return{openEnquiries:a?.count||0,translationsToReview:b?.count||0,lastPublication:last&&PAGE_KEYS.includes(pageKey)&&LOCALES.includes(locale)?{pageKey,locale,revision:last.revision,action:last.action,occurredAt:last.created_at}:null};}
