-- Bounded private/published media browsing. Existing media and consent are unchanged.
CREATE INDEX IF NOT EXISTS idx_media_publication ON media_assets(published);
