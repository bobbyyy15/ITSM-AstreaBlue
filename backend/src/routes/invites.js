const express = require("express");
const db = require("../../config/db");

const router = express.Router();

async function ensureInvitesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_invites (
        invite_id SERIAL PRIMARY KEY,
        token VARCHAR(120) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role_id INTEGER REFERENCES system_roles(role_id),
        branch_id INTEGER REFERENCES branches(branch_id),
        company_name VARCHAR(255),
        mobile_number VARCHAR(20),
        invited_by INTEGER REFERENCES users(user_id),
        accepted_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("Invites setup error:", err.message);
  }
}

ensureInvitesTable();

router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const result = await db.query(
      `
      SELECT
        i.invite_id,
        i.token,
        i.email,
        i.full_name,
        i.role_id,
        sr.role_name,
        i.branch_id,
        b.branch_name,
        i.company_name,
        i.mobile_number,
        i.accepted_at,
        i.expires_at
      FROM user_invites i
      LEFT JOIN system_roles sr ON i.role_id = sr.role_id
      LEFT JOIN branches b ON i.branch_id = b.branch_id
      WHERE i.token = $1
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Invite not found" });
    }

    const invite = result.rows[0];
    if (invite.accepted_at) {
      return res.status(400).json({ success: false, error: "Invite already accepted" });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: "Invite expired" });
    }

    res.json(invite);
  } catch (err) {
    console.error("Fetch invite error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch invite" });
  }
});

router.post("/:token/accept", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required" });
    }

    const inviteResult = await db.query(
      `SELECT * FROM user_invites WHERE token = $1`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Invite not found" });
    }

    const invite = inviteResult.rows[0];
    if (invite.accepted_at) {
      return res.status(400).json({ success: false, error: "Invite already accepted" });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: "Invite expired" });
    }

    const userResult = await db.query(
      `
      INSERT INTO users
      (full_name, email, password_hash, role_id, company_name, branch_id, mobile_number, status, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', TRUE)
      RETURNING user_id, full_name, email, role_id, branch_id
      `,
      [
        invite.full_name || invite.email,
        invite.email,
        password,
        invite.role_id,
        invite.company_name,
        invite.branch_id,
        invite.mobile_number,
      ]
    );

    await db.query(
      `UPDATE user_invites SET accepted_at = CURRENT_TIMESTAMP WHERE invite_id = $1`,
      [invite.invite_id]
    );

    res.status(201).json({ success: true, user: userResult.rows[0] });
  } catch (err) {
    console.error("Accept invite error:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists",
      });
    }

    res.status(500).json({ success: false, error: "Failed to accept invite" });
  }
});

module.exports = router;
