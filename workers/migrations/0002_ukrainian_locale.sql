-- Add Ukrainian without rewriting the original migration or changing existing content.
-- D1 runs each migration atomically. Defer FK validation until the original table names
-- have been restored; do not disable foreign keys. IDs, references and sequences survive.
PRAGMA defer_foreign_keys = ON;


CREATE TABLE nusya_locale_sequences (name TEXT PRIMARY KEY, seq INTEGER NOT NULL);
INSERT INTO nusya_locale_sequences SELECT name, seq FROM sqlite_sequence WHERE name IN ('cms_revisions','enquiries');


CREATE TABLE cms_revisions_uk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('uk','en','ar','ru')),
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json)),
  source_revision INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_by TEXT NOT NULL
);

INSERT INTO cms_revisions_uk SELECT * FROM cms_revisions;

CREATE TABLE cms_state_uk (
  page_key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('uk','en','ar','ru')),
  draft_revision INTEGER REFERENCES cms_revisions(id),
  published_revision INTEGER REFERENCES cms_revisions(id),
  review_status TEXT NOT NULL DEFAULT 'needs_review' CHECK(review_status IN ('needs_review','ready','published')),
  source_revision_seen INTEGER,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(page_key, locale)
);

INSERT INTO cms_state_uk SELECT * FROM cms_state;

CREATE TABLE enquiries_uk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('uk','en','ar','ru')),
  type TEXT NOT NULL CHECK(type IN ('lesson','coaching','translation','interpretation')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  details_json TEXT NOT NULL CHECK(json_valid(details_json)),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','awaiting_customer','quoted','booked','completed','closed','spam')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT INTO enquiries_uk SELECT * FROM enquiries;

DROP TABLE cms_state;

DROP TABLE cms_revisions;

DROP TABLE enquiries;

ALTER TABLE cms_revisions_uk RENAME TO cms_revisions;

ALTER TABLE cms_state_uk RENAME TO cms_state;

ALTER TABLE enquiries_uk RENAME TO enquiries;

CREATE INDEX IF NOT EXISTS idx_cms_revisions_page ON cms_revisions(page_key, locale, id DESC);

CREATE INDEX IF NOT EXISTS idx_enquiries_status_time ON enquiries(status,created_at DESC,id DESC);

CREATE INDEX IF NOT EXISTS idx_enquiries_type_time ON enquiries(type,created_at DESC,id DESC);

CREATE INDEX IF NOT EXISTS idx_enquiries_time ON enquiries(id DESC);

UPDATE sqlite_sequence SET seq = MAX(seq, COALESCE((SELECT seq FROM nusya_locale_sequences WHERE name=sqlite_sequence.name),seq)) WHERE name IN ('cms_revisions','enquiries');

DROP TABLE nusya_locale_sequences;

PRAGMA defer_foreign_keys = OFF;
