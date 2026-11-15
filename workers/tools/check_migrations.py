#!/usr/bin/env python3
"""Apply D1-compatible SQLite migrations to an isolated in-memory test DB."""
import sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(':memory:')
conn.execute('PRAGMA foreign_keys=ON')
paths=sorted((root/'migrations').glob('*.sql'))
conn.executescript(paths[0].read_text())
# Exercise an upgrade with linked existing rows and deleted high IDs, not just a fresh DB.
conn.executescript("""
INSERT INTO cms_revisions(id,page_key,locale,payload_json,created_by) VALUES (7,'home','en','{"fields":{"hero":"Keep owner copy"}}','test');
INSERT INTO cms_state(page_key,locale,draft_revision,published_revision) VALUES ('home','en',7,7);
INSERT INTO cms_revisions(id,page_key,locale,payload_json,created_by) VALUES (100,'about','en','{}','test');
DELETE FROM cms_revisions WHERE id=100;
INSERT INTO enquiries(id,reference,idempotency_key,request_hash,ip_hash,locale,type,name,email,message,details_json) VALUES (9,'NS-TEST','test-key','hash','hash','en','lesson','Synthetic','qa@example.com','Test','{}');
INSERT INTO enquiry_events(reference,actor,event_type) VALUES ('NS-TEST','test','status_change');
INSERT INTO notification_outbox(reference) VALUES ('NS-TEST');
INSERT INTO enquiries(id,reference,idempotency_key,request_hash,ip_hash,locale,type,name,email,message,details_json) VALUES (100,'NS-DELETED','deleted-key','hash','hash','en','lesson','Synthetic','qa@example.com','Test','{}');
DELETE FROM enquiries WHERE id=100;
""")
tables=['cms_revisions','cms_state','enquiries','enquiry_events','notification_outbox']
before={name:conn.execute('SELECT * FROM '+name).fetchall() for name in tables}
for path in paths[1:]:
    conn.executescript('BEGIN;\n'+path.read_text()+'\nCOMMIT;')
assert not conn.execute('PRAGMA foreign_key_check').fetchall()
for name in tables:
    assert conn.execute('SELECT * FROM '+name).fetchall()==before[name],name+' lost existing data'
for loc in ['uk','en','ar','ru']:
    revision=conn.execute("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES ('about',?,'{}','test')",(loc,)).lastrowid
    assert revision>100, 'CMS autoincrement sequence must survive migration'
    conn.execute("INSERT INTO cms_state(page_key,locale,draft_revision) VALUES ('about',?,?)",(loc,revision))
    enquiry=conn.execute("INSERT INTO enquiries(reference,idempotency_key,request_hash,ip_hash,locale,type,name,email,message,details_json) VALUES (?,?,'hash','hash',?,'lesson','Synthetic','qa@example.com','Test','{}')",('NS-'+loc,loc,loc)).lastrowid
    assert enquiry>100, 'Enquiry autoincrement sequence must survive migration'
# Locale restrictions must remain enforced on every changed table.
for statement in [
    "INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES ('home','ko','{}','test')",
    "INSERT INTO cms_state(page_key,locale) VALUES ('home','ko')",
    "INSERT INTO enquiries(reference,idempotency_key,request_hash,ip_hash,locale,type,name,email,message,details_json) VALUES ('bad','bad','hash','hash','ko','lesson','Synthetic','qa@example.com','Test','{}')",
]:
    try:conn.execute(statement)
    except sqlite3.IntegrityError:pass
    else:raise AssertionError('Unsupported locale was accepted')
assert not conn.execute('PRAGMA foreign_key_check').fetchall()

for expected in ('cms_revisions','cms_state','enquiries','enquiry_events','notification_outbox','admin_audit','media_assets','rate_buckets','site_settings'):
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?",(expected,)).fetchone(),expected
for text,pass_or_fail in [("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES ('home','en','{}','test')",True),("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES ('home','ko','{}','test')",False)]:
    try:conn.execute(text)
    except sqlite3.IntegrityError:
        if pass_or_fail:raise
    else:
        if not pass_or_fail:raise AssertionError('Invalid locale was accepted')
print('Migration and constraints: OK')
