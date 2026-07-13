import pool from "../config/db.js";
import { createNotification } from "../utils/notificationHelper.js";

const ensureRequestTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS charity_donor_requests (
      id SERIAL PRIMARY KEY,
      donor_id INT REFERENCES users(id) ON DELETE CASCADE,
      charity_id INT REFERENCES users(id) ON DELETE CASCADE,
      food_category TEXT,
      quantity TEXT NOT NULL,
      needed_by TIMESTAMPTZ,
      city TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','fulfilled')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_charity_donor_requests_donor_id ON charity_donor_requests(donor_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_charity_donor_requests_charity_id ON charity_donor_requests(charity_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_charity_donor_requests_status ON charity_donor_requests(status)`);
};

const isMissingRequestTable = (error) =>
  error?.code === "42P01" || error?.message?.includes("charity_donor_requests");

export const getRegisteredDonors = async (req, res) => {
  try {
    await ensureRequestTable();
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.organization_name, u.phone, u.address, u.city,
              bp.business_type,
              COUNT(fl.id)::int AS listings_count,
              COUNT(fl.id) FILTER (WHERE fl.status = 'available')::int AS available_listings
       FROM users u
       LEFT JOIN business_profiles bp ON bp.user_id = u.id
       LEFT JOIN food_listings fl ON fl.donor_id = u.id
       WHERE u.role = 'donor' AND u.is_active = true
       GROUP BY u.id, bp.business_type
       ORDER BY COALESCE(u.organization_name, u.full_name) ASC`,
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get registered donors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createDonorRequest = async (req, res) => {
  const { donor_id, food_category, quantity, needed_by, city, message } = req.body;

  if (!donor_id || !quantity) {
    return res.status(400).json({ message: "Donor and quantity are required" });
  }

  try {
    await ensureRequestTable();
    const donor = await pool.query(
      `SELECT id, full_name, organization_name FROM users
       WHERE id = $1 AND role = 'donor' AND is_active = true`,
      [donor_id],
    );

    if (donor.rows.length === 0) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const result = await pool.query(
      `INSERT INTO charity_donor_requests
       (donor_id, charity_id, food_category, quantity, needed_by, city, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [donor_id, req.user.id, food_category || null, quantity, needed_by || null, city || null, message || null],
    );

    await createNotification(
      donor_id,
      "New Food Request",
      `A charity has requested ${quantity}${food_category ? ` of ${food_category}` : ""}.`,
      "request",
    );

    res.status(201).json({ message: "Food request sent", request: result.rows[0] });
  } catch (error) {
    console.error("Create donor request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyDonorRequests = async (req, res) => {
  try {
    await ensureRequestTable();
    const result = await pool.query(
      `SELECT cdr.*, u.full_name AS donor_name, u.organization_name AS donor_org, u.phone AS donor_phone
       FROM charity_donor_requests cdr
       JOIN users u ON u.id = cdr.donor_id
       WHERE cdr.charity_id = $1
       ORDER BY cdr.created_at DESC`,
      [req.user.id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get my donor requests error:", error);
    if (isMissingRequestTable(error)) {
      return res.status(200).json([]);
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceivedDonorRequests = async (req, res) => {
  try {
    await ensureRequestTable();
    const result = await pool.query(
      `SELECT cdr.*, u.full_name AS charity_name, u.organization_name AS charity_org, u.phone AS charity_phone
       FROM charity_donor_requests cdr
       JOIN users u ON u.id = cdr.charity_id
       WHERE cdr.donor_id = $1
       ORDER BY cdr.created_at DESC`,
      [req.user.id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get received donor requests error:", error);
    if (isMissingRequestTable(error)) {
      return res.status(200).json([]);
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDonorRequestDecision = async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected", "fulfilled"].includes(status)) {
    return res.status(400).json({ message: "Status must be approved, rejected, or fulfilled" });
  }

  try {
    await ensureRequestTable();
    const current = await pool.query(
      `SELECT cdr.*, u.full_name AS charity_name, u.organization_name AS charity_org
       FROM charity_donor_requests cdr
       JOIN users u ON u.id = cdr.charity_id
       WHERE cdr.id = $1 AND cdr.donor_id = $2`,
      [req.params.id, req.user.id],
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Request not found or unauthorized" });
    }

    if (current.rows[0].status !== "pending" && status !== "fulfilled") {
      return res.status(400).json({ message: "Only pending requests can be approved or rejected" });
    }

    if (status === "fulfilled" && current.rows[0].status !== "approved") {
      return res.status(400).json({ message: "Only approved requests can be marked fulfilled" });
    }

    const result = await pool.query(
      `UPDATE charity_donor_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND donor_id = $3
       RETURNING *`,
      [status, req.params.id, req.user.id],
    );

    await createNotification(
      current.rows[0].charity_id,
      status === "approved" ? "Food Request Approved" : status === "rejected" ? "Food Request Rejected" : "Food Request Fulfilled",
      `Your food request was ${status}.`,
      "request",
    );

    res.status(200).json({ message: `Request ${status}`, request: result.rows[0] });
  } catch (error) {
    console.error("Update donor request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
