-- AI interaction event log — written by service-role edge functions, readable by owner.

CREATE TABLE IF NOT EXISTS ai_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type   TEXT        NOT NULL CHECK (event_type IN ('triage', 'chat', 'plan')),
  intent       TEXT,
  course_code  TEXT,
  urgency      TEXT,
  tone         TEXT,
  tokens_used  INT,
  latency_ms   INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_events_user_created ON ai_events(user_id, created_at DESC);

ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_events_select_own ON ai_events;
CREATE POLICY ai_events_select_own ON ai_events
  FOR SELECT USING (user_id = auth.uid());
