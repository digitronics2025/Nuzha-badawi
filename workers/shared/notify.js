/** Outbox is durable; notification delivery is allowed to fail without losing an enquiry. */
export async function flushOutbox(db,env,reference=null,limit=3){
 if(!env.EMAIL||!env.NOTIFICATION_EMAIL||!env.EMAIL_FROM)return {sent:0,skipped:true};
 const entries=reference?
  (await db.prepare("SELECT o.reference,o.attempts,e.type,e.locale,e.name,e.email,e.message FROM notification_outbox o JOIN enquiries e ON e.reference=o.reference WHERE o.reference=? AND o.state!='sent' LIMIT 1").bind(reference).all()).results:
  (await db.prepare("SELECT o.reference,o.attempts,e.type,e.locale,e.name,e.email,e.message FROM notification_outbox o JOIN enquiries e ON e.reference=o.reference WHERE o.state!='sent' AND o.attempts<5 AND o.next_attempt_at<=? ORDER BY o.id ASC LIMIT ?").bind(new Date().toISOString(),Math.min(limit,5)).all()).results;
 let sent=0;
 for(const row of entries||[]){
   // Claim a row atomically to avoid concurrent retries/sends on the same attempt.
   const claim=await db.prepare("UPDATE notification_outbox SET state='failed',attempts=attempts+1,next_attempt_at=? WHERE reference=? AND state!='sent' AND attempts=? RETURNING attempts").bind(new Date(Date.now()+Math.min(3600000,2**row.attempts*30000)).toISOString(),row.reference,row.attempts).first();
   if(!claim)continue;
   try{
     await env.EMAIL.send({to:env.NOTIFICATION_EMAIL,from:env.EMAIL_FROM,subject:`NUSYA enquiry ${row.reference} (${row.type})`,text:`New ${row.type} enquiry, locale ${row.locale}.\nReference: ${row.reference}\nName: ${row.name}\nEmail: ${row.email}\nMessage:\n${row.message}\n\nOpen your private admin to review and respond.`,replyTo:row.email});
     await db.prepare("UPDATE notification_outbox SET state='sent',last_error_code=NULL,updated_at=? WHERE reference=?").bind(new Date().toISOString(),row.reference).run();sent++;
   }catch(e){await db.prepare("UPDATE notification_outbox SET state='failed',last_error_code=?,updated_at=? WHERE reference=?").bind((e?.code||'SEND_FAILED').slice(0,64),new Date().toISOString(),row.reference).run();}
 }
 return {sent};
}
