const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./src/routes/auth");
const dashboardRoutes = require("./src/routes/dashboard");
const ticketRoutes = require("./src/routes/tickets");
const attachmentRoutes = require("./src/routes/attachments");
const branchRoutes = require("./src/routes/branches");
const userRoutes = require("./src/routes/users");
const roleRoutes = require("./src/routes/roles");
const technicianRoutes = require("./src/routes/technicians");
const ticketCategoryRoutes = require("./src/routes/ticketCategories");
const inviteRoutes = require("./src/routes/invites");
const knowledgeBaseRoutes = require("./src/routes/knowledgeBase");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/tickets", attachmentRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/technicians", technicianRoutes);
app.use("/api/v1/ticket-categories", ticketCategoryRoutes);
app.use("/api/v1/invites", inviteRoutes);
app.use("/api/v1/knowledge-base", knowledgeBaseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AstreaBlue API is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AstreaBlue Secure Server active on port ${PORT}`);
});