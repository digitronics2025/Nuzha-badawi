import defaults from './defaults.js';
const SHORT_FIELDS=new Set(['title','hero','english','russian','arabic','story_heading','journey_title','video_title','lessons_title','coaching_title','services_title','about_title','faq_title','closing_title','translation_title','interpretation_title','process_title','form_title','privacy_title']);
function describe(key){
 if(key.startsWith('testimonials_')||key.startsWith('review_'))return {group:'English lesson reviews',label:key.replaceAll('_',' ').replace(/^./,value=>value.toUpperCase())};
 if(key.startsWith('journey_'))return {group:'Experience timeline',label:key.replace(/^journey_(\d+)_(.*)/,(_,index,part)=>`Milestone ${Number(index)+1} · ${part==='body'?'Description':part==='date'?'Date or period':'Heading'}`)};
 if(key.startsWith('process_'))return {group:'Enquiry process',label:key==='process_title'?'Process heading':key.replace(/^process_(\d+)_(.*)/,(_,index,part)=>`Step ${Number(index)+1} · ${part==='body'?'Description':'Heading'}`)};
 if(key.startsWith('faq_'))return {group:'Frequently asked questions',label:key==='faq_title'?'FAQ heading':key.replace(/^faq_(\d+)_(.*)/,(_,index,part)=>`FAQ ${Number(index)+1} · ${part}`)};
 if(key.startsWith('proof_'))return {group:'Evidence strip',label:/^proof_\d+$/.test(key)?`Statement ${Number(key.slice(6))+1}`:key.replaceAll('_',' ')};
 const group=key.startsWith('topic_')?'Coaching topics':key.startsWith('translation_step_')?'Translation process':/english|arabic|russian|coaching|translation|interpretation|lesson|guide|share|services/.test(key)?'Services and service guide':/video/.test(key)?'Introduction video':/closing/.test(key)?'Closing actions':'Page sections';
 return {group,label:key.replaceAll('_',' ').replace(/^./,value=>value.toUpperCase())};
}
export function fieldSchema(locale,page){
 return Object.fromEntries(Object.keys(defaults[locale]?.[page]?.fields||{}).map(key=>{
  const short=SHORT_FIELDS.has(key)||key.endsWith('_title')||key.endsWith('_question')||key.endsWith('_date')||key.endsWith('_author')||key.startsWith('proof_');
  return [key,{maxLength:key.endsWith('_date')?60:short?260:2500,multiline:!short,...describe(key),editable:!['proof_age','proof_levels','proof_formats'].includes(key)&&!key.endsWith('_page_title')&&!key.endsWith('_page_desc')}];
 }));
}
