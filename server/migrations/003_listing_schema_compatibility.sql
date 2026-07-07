ALTER TABLE food_listings
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'donation',
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_conditions TEXT DEFAULT 'room_temperature',
  ADD COLUMN IF NOT EXISTS safety_score_numeric INT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

CREATE TABLE IF NOT EXISTS food_safety_logs (
 id SERIAL PRIMARY KEY,
 listing_id INT REFERENCES food_listings(id) ON DELETE CASCADE,
 safety_score TEXT,
 safety_score_numeric INT,
 hours_remaining NUMERIC,
 created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE food_safety_logs
  ADD COLUMN IF NOT EXISTS safety_score_numeric INT,
  ADD COLUMN IF NOT EXISTS hours_remaining NUMERIC,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
