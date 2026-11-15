#!/usr/bin/env python3
"""Apply D1-compatible SQLite migrations to an isolated in-memory test DB."""
import sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
conn=sqlite3.connect(':memory:')
conn.execute('PRAGMA foreign_keys=ON')
for path in sorted((root/'migrations').glob('*.sql')):
    conn.executescript(path.read_text())
for expected in ('cms_revisions','cms_state','enquiries','enquiry_events','notification_outbox','admin_audit','media_assets','rate_buckets','site_settings'):
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?",(expected,)).fetchone(),expected
for text,pass_or_fail in [("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES ('home','en','{}','test')",True),("INSERT INTO cms_revisions(page_key,locale,payload_json,created_by) VALUES ('home','ko','{}','test')",False)]:
    try:conn.execute(text)
    except sqlite3.IntegrityError:
        if pass_or_fail:raise
    else:
        if not pass_or_fail:raise AssertionError('Invalid locale was accepted')
print('Migration and constraints: OK')
