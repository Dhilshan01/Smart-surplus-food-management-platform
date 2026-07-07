CREATE TABLE IF NOT EXISTS complaints (
 id SERIAL PRIMARY KEY,
 listing_id INT NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
 reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
 reason TEXT NOT NULL CHECK(reason IN ('fake_listing','expired_food','unsafe_food','wrong_details','suspicious_business','other')),
 description TEXT,
 status TEXT DEFAULT 'pending' CHECK(status IN ('pending','reviewing','resolved','rejected')),
 admin_note TEXT,
 resolved_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ DEFAULT NOW(),
 UNIQUE(listing_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_complaints_listing_id ON complaints(listing_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
