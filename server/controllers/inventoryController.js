import pool from "../config/db.js";
import { calculateSafetyScore } from "../utils/foodSafetyScore.js";
import { notifyCharitiesUrgent } from "../utils/notificationHelper.js";

const allowedStorage = ["room_temperature", "refrigerated", "frozen"];

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeStatus = (quantity, status = "active") => {
  if (status === "archived") return "archived";
  return toNumber(quantity) <= 0 ? "out_of_stock" : "active";
};

const inventorySelect = `
  SELECT *,
         CASE
           WHEN status = 'archived' THEN 'archived'
           WHEN quantity <= 0 THEN 'out_of_stock'
           WHEN expiry_date IS NOT NULL AND expiry_date < NOW() THEN 'expired'
           WHEN expiry_date IS NOT NULL AND expiry_date <= NOW() + INTERVAL '24 hours' THEN 'expiring_soon'
           WHEN quantity <= COALESCE(low_stock_threshold, 5) THEN 'low_stock'
           ELSE 'active'
         END AS inventory_state
  FROM inventory_items
`;

export const getInventoryItems = async (req, res) => {
  try {
    const result = await pool.query(
      `${inventorySelect}
       WHERE donor_id = $1 AND status != 'archived'
       ORDER BY
         CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END,
         expiry_date ASC,
         updated_at DESC`,
      [req.user.id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createInventoryItem = async (req, res) => {
  const {
    name,
    description,
    category,
    quantity,
    unit,
    unit_price,
    expiry_date,
    storage_conditions,
    image_url,
    low_stock_threshold,
  } = req.body;

  try {
    if (!name || quantity === undefined || quantity === "") {
      return res.status(400).json({ message: "Name and quantity are required" });
    }

    const numericQuantity = toNumber(quantity, NaN);
    if (!Number.isFinite(numericQuantity) || numericQuantity < 0) {
      return res.status(400).json({ message: "Quantity must be zero or more" });
    }

    const storage = storage_conditions || "room_temperature";
    if (!allowedStorage.includes(storage)) {
      return res.status(400).json({ message: "Invalid storage condition" });
    }

    if (image_url && typeof image_url !== "string") {
      return res.status(400).json({ message: "Image must be a valid image value" });
    }

    const result = await pool.query(
      `INSERT INTO inventory_items
       (donor_id, name, description, category, quantity, unit, unit_price, expiry_date,
        storage_conditions, image_url, low_stock_threshold, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        req.user.id,
        name,
        description || null,
        category || null,
        numericQuantity,
        unit || "items",
        toNumber(unit_price),
        expiry_date || null,
        storage,
        image_url || null,
        toNumber(low_stock_threshold, 5),
        normalizeStatus(numericQuantity),
      ],
    );

    res.status(201).json({ message: "Inventory item added", item: result.rows[0] });
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateInventoryItem = async (req, res) => {
  const {
    name,
    description,
    category,
    quantity,
    unit,
    unit_price,
    expiry_date,
    storage_conditions,
    image_url,
    low_stock_threshold,
  } = req.body;

  try {
    const current = await pool.query(
      `SELECT * FROM inventory_items WHERE id = $1 AND donor_id = $2 AND status != 'archived'`,
      [req.params.id, req.user.id],
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const nextQuantity = quantity === undefined || quantity === "" ? current.rows[0].quantity : toNumber(quantity, NaN);
    if (!Number.isFinite(Number(nextQuantity)) || Number(nextQuantity) < 0) {
      return res.status(400).json({ message: "Quantity must be zero or more" });
    }

    const nextStorage = storage_conditions || current.rows[0].storage_conditions || "room_temperature";
    if (!allowedStorage.includes(nextStorage)) {
      return res.status(400).json({ message: "Invalid storage condition" });
    }

    const result = await pool.query(
      `UPDATE inventory_items
       SET name = COALESCE($1, name),
           description = $2,
           category = $3,
           quantity = $4,
           unit = COALESCE($5, unit),
           unit_price = $6,
           expiry_date = $7,
           storage_conditions = $8,
           image_url = $9,
           low_stock_threshold = $10,
           status = $11,
           updated_at = NOW()
       WHERE id = $12 AND donor_id = $13
       RETURNING *`,
      [
        name || current.rows[0].name,
        description ?? current.rows[0].description,
        category ?? current.rows[0].category,
        Number(nextQuantity),
        unit || current.rows[0].unit,
        toNumber(unit_price, Number(current.rows[0].unit_price || 0)),
        expiry_date === undefined ? current.rows[0].expiry_date : expiry_date || null,
        nextStorage,
        image_url === undefined ? current.rows[0].image_url : image_url || null,
        toNumber(low_stock_threshold, Number(current.rows[0].low_stock_threshold || 5)),
        normalizeStatus(nextQuantity, current.rows[0].status),
        req.params.id,
        req.user.id,
      ],
    );

    res.status(200).json({ message: "Inventory item updated", item: result.rows[0] });
  } catch (error) {
    console.error("Update inventory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE inventory_items
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND donor_id = $2
       RETURNING *`,
      [req.params.id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.status(200).json({ message: "Inventory item removed" });
  } catch (error) {
    console.error("Delete inventory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createListingFromInventory = async (req, res) => {
  const {
    listing_type,
    quantity_to_list,
    prepared_at,
    expires_at,
    pickup_address,
    city,
    unit_price,
    description,
  } = req.body;

  const type = listing_type || "donation";
  const quantityToList = toNumber(quantity_to_list, NaN);

  if (!["donation", "sale"].includes(type)) {
    return res.status(400).json({ message: "Listing type must be donation or sale" });
  }
  if (!Number.isFinite(quantityToList) || quantityToList <= 0) {
    return res.status(400).json({ message: "Quantity to list must be greater than zero" });
  }
  if (!prepared_at || !expires_at || !pickup_address || !city) {
    return res.status(400).json({ message: "Preparation, expiry, pickup address, and city are required" });
  }
  if (new Date(expires_at) <= new Date(prepared_at)) {
    return res.status(400).json({ message: "Expiry time must be after preparation time" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const itemResult = await client.query(
      `SELECT * FROM inventory_items
       WHERE id = $1 AND donor_id = $2 AND status != 'archived'
       FOR UPDATE`,
      [req.params.id, req.user.id],
    );

    if (itemResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const item = itemResult.rows[0];
    if (Number(item.quantity) < quantityToList) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Not enough quantity in inventory" });
    }

    const safety = calculateSafetyScore(prepared_at, expires_at, item.storage_conditions);
    const quantityLabel = `${quantityToList} ${item.unit}`;
    const price = type === "sale" ? toNumber(unit_price, Number(item.unit_price || 0)) : 0;

    const listing = await client.query(
      `INSERT INTO food_listings
       (donor_id, title, description, quantity, food_category, prepared_at, expires_at,
        pickup_address, city, safety_score, listing_type, unit_price, storage_conditions,
        safety_score_numeric, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        req.user.id,
        item.name,
        description ?? item.description,
        quantityLabel,
        item.category,
        prepared_at,
        expires_at,
        pickup_address,
        city,
        safety.score,
        type,
        price,
        item.storage_conditions,
        safety.numericScore,
        item.image_url,
      ],
    );

    await client.query(
      `INSERT INTO food_safety_logs (listing_id, safety_score, safety_score_numeric, hours_remaining)
       VALUES ($1, $2, $3, $4)`,
      [listing.rows[0].id, safety.score, safety.numericScore, safety.hoursRemaining],
    );

    const remaining = Number(item.quantity) - quantityToList;
    await client.query(
      `UPDATE inventory_items
       SET quantity = $1, status = $2, updated_at = NOW()
       WHERE id = $3`,
      [remaining, normalizeStatus(remaining), item.id],
    );

    await client.query("COMMIT");

    if (safety.score === "moderate_risk" || safety.score === "unsafe") {
      await notifyCharitiesUrgent({ title: item.name, city, id: listing.rows[0].id });
    }

    res.status(201).json({
      message: "Listing created from inventory",
      listing: { ...listing.rows[0], safety_details: safety },
      remaining_quantity: remaining,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create inventory listing error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
