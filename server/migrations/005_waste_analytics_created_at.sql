ALTER TABLE waste_analytics
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'waste_analytics'
      AND column_name = 'recorded_at'
  ) THEN
    EXECUTE 'UPDATE waste_analytics SET created_at = recorded_at WHERE created_at IS NULL';
  END IF;
END $$;
