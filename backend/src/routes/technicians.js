const express = require("express");
const db = require("../../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        sr.role_name
      FROM users u
      JOIN system_roles sr
        ON u.role_id = sr.role_id
      WHERE LOWER(sr.role_name) = 'technician'
      ORDER BY u.full_name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch technicians error:", err.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch technicians",
    });
  }
});

module.exports = router;
