import {isSafeKey,escapeHTML} from './http.js';
import defaults from './defaults.js';
import {pageSchema,safeJson} from './seo.js';

/** Apply allowlisted plain-text CMS overrides to a pre-rendered HTML page. */
export function renderPublished(htmlResponse,payload={},settings={},opts={}){
 if(typeof HTMLRewriter==='undefined')throw Error('HTMLRewriter runtime is unavailable');
 const fields={...(payload.fields||{})},seo=payload.seo||{},media=payload.media||{};
 for(const [legacy,current] of [['proof_age','proof_0'],['proof_levels','proof_1'],['proof_formats','proof_2']])if(Object.hasOwn(fields,legacy)&&!Object.hasOwn(fields,current))fields[current]=fields[legacy];
 const effectiveFields={...defaults[opts.locale]?.[opts.pageKey]?.fields,...fields};
 const hasReview=key=>Boolean(effectiveFields[`review_${key}_quote`]?.trim()&&effectiveFields[`review_${key}_author`]?.trim());
 let rewriter=new HTMLRewriter();
 rewriter=rewriter.on('[data-nusya-testimonials]',{element(el){if(payload.testimonialsEnabled!==true||!['yura','m','serg'].some(hasReview))el.remove();else el.removeAttribute('hidden');}});
 rewriter=rewriter.on('[data-review-card]',{element(el){if(!hasReview(el.getAttribute('data-review-card')))el.remove();}});
 rewriter=rewriter.on('a[data-review-image]',{element(el){const id=media[el.getAttribute('data-review-image')];if(typeof id==='string'&&/^[a-z0-9_-]{10,80}$/i.test(id)){el.setAttribute('href',`${opts.mediaBase||'/media/'}${id}`);el.removeAttribute('hidden');}else el.remove();}});
 rewriter=rewriter.on('[data-nusya-field]',{element(el){const key=el.getAttribute('data-nusya-field');if(key&&Object.hasOwn(fields,key))el.setInnerContent(String(fields[key]));}});
 rewriter=rewriter.on('[data-nusya-service]',{element(el){const id=el.getAttribute('data-nusya-service');if(id&&settings.services?.[id]?.visible===false)el.remove();}});
 const accepting=id=>settings.services?.[id]?.visible===true&&settings.services[id].acceptingRequests===true&&(!['translation','interpretation'].includes(id)||settings.approvedTranslationPairs?.length>0);
 rewriter=rewriter.on('[data-nusya-status]',{element(el){const id=el.getAttribute('data-nusya-status');el.setInnerContent(el.getAttribute(accepting(id)?'data-open-label':'data-closed-label')||'');el.setAttribute('data-configured','true');}});
 rewriter=rewriter.on('[data-nusya-enquiry]',{element(el){if(accepting(el.getAttribute('data-nusya-enquiry')))el.removeAttribute('hidden');else el.remove();}});
 rewriter=rewriter.on('[data-video]',{element(el){if(settings.video?.enabled===false){el.remove();return;}const raw=settings.video?.url;if(raw)el.setAttribute('data-vimeo',raw);}});
 rewriter=rewriter.on('.video-fallback',{element(el){const raw=settings.video?.url;if(raw){const v=new URL(raw);el.setAttribute('href',`https://vimeo.com${v.pathname.replace('/video','')}/${v.searchParams.get('h')}`);}}});
 rewriter=rewriter.on('[data-nusya-video-section]',{element(el){if(settings.video?.enabled===false)el.remove();}});
 rewriter=rewriter.on('[data-nusya-media]',{element(el){const id=media[el.getAttribute('data-nusya-media')];if(id&&isSafeKey(id)){
   const safe=id.replace(/[^a-z0-9_-]/gi,'');el.setAttribute('data-image-id',safe);el.setAttribute('aria-label',({uk:'Портрет Нозхи Бадаві',en:'Portrait of Nozha Badavi',ar:'صورة نزهة بدوي',ru:'Портрет Нузи Бадави'})[opts.locale] || 'Portrait of Nozha Badavi');
   el.append(`<img class="managed-portrait" alt="" loading="lazy" src="${opts.mediaBase||'/media/'}${safe}" />`,{html:true});
 }}});
 rewriter=rewriter.on('[data-video-origin]',{element(el){if(settings.video?.posterMediaId)el.remove();}});
 rewriter=rewriter.on('[data-video] .video-art',{element(el){const id=settings.video?.posterMediaId;if(id&&/^[a-z0-9_-]{10,80}$/i.test(id))el.setInnerContent(`<img class="video-cover-image managed-video-cover" alt="" src="${opts.mediaBase||'/media/'}${id}" />`,{html:true});}});
 rewriter=rewriter.on('a[data-nusya-link]',{element(el){const value=settings.links?.[el.getAttribute('data-nusya-link')];if(value){el.setAttribute('href',value);el.removeAttribute('hidden');}else if(value==='')el.remove();}});
 rewriter=rewriter.on('[data-nusya-contact]',{element(el){const kind=el.getAttribute('data-nusya-contact'),value=settings.contact?.[kind];if(value){el.removeAttribute('hidden');el.setAttribute('dir','ltr');el.setInnerContent(value);el.setAttribute('href',(kind==='email'?'mailto:':'tel:')+encodeURIComponent(value));}}});
 // HTMLRewriter escapes attribute quotes, but preserves ampersands/entity syntax.
 if(seo.title){rewriter=rewriter.on('title',{element(el){el.setInnerContent(seo.title+' · NUSYA Linguistic Studio');}});rewriter=rewriter.on('meta[property="og:title"], meta[name="twitter:title"]',{element(el){el.setAttribute('content',escapeHTML(seo.title));}});}
 if(seo.description){rewriter=rewriter.on('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',{element(el){el.setAttribute('content',escapeHTML(seo.description));}});}
 const fallback=defaults[opts.locale]?.[opts.pageKey]?.seo;
 if(fallback){const effective={title:seo.title||fallback.title,description:seo.description||fallback.description};rewriter=rewriter.on('script#nusya-schema',{element(el){el.setInnerContent(safeJson(pageSchema(opts.locale,opts.pageKey,effective)),{html:true});}});}
 if(opts.turnstileSiteKey){rewriter=rewriter.on('#enquiry-form',{element(el){el.setAttribute('data-turnstile-site-key',opts.turnstileSiteKey);}});}
 return rewriter.transform(htmlResponse);
}
