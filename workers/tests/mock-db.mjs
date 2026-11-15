import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const HERE=dirname(fileURLToPath(import.meta.url));
class Statement {
 constructor(db,query,args=[]){this.db=db;this.query=query;this.args=args;}
 bind(...args){return new Statement(this.db,this.query,args);}
 async first(){const st=this.db.prepare(this.query);return st.get(...this.args)||null;}
 async all(){const st=this.db.prepare(this.query);return{results:st.all(...this.args)};}
 async run(){const st=this.db.prepare(this.query);const r=st.run(...this.args);return{meta:{changes:r.changes}};}
}
export class MockD1 {
 constructor(){this.raw=new DatabaseSync(':memory:');this.raw.exec('PRAGMA foreign_keys=ON');this.raw.exec(readFileSync(join(HERE,'../migrations/0001_initial.sql'),'utf8'));}
 prepare(query){return new Statement(this.raw,query);}
 async batch(statements){this.raw.exec('BEGIN');const result=[];try{for(const s of statements)result.push(await s.run());this.raw.exec('COMMIT');return result;}catch(e){this.raw.exec('ROLLBACK');throw e;}}
 close(){this.raw.close();}
}
export function jsonRequest(path,body,headers={},method='POST',domain='nozha-badavi.com') {return new Request(`https://${domain}${path}`,{method,headers:{'content-type':'application/json','origin':`https://${domain}`,...headers},body:JSON.stringify(body)});}
