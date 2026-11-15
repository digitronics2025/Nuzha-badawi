"""Synthetic browser fixture; never contacts production or claims real authentication."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json, mimetypes

class ReviewFixture:
    def __init__(self, root):
        self.root=Path(root)
        defaults=self.root.parent/'workers/shared/defaults.js'
        self.defaults=json.loads(defaults.read_text().split('export default ',1)[1].strip().removesuffix(';'))
        self.role='owner'
        self.empty_inbox=False
        self.calls=[]
        self.failures={}
        self.enquiries=[]
        self.revision=3
        self.saved={}
        self.review='needs_review'
        self.services={key:{'visible':True,'acceptingRequests':key not in ['translation','interpretation']} for key in ['english','russian','arabic','coaching','translation','interpretation']}
        self.settings={'services':self.services,'approvedTranslationPairs':[], 'video':{'enabled':True,'url':'https://player.vimeo.com/video/1171310337?h=3416a6f4f5','posterMediaId':None},'contact':{'email':'studio@example.invalid','phone':''},'links':{'preply':'https://preply.com/en/tutor/522376','instagram':'https://www.instagram.com/nusyabadavi','linkedin':''}}

    def serve(self, route):
        req=route.request;u=urlparse(req.url);path=u.path;query=parse_qs(u.query)
        if u.hostname not in ['public.test','admin.test']:
            route.abort();return
        self.calls.append((req.method,path))
        if (req.method,path) in self.failures:
            status,code=self.failures[(req.method,path)]
            route.fulfill(status=status,json={'ok':False,'code':code,'message':'Synthetic failure'});return
        if path=='/api/v1/config':
            route.fulfill(json={'ok':True,'ready':True,'turnstileSiteKey':'test','services':self.services,'approvedTranslationPairs':self.settings['approvedTranslationPairs']});return
        if path=='/api/v1/enquiries':
            self.enquiries.append(json.loads(req.post_data))
            route.fulfill(status=201,json={'ok':True,'reference':'NS-1234567890ABCDEF','acceptedAt':'2026-11-15T19:00:00Z','notificationStatus':'pending'});return
        if path.startswith('/api/v1/admin/'):
            key=path.removeprefix('/api/v1/admin/');data={'ok':True}
            if key=='me':data.update(email='review@example.invalid',role=self.role)
            elif key=='summary':data.update(openEnquiries=1,translationsToReview=3,lastPublication={'pageKey':'home','locale':'uk','revision':2,'action':'publish','occurredAt':'2026-11-15T19:00:00Z'})
            elif key=='settings':
                if req.method=='PUT':self.settings=json.loads(req.post_data)['settings']
                data['settings']=self.settings
            elif key=='pages':data['pages']=[{'key':p,'locales':{locale:{'status':'needs_review','revision':3,'publishedRevision':2} for locale in self.defaults}} for p in self.defaults['uk']]
            elif key.startswith('pages/') and key.endswith('/revisions'):
                data['revisions']=[{'id':3,'created_at':'2026-11-15','created_by':'review@example.invalid','published':False},{'id':2,'created_at':'2026-11-14','created_by':'review@example.invalid','published':True}]
            elif key.startswith('pages/'):
                page=key.split('/')[1];locale=query.get('locale',['uk'])[0]
                if req.method=='PUT':
                    self.saved[(page,locale)]=json.loads(req.post_data)['payload'];self.revision+=1;self.review='needs_review';data['revision']=self.revision
                elif key.endswith('/review'):self.review='ready';data['revision']=self.revision
                elif key.endswith('/publish'):data['revision']=self.revision
                elif key.endswith('/rollback'):data['revision']=2
                else:
                    copy=self.defaults[locale][page]
                    data.update(defaultContent=copy,draft=self.saved.get((page,locale)),draftRevision=self.revision,publishedRevision=2,reviewStatus=self.review,fieldSchema={k:{'maxLength':260 if k in ['hero','title'] or k.endswith('_title') else 2500,'multiline':k not in ['hero','title'] and not k.endswith('_title'),'label':k.replace('_',' ').capitalize(),'group':'Experience timeline' if k.startswith('journey_') else 'Next steps' if k.startswith('process_') else 'Services' if any(x in k for x in ['english','arabic','russian','coaching','translation','interpretation','lesson','guide','share']) else 'Page sections'} for k in copy['fields']})
            elif key=='enquiries':data['items']=[] if self.empty_inbox else [{'reference':'NS-1234567890ABCDEF','name':'Sample visitor','email':'visitor@example.invalid','type':'lesson','status':'new','createdAt':'2026-11-15','notificationStatus':'pending'}]
            elif key.startswith('enquiries/'):
                data.update(enquiry={'message':'I would like to practise for professional meetings. This is synthetic review data.','details':{'language':'english','goal':'Professional meetings'}},events=[{'created_at':'2026-11-15','event_type':'received','actor':'system','payload_json':'{}'}])
            elif key=='media':data['id']='review_private_image'
            elif key.startswith('media/') and req.method=='GET':
                route.fulfill(body=(self.root/'src/assets/nozha-portrait-optimized.webp').read_bytes(),content_type='image/webp');return
            route.fulfill(json=data);return
        base=self.root/('dist-admin' if u.hostname=='admin.test' else 'dist-public')
        file=base/path.lstrip('/')
        if path.endswith('/'):file=file/'index.html'
        status=200
        if not file.is_file():
            locale=path.split('/')[1]
            file=base/(locale if locale in self.defaults else 'uk')/'404.html';status=404
        if not file.is_file():route.fulfill(status=404,body='Not found');return
        content=file.read_bytes()
        content_type=mimetypes.guess_type(file)[0] or 'application/octet-stream'
        route.fulfill(status=status,body=content,content_type=content_type)
