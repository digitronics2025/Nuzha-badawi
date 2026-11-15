import {isDeepStrictEqual} from 'node:util';

// Restore through the app, with the test's revision as the optimistic lock.
// A concurrent owner edit must win rather than being replaced during cleanup.
export async function restoreHomepageDraft(admin,payload,expectedRevision){
 const response=await admin('/api/v1/admin/pages/home?locale=en',{method:'PUT',body:JSON.stringify({baseRevision:expectedRevision,payload})});
 if(response.status!==200||!response.body.ok)throw Error('Could not restore the original homepage draft; a concurrent edit may have changed it.');
 const restored=(await admin('/api/v1/admin/pages/home?locale=en')).body;
 const normalized=value=>({fields:value?.fields||{},seo:{title:value?.seo?.title||'',description:value?.seo?.description||''},media:value?.media||{},testimonialsEnabled:value?.testimonialsEnabled===true});
 if(!isDeepStrictEqual(normalized(restored.draft),normalized(payload)))throw Error('Restored homepage draft does not match its original content.');
 return restored;
}
