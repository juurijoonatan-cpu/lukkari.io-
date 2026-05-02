-- Pro MVP: Storage-buketit (lukujärjestys, kirjojen sisällysluettelot, muistiinpanot).
-- Kaikki private. Polun ensimmäinen segmentti = käyttäjän auth.uid().

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('schedules', 'schedules', false),
  ('book-tocs', 'book-tocs', false),
  ('notes',     'notes',     false)
ON CONFLICT (id) DO NOTHING;

-- Helper: erottaa polun ensimmäisen kansion ja palauttaa sen UUID:nä.
CREATE OR REPLACE FUNCTION storage_owner_uid(name TEXT)
RETURNS UUID LANGUAGE SQL IMMUTABLE AS $$
  SELECT NULLIF(split_part(name, '/', 1), '')::uuid
$$;

-- Yleinen "vain omistaja" -policy kolmelle bucketille.
DO $$
DECLARE b TEXT;
BEGIN
  FOR b IN SELECT unnest(ARRAY['schedules','book-tocs','notes']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_select_owner');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_insert_owner');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || '_delete_owner');

    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L AND storage_owner_uid(name) = auth.uid())',
      b || '_select_owner', b
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L AND storage_owner_uid(name) = auth.uid())',
      b || '_insert_owner', b
    );
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR DELETE USING (bucket_id = %L AND storage_owner_uid(name) = auth.uid())',
      b || '_delete_owner', b
    );
  END LOOP;
END $$;
