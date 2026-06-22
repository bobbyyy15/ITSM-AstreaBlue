const express = require("express");
const db = require("../../config/db");

const router = express.Router();

function getRequestContext(req) {
  return {
    currentUserId:
      req.query.current_user_id ||
      req.query.user_id ||
      null,
    roleName: req.query.role_name || null,
    branchId: req.query.branch_id || null,
    filterBranchId: req.query.filter_branch_id || null,
  };
}

function hasColumn(schemaRows, tableName, columnName) {
  return schemaRows.some(
    (row) => row.table_name === tableName && row.column_name === columnName
  );
}

router.get("/summary", async (req, res) => {
  try {
    const schemaResult = await db.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('tickets', 'branches')
    `);

    const schemaRows = schemaResult.rows;
    const hasTicketId = hasColumn(schemaRows, "tickets", "id");
    const hasTicketNumber = hasColumn(schemaRows, "tickets", "ticket_number");
    const hasTitle = hasColumn(schemaRows, "tickets", "title");
    const hasPriority = hasColumn(schemaRows, "tickets", "priority");
    const hasStatus = hasColumn(schemaRows, "tickets", "status");
    const hasCreatedAt = hasColumn(schemaRows, "tickets", "created_at");
    const hasTicketBranch = hasColumn(schemaRows, "tickets", "branch_id");
    const hasRequester = hasColumn(schemaRows, "tickets", "requester_id");
    const hasAssignedTo = hasColumn(schemaRows, "tickets", "assigned_to");
    const hasBranchId = hasColumn(schemaRows, "branches", "branch_id");
    const hasBranchName = hasColumn(schemaRows, "branches", "branch_name");
    const canJoinBranches = hasTicketBranch && hasBranchId;

    const { currentUserId, roleName, branchId, filterBranchId } =
      getRequestContext(req);
    const normalizedRole = String(roleName || "").toLowerCase();
    const params = [];
    const accessClauses = [];

    if (normalizedRole === "superadmin" && filterBranchId && hasTicketBranch) {
      params.push(filterBranchId);
      accessClauses.push(`t.branch_id = $${params.length}`);
    }

    if (normalizedRole === "employee" && currentUserId && hasRequester) {
      params.push(currentUserId);
      accessClauses.push(`t.requester_id = $${params.length}`);
    }

    if (normalizedRole === "admin" && branchId && hasTicketBranch) {
      params.push(branchId);
      accessClauses.push(`(t.branch_id = $${params.length} OR t.branch_id IS NULL)`);
    }

    if (normalizedRole === "technician" && currentUserId && hasAssignedTo) {
      const technicianClauses = [];
      params.push(currentUserId);
      technicianClauses.push(`t.assigned_to = $${params.length}`);

      if (branchId && hasTicketBranch) {
        params.push(branchId);
        technicianClauses.push(
          `(t.assigned_to IS NULL AND (t.branch_id = $${params.length} OR t.branch_id IS NULL))`
        );
      } else {
        technicianClauses.push("t.assigned_to IS NULL");
      }

      accessClauses.push(`(${technicianClauses.join(" OR ")})`);
    }

    const whereSql = accessClauses.length
      ? `WHERE ${accessClauses.join(" AND ")}`
      : "";
    const branchJoinSql = canJoinBranches
      ? "LEFT JOIN branches b ON t.branch_id = b.branch_id"
      : "";
    const idSelect = hasTicketId ? "t.id" : "NULL AS id";
    const ticketNumberSelect = hasTicketNumber
      ? "t.ticket_number"
      : "NULL AS ticket_number";
    const titleSelect = hasTitle ? "t.title" : "NULL AS title";
    const prioritySelect = hasPriority ? "t.priority" : "NULL AS priority";
    const statusSelect = hasStatus ? "t.status" : "NULL AS status";
    const branchIdSelect = hasTicketBranch ? "t.branch_id" : "NULL AS branch_id";
    const branchNameSelect = hasBranchName && canJoinBranches
      ? "COALESCE(b.branch_name, 'Unassigned Branch') AS branch_name"
      : "'Unassigned Branch' AS branch_name";
    const createdAtSelect = hasCreatedAt ? "t.created_at" : "NULL AS created_at";
    const orderBySql = hasCreatedAt ? "ORDER BY t.created_at DESC" : "ORDER BY 1 DESC";
    const openStatusCondition = hasStatus
      ? "t.status IN ('Open Queue', 'In Progress')"
      : "FALSE";
    const resolvedStatusCondition = hasStatus
      ? "t.status IN ('Resolved', 'Closed')"
      : "FALSE";
    const criticalCondition = hasStatus && hasPriority
      ? "t.priority = 'P1-Critical' AND t.status IN ('Open Queue', 'In Progress')"
      : "FALSE";

    const statsResult = await db.query(
      `
      SELECT
        COUNT(*)::int AS total_tickets,
        COUNT(*) FILTER (WHERE ${openStatusCondition})::int AS open_tickets,
        COUNT(*) FILTER (WHERE ${criticalCondition})::int AS critical_tickets,
        COUNT(*) FILTER (WHERE ${resolvedStatusCondition})::int AS resolved_tickets
      FROM tickets t
      ${whereSql}
      `,
      params
    );

    const recentResult = await db.query(
      `
      SELECT
        ${idSelect},
        ${ticketNumberSelect},
        ${titleSelect},
        ${prioritySelect},
        ${statusSelect},
        ${branchIdSelect},
        ${branchNameSelect},
        ${createdAtSelect}
      FROM tickets t
      ${branchJoinSql}
      ${whereSql}
      ${orderBySql}
      LIMIT 10
      `,
      params
    );

    const stats = statsResult.rows[0] || {};

    res.json({
      success: true,
      stats: {
        openTickets: stats.open_tickets || 0,
        criticalTickets: stats.critical_tickets || 0,
        resolvedTickets: stats.resolved_tickets || 0,
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
