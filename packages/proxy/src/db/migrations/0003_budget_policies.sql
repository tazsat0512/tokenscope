CREATE TABLE budget_policies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  limit_usd REAL NOT NULL,
  action TEXT NOT NULL DEFAULT 'block',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_budget_policies_user_agent ON budget_policies(user_id, agent_id);

ALTER TABLE users ADD COLUMN routing_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN routing_mode TEXT NOT NULL DEFAULT 'auto';
