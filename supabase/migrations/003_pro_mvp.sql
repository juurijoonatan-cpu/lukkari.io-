-- Pro MVP: opiskelusuunnitelmat, kurssit, kirjat, muistiinpanot, koepreppaus,
-- AI-keskustelut ja ulkoiset kalenteritapahtumat. Kaikki RLS:n takana.

-- profiles laajennus: opiskelijan profiilitiedot (vain Pro-tilauksen jälkeen)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade TEXT
  CHECK (grade IN ('lk1','lk2','lk3','lk4'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_target DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- updated_at-trigger-helper. Käytetään kaikissa tämän migraation tauluissa.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Lukuvuoden suunnitelma — yksi per käyttäjä per lukuvuosi
CREATE TABLE IF NOT EXISTS study_plans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_year          TEXT NOT NULL,                    -- esim '2026–2027'
  school_id            TEXT,
  schedule_image_path  TEXT,                             -- 'schedules/<uid>/<file>'
  schedule_parsed      JSONB,                            -- Claude Visionin JSON
  goals                JSONB,                            -- { yo_subjects: [...] }
  ai_recommendation    JSONB,                            -- generate-study-plan tulos
  status               TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','active','archived')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, school_year)
);

CREATE TABLE IF NOT EXISTS courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_plan_id  UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject        TEXT NOT NULL,                          -- 'YH', 'MAA'
  course_code    TEXT NOT NULL,                          -- 'YH1', 'MAA02'
  course_name    TEXT,
  period         INT CHECK (period BETWEEN 1 AND 6),
  palkki         INT,
  book_toc_id    UUID,                                   -- FK lisätään alempana
  status         TEXT NOT NULL DEFAULT 'planned'
                 CHECK (status IN ('planned','active','completed','dropped')),
  grade          INT CHECK (grade BETWEEN 4 AND 10),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS book_tocs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_code  TEXT,
  image_path   TEXT NOT NULL,                            -- 'book-tocs/<uid>/<file>'
  parsed       JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_book_toc_fk;
ALTER TABLE courses
  ADD CONSTRAINT courses_book_toc_fk
  FOREIGN KEY (book_toc_id) REFERENCES book_tocs(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS ingested_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    UUID REFERENCES courses(id) ON DELETE SET NULL,
  course_code  TEXT,
  image_path   TEXT NOT NULL,                            -- 'notes/<uid>/<file>'
  ocr_text     TEXT,
  topics       TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_date    DATE NOT NULL,
  scope        JSONB,                                    -- { chapters, notes }
  ai_schedule  JSONB,
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active','completed','cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type  TEXT CHECK (context_type IN ('plan','exam','note','general')),
  context_id    UUID,
  messages      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS external_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source      TEXT CHECK (source IN ('ics','manual')),
  title       TEXT NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  rrule       TEXT,
  category    TEXT,                                      -- 'sport','hobby','work'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_counters (
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature  TEXT NOT NULL,
  month    TEXT NOT NULL,                                -- 'YYYY-MM'
  count    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, feature, month)
);

-- Indeksit
CREATE INDEX IF NOT EXISTS study_plans_user_idx ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS courses_plan_idx ON courses(study_plan_id);
CREATE INDEX IF NOT EXISTS courses_user_subject_idx ON courses(user_id, subject);
CREATE INDEX IF NOT EXISTS book_tocs_user_idx ON book_tocs(user_id);
CREATE INDEX IF NOT EXISTS ingested_notes_user_course_idx ON ingested_notes(user_id, course_code);
CREATE INDEX IF NOT EXISTS exam_plans_user_date_idx ON exam_plans(user_id, exam_date);
CREATE INDEX IF NOT EXISTS conversations_user_updated_idx ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS external_events_user_start_idx ON external_events(user_id, starts_at);

-- updated_at-triggerit
DROP TRIGGER IF EXISTS trg_study_plans_uat ON study_plans;
CREATE TRIGGER trg_study_plans_uat BEFORE UPDATE ON study_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_uat ON courses;
CREATE TRIGGER trg_courses_uat BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_uat ON conversations;
CREATE TRIGGER trg_conversations_uat BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE study_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tocs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingested_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters   ENABLE ROW LEVEL SECURITY;

-- Yhtenäinen omistaja-policy. CRUD vain omiin riveihinsä.
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'study_plans','courses','book_tocs','ingested_notes',
    'exam_plans','conversations','external_events'
  ]) LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I',
      t || '_owner', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())',
      t || '_owner', t
    );
  END LOOP;
END $$;

-- usage_counters: vain service_role kirjoittaa, käyttäjä saa lukea omat laskurinsa
DROP POLICY IF EXISTS usage_counters_select_own ON usage_counters;
CREATE POLICY usage_counters_select_own ON usage_counters
  FOR SELECT USING (user_id = auth.uid());
