CREATE TABLE IF NOT EXISTS charity_donor_requests (
 id SERIAL PRIMARY KEY, donor_id INT REFERENCES users(id) ON DELETE CASCADE,
 charity_id INT REFERENCES users(id) ON DELETE CASCADE, food_category TEXT, quantity TEXT NOT NULL,
 needed_by TIMESTAMPTZ, city TEXT, message TEXT, status TEXT DEFAULT 'pending'
 CHECK(status IN ('pending','approved','rejected','fulfilled')),
 created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_charity_donor_requests_donor_id ON charity_donor_requests(donor_id);
CREATE INDEX IF NOT EXISTS idx_charity_donor_requests_charity_id ON charity_donor_requests(charity_id);
CREATE INDEX IF NOT EXISTS idx_charity_donor_requests_status ON charity_donor_requests(status);
