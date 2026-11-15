import {isSafeKey} from './http.js';

/** Apply allowlisted plain-text CMS overrides to a pre-rendered HTML page. */
export function renderPublished(htmlResponse,payload={},settings={},opts={}){
 if(typeof HTMLRewriter==='undefined')throw Error('HTMLRewriter runtime is unavailable');
 const fields=payload.fields||{},seo=payload.seo||{},media=payload.media||{};
 let rewriter=new HTMLRewriter();
 rewriter=rewriter.on('[data-nusya-field]',{element(el){const key=el.getAttribute('data-nusya-field');if(key&&Object.hasOwn(fields,key))el.setInnerContent(String(fields[key]));}});
 rewriter=rewriter.on('[data-nusya-service]',{element(el){const id=el.getAttribute('data-nusya-service');if(id&&settings.services?.[id]?.visible===false)el.remove();}});
 rewriter=rewriter.on('[data-video]',{element(el){if(settings.video?.enabled===false){el.remove();return;}const raw=settings.video?.url;if(raw)el.setAttribute('data-vimeo',raw);}});
 rewriter=rewriter.on('.video-fallback',{element(el){const raw=settings.video?.url;if(raw){const v=new URL(raw);el.setAttribute('href',`https://vimeo.com${v.pathname.replace('/video','')}/${v.searchParams.get('h')}`);}}});
 rewriter=rewriter.on('[data-nusya-video-section]',{element(el){if(settings.video?.enabled===false)el.remove();}});
 rewriter=rewriter.on('[data-nusya-media]',{element(el){const id=media[el.getAttribute('data-nusya-media')];if(id&&isSafeKey(id)){
   const safe=id.replace(/[^a-z0-9_-]/gi,'');el.setAttribute('data-image-id',safe);el.setAttribute('aria-label',({uk:'Портрет Нозхи Бадаві',en:'Portrait of Nozha Badavi',ar:'صورة نزهة بدوي',ru:'Портрет Нузи Бадави'})[opts.locale] || 'Portrait of Nozha Badavi');
   el.append(`<img class="managed-portrait" alt="" loading="lazy" src="${opts.mediaBase||'/media/'}${safe}" />`,{html:true});
 }}});
 rewriter=rewriter.on('[data-video] .video-art',{element(el){const id=settings.video?.posterMediaId;if(id&&/^[a-z0-9_-]{10,80}$/i.test(id))el.setInnerContent(`<img class="video-cover-image" alt="" src="${opts.mediaBase||'/media/'}${id}" />`,{html:true});}});
 rewriter=rewriter.on('a[data-nusya-link]',{element(el){const value=settings.links?.[el.getAttribute('data-nusya-link')];if(value)el.setAttribute('href',value);}});
 rewriter=rewriter.on('[data-nusya-contact]',{element(el){const kind=el.getAttribute('data-nusya-contact'),value=settings.contact?.[kind];if(value){el.removeAttribute('hidden');el.setInnerContent(value);el.setAttribute('href',(kind==='email'?'mailto:':'tel:')+encodeURIComponent(value));}}});
 if(seo.title){rewriter=rewriter.on('title',{element(el){el.setInnerContent(seo.title+' · NUSYA Linguistic Studio');}});rewriter=rewriter.on('meta[property="og:title"]',{element(el){el.setAttribute('content',seo.title);}});}
 if(seo.description){rewriter=rewriter.on('meta[name="description"]',{element(el){el.setAttribute('content',seo.description);}});rewriter=rewriter.on('meta[property="og:description"]',{element(el){el.setAttribute('content',seo.description);}});}
 if(opts.turnstileSiteKey){rewriter=rewriter.on('#enquiry-form',{element(el){el.setAttribute('data-turnstile-site-key',opts.turnstileSiteKey);}});}
 return rewriter.transform(htmlResponse);
}
