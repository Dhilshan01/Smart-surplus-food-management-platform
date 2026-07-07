import pool from "../config/db.js";
import { createNotification } from "../utils/notificationHelper.js";

// CLAIM A LISTING (charity only)
export const claimListing = async (req, res) => {
  const { listing_id, notes } = req.body;
  const charity_id = req.user.id;

  try {
    // Check listing exists and is available
    const listing = await pool.query(
      `SELECT * FROM food_listings WHERE id = $1 AND COALESCE(status, 'available') = 'available'`,
      [listing_id],
    );
    if (listing.rows.length === 0) {
      return res.status(400).json({ message: "Listing not available" });
    }

    // Check not already claimed by this charity
    const existing = await pool.query(
      `SELECT * FROM claims WHERE listing_id = $1 AND charity_id = $2`,
      [listing_id, charity_id],
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already claimed this listing" });
    }

    // Create claim
    const claim = await pool.query(
      `INSERT INTO claims (listing_id, charity_id, notes)
             VALUES ($1, $2, $3) RETURNING *`,
      [listing_id, charity_id, notes],
    );

    await createNotification(
      listing.rows[0].donor_id,
      "New Donation Request",
      `Your listing "${listing.rows[0].title}" has a new donation request.`,
      "claimed",
    );

    res.status(201).json({
      message: "Donation request submitted",
      claim: claim.rows[0],
    });
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceivedClaims = async (req, res) => {
  try {
    const claims = await pool.query(
      `SELECT c.*, fl.title, fl.quantity, fl.city, fl.expires_at, fl.food_category,
              u.full_name AS charity_name, u.organization_name AS charity_org, u.phone AS charity_phone
       FROM claims c
       JOIN food_listings fl ON c.listing_id = fl.id
       JOIN users u ON c.charity_id = u.id
       WHERE fl.donor_id = $1
       ORDER BY c.claimed_at DESC`,
      [req.user.id],
    );
    res.status(200).json(claims.rows);
  } catch (error) {
    console.error("Get received claims error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateClaimDecision = async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be approved or rejected" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const claim = await client.query(
      `SELECT c.*, fl.donor_id, fl.title, fl.status AS listing_status
       FROM claims c
       JOIN food_listings fl ON fl.id = c.listing_id
       WHERE c.id = $1 AND fl.donor_id = $2`,
      [req.params.id, req.user.id],
    );

    if (claim.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found or unauthorized" });
    }

    if (claim.rows[0].status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Only pending requests can be updated" });
    }

    if (status === "approved" && claim.rows[0].listing_status !== "available") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Listing is no longer available" });
    }

    const updated = await client.query(
      `UPDATE claims SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id],
    );

    if (status === "approved") {
      await client.query(`UPDATE food_listings SET status = 'claimed' WHERE id = $1`, [claim.rows[0].listing_id]);
      await client.query(
        `UPDATE claims SET status = 'rejected'
         WHERE listing_id = $1 AND id != $2 AND status = 'pending'`,
        [claim.rows[0].listing_id, req.params.id],
      );
    }

    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, 'claim', $3, $4)`,
      [req.user.id, `claim.${status}`, req.params.id, JSON.stringify({ listing_id: claim.rows[0].listing_id })],
    );

    await client.query("COMMIT");

    await createNotification(
      claim.rows[0].charity_id,
      status === "approved" ? "Donation Request Approved" : "Donation Request Rejected",
      `Your request for "${claim.rows[0].title}" was ${status}.`,
      status,
    );

    res.status(200).json({ message: `Request ${status}`, claim: updated.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update claim decision error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// GET MY CLAIMS (charity)
export const getMyClaims = async (req, res) => {
  try {
    const claims = await pool.query(
      `SELECT c.*, fl.title, fl.quantity, fl.city, fl.expires_at, fl.food_category,
                    u.organization_name as donor_org
             FROM claims c
             JOIN food_listings fl ON c.listing_id = fl.id
             JOIN users u ON fl.donor_id = u.id
             WHERE c.charity_id = $1
             ORDER BY c.claimed_at DESC`,
      [req.user.id],
    );
    res.status(200).json(claims.rows);
  } catch (error) {
    console.error("Get claims error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// MARK AS COLLECTED
export const markCollected = async (req, res) => {
  try {
    const claim = await pool.query(
      `UPDATE claims SET status = 'collected', collected_at = NOW()
             WHERE id = $1 AND charity_id = $2 AND status = 'approved' RETURNING *`,
      [req.params.id, req.user.id],
    );

    if (claim.rows.length === 0) {
      return res.status(404).json({ message: "Approved claim not found" });
    }

    // Update listing status
    await pool.query(
      `UPDATE food_listings SET status = 'collected' WHERE id = $1`,
      [claim.rows[0].listing_id],
    );

    const listingData = await pool.query(
      `SELECT title, donor_id, unit_price FROM food_listings WHERE id = $1`,
      [claim.rows[0].listing_id],
    );

    if (listingData.rows.length > 0) {
      await pool.query(
        `INSERT INTO waste_analytics (business_id, listing_id, outcome, estimated_value)
         VALUES ($1, $2, 'donated', $3)`,
        [
          listingData.rows[0].donor_id,
          claim.rows[0].listing_id,
          Number(listingData.rows[0].unit_price || 0),
        ],
      );
      await createNotification(
        listingData.rows[0].donor_id,
        "Food Successfully Collected",
        `Your donation "${listingData.rows[0].title}" has been collected. Thank you for your contribution!`,
        "collected",
      );
    }

    res
      .status(200)
      .json({ message: "Marked as collected", claim: claim.rows[0] });
  } catch (error) {
    console.error("Mark collected error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
