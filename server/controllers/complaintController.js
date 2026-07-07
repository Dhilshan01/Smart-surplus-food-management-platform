import pool from "../config/db.js";

const validReasons = new Set([
  "fake_listing",
  "expired_food",
  "unsafe_food",
  "wrong_details",
  "suspicious_business",
  "other",
]);

export const createComplaint = async (req, res) => {
  const { listing_id, reason, description } = req.body;

  if (!listing_id || !validReasons.has(reason)) {
    return res.status(400).json({ message: "Listing and complaint reason are required" });
  }

  try {
    const listing = await pool.query(
      `SELECT id, donor_id, title FROM food_listings WHERE id = $1`,
      [listing_id],
    );

    if (listing.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.rows[0].donor_id === req.user.id) {
      return res.status(400).json({ message: "You cannot report your own listing" });
    }

    const complaint = await pool.query(
      `INSERT INTO complaints (listing_id, reporter_id, reason, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (listing_id, reporter_id)
       DO UPDATE SET reason = EXCLUDED.reason,
                     description = EXCLUDED.description,
                     status = 'pending',
                     admin_note = NULL,
                     resolved_at = NULL,
                     created_at = NOW()
       RETURNING *`,
      [listing_id, req.user.id, reason, description || null],
    );

    const activeCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM complaints
       WHERE listing_id = $1 AND status IN ('pending', 'reviewing')`,
      [listing_id],
    );

    if (activeCount.rows[0].count >= 3) {
      await pool.query(
        `UPDATE food_listings SET status = 'flagged' WHERE id = $1 AND status = 'available'`,
        [listing_id],
      );
    }

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
       VALUES ($1, 'complaint.create', 'listing', $2, $3)`,
      [
        req.user.id,
        listing_id,
        JSON.stringify({ complaint_id: complaint.rows[0].id, reason }),
      ],
    );

    res.status(201).json({ message: "Complaint submitted for admin review", complaint: complaint.rows[0] });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
