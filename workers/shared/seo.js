/** JSON-LD describes only approved identity and the effective published page. */
const origin='https://nozha-badavi.com';
export function pageSchema(locale,page,seo){
 const route=`/${locale}/${page==='home'?'':page+'/'}`,person=origin+'/#person',website=origin+'/#website';
 const webpage={'@type':page==='about'?'AboutPage':'WebPage','@id':origin+route+'#webpage',url:origin+route,name:seo.title,description:seo.description,inLanguage:locale,isPartOf:{'@id':website},about:{'@id':person}};
 if(page==='about')webpage.mainEntity={'@id':person};
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':website,url:origin+'/uk/',name:'NUSYA Linguistic Studio',inLanguage:['uk','en','ar','ru']},
  {'@type':'Person','@id':person,name:'Nozha Badavi',url:`${origin}/${locale}/about/`},webpage
 ]};
}
export function safeJson(value){return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g,ch=>'\\u'+ch.charCodeAt(0).toString(16).padStart(4,'0'));}
