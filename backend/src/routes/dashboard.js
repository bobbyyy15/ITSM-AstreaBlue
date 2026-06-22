const express = require("express");
const db = require("../../config/db");

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const statsResult = await db.query(`
      SELECT
        COUNT(*)::int AS total_tickets,
        COUNT(*) FILTER (WHERE status = 'Open Queue')::int AS open_tickets,
        COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress_tickets,
        COUNT(*) FILTER (
          WHERE priority = 'P1-Critical'
            AND status IN ('Open Queue', 'In Progress')
        )::int AS critical_tickets,
        COUNT(*) FILTER (WHERE status = 'Resolved')::int AS resolved_tickets,
        COUNT(*) FILTER (WHERE status = 'Closed')::int AS closed_tickets
      FROM tickets
    `);

    const recentResult = await db.query(`
      SELECT
        t.id,
        t.ticket_number,
        t.title,
        t.priority,
        t.status,
        t.branch_id,
        COALESCE(b.branch_name, 'Unassigned Branch') AS branch_name,
        t.created_at
      FROM tickets t
      LEFT JOIN branches b
        ON t.branch_id = b.branch_id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    const stats = statsResult.rows[0] || {};

    res.json({
      success: true,
      stats: {
        openTickets: stats.open_tickets || 0,
        inProgressTickets: stats.in_progress_tickets || 0,
        criticalTickets: stats.critical_tickets || 0,
        resolvedTickets: stats.resolved_tickets || 0,
        closedTickets: stats.closed_tickets || 0,
        totalTickets: stats.total_tickets || 0,
      },
      recentTickets: recentResult.rows,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard summary",
    });
  }
});

module.exports = router;
