const fs = require("fs");
const path = require("path");
const { rawPool } = require("./config/db");

const migrationFiles = [
  "BASE_SCHEMA.sql",
  "2026-06-19-role-branch-management.sql",
  "2026-06-25-invite-link-registration-foundation.sql",
];

async function runMigrations() {
  const client = await rawPool.connect();

  try {
    for (const fileName of migrationFiles) {
      const filePath = path.join(__dirname, "database", fileName);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`[AstreaBlue DB] applying ${fileName}`);
      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("[AstreaBlue DB] initialization complete");
  } finally {
    client.release();
    await rawPool.end();
  }
}

runMigrations().catch((error) => {
  console.error("[AstreaBlue DB] initialization failed:", error.message);
  process.exitCode = 1;
});
