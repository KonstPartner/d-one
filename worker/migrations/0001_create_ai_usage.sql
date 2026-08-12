-- Migration number: 0001 	 2026-08-12T06:57:49.473Z
CREATE TABLE ai_usage (
  usage_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request_at INTEGER,
  active_until INTEGER
);
