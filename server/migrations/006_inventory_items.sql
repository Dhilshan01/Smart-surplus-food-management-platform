CREATE TABLE IF NOT EXISTS inventory_items (
 id SERIAL PRIMARY KEY, donor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name TEXT NOT NULL, description TEXT, category TEXT, quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
 unit TEXT NOT NULL DEFAULT 'items', unit_price NUMERIC(12,2) DEFAULT 0,
 expiry_date TIMESTAMPTZ, storage_conditions TEXT DEFAULT 'room_temperature',
 image_url TEXT, low_stock_threshold NUMERIC(12,2) DEFAULT 5,
 status TEXT DEFAULT 'active' CHECK(status IN ('active','out_of_stock','archived')),
 created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_donor_id ON inventory_items(donor_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expiry_date);
