/**
 * Minimal Static-Assets-compatible fetcher over a bundled {path:{type,body}} map.
 * Mirrors the Workers Static Assets behaviours the app relies on: directory index resolution,
 * trailing-slash redirects, ETag/304, HEAD, and an optional 404 page.
 */
const enc=new TextEncoder();
function decodeBase64(text){
 const binary=atob(text),bytes=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 return bytes;
}
function etagFor(body){let h=2166136261;for(let i=0;i<body.length;i++){h^=body.charCodeAt(i);h=Math.imul(h,16777619);}return `"${(h>>>0).toString(16)}-${body.length}"`;}
export function bundledAssets(files,{notFound=null}={}){
 const etags=new Map(),binaryCache=new Map();
 const respond=(request,path,status=200)=>{const f=files[path];let tag=etags.get(path);if(!tag){tag=etagFor(f.base64??f.body);etags.set(path,tag);}
  const headers=new Headers({'content-type':f.type,etag:tag,'x-content-type-options':'nosniff',
   'cache-control':path.startsWith('/assets/')?'public, max-age=3600':'public, max-age=0, must-revalidate'});
  if(status===200&&request.headers.get('if-none-match')===tag)return new Response(null,{status:304,headers});
  let body=null;
  if(request.method!=='HEAD'){
   if(f.base64!==undefined){
    body=binaryCache.get(path);
    if(!body){body=decodeBase64(f.base64);binaryCache.set(path,body);}
   }else body=enc.encode(f.body);
  }
  return new Response(body,{status,headers});};
 return {async fetch(request){
  const url=new URL(request.url);let path;try{path=decodeURIComponent(url.pathname);}catch{path='';}
  if(path.includes('..')||path.includes('\0'))path='';
  if(path&&files[path])return respond(request,path);
  if(path.endsWith('/')&&files[path+'index.html'])return respond(request,path+'index.html');
  if(path&&!path.endsWith('/')&&files[path+'/index.html'])return Response.redirect(new URL(path+'/'+url.search,url),307);
  if(notFound&&files[notFound])return respond(request,notFound,404);
  return new Response('Not found',{status:404,headers:{'content-type':'text/plain; charset=utf-8','x-content-type-options':'nosniff'}});
 }};
}
