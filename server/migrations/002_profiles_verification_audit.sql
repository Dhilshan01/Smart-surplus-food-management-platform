ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_verification_status_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_verification_status_check
      CHECK (verification_status IN ('pending','verified','rejected'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS charity_profiles (
 id SERIAL PRIMARY KEY, user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 registration_number TEXT, service_area TEXT, charity_type TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
 id SERIAL PRIMARY KEY, actor_id INT REFERENCES users(id) ON DELETE SET NULL,
 action TEXT NOT NULL, entity_type TEXT, entity_id INT, details JSONB DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ DEFAULT NOW()
);
