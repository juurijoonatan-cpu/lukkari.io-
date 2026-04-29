-- Run this in the Supabase SQL Editor after 001_init.sql.
-- Creates two anonymous-write tables for capturing waitlist signups and
-- timetable export events. Anon role can INSERT, never SELECT/UPDATE.

CREATE TABLE IF NOT EXISTS subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  source      TEXT NOT NULL,
  consent_at  TIMESTAMPTZ,
  school_id   TEXT,
  school_name TEXT,
  year        TEXT,
  palkit_filled INT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscribers_email_idx   ON subscribers (lower(email));
CREATE INDEX IF NOT EXISTS subscribers_created_idx ON subscribers (created_at DESC);

CREATE TABLE IF NOT EXISTS downloads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT,
  action        TEXT NOT NULL,
  school_id     TEXT,
  school_name   TEXT,
  year          TEXT,
  palkit_filled INT,
  schedule_text TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS downloads_created_idx ON downloads (created_at DESC);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_subscriber" ON subscribers;
CREATE POLICY "anon_insert_subscriber" ON subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_download" ON downloads;
CREATE POLICY "anon_insert_download" ON downloads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
