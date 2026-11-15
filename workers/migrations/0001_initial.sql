PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cms_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('en','ar','ru')),
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json)),
  source_revision INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_page ON cms_revisions(page_key, locale, id DESC);
CREATE TABLE IF NOT EXISTS cms_state (
  page_key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('en','ar','ru')),
  draft_revision INTEGER REFERENCES cms_revisions(id),
  published_revision INTEGER REFERENCES cms_revisions(id),
  review_status TEXT NOT NULL DEFAULT 'needs_review' CHECK(review_status IN ('needs_review','ready','published')),
  source_revision_seen INTEGER,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(page_key, locale)
);
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL CHECK(json_valid(value_json)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  locale TEXT NOT NULL CHECK(locale IN ('en','ar','ru')),
  type TEXT NOT NULL CHECK(type IN ('lesson','coaching','translation','interpretation')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  details_json TEXT NOT NULL CHECK(json_valid(details_json)),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','awaiting_customer','quoted','booked','completed','closed','spam')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_enquiries_status_time ON enquiries(status,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_type_time ON enquiries(type,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_time ON enquiries(id DESC);
CREATE TABLE IF NOT EXISTS enquiry_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL REFERENCES enquiries(reference),
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_enquiry_events_ref ON enquiry_events(reference,id DESC);
CREATE TABLE IF NOT EXISTS notification_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE REFERENCES enquiries(reference),
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sent','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_error_code TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_outbox_ready ON notification_outbox(state,next_attempt_at,id);
CREATE TABLE IF NOT EXISTS rate_buckets (
  hashed_ip TEXT NOT NULL,
  time_bucket INTEGER NOT NULL,
  hits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(hashed_ip,time_bucket)
);
CREATE TABLE IF NOT EXISTS admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  revision INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_time ON admin_audit(id DESC);
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  alt_text TEXT NOT NULL,
  source TEXT NOT NULL,
  consent_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(consent_confirmed IN (0,1)),
  published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
