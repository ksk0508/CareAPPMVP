const express = require("express");
const cors = require("cors");
const { verifyToken } = require("./utils/auth");
const authRoutes = require("./routes/auth");
const patientsRoutes = require("./routes/patients");
const tasksRoutes = require("./routes/tasks");
const careplansRoutes = require("./routes/careplans");
const dashboardRoutes = require("./routes/dashboard");
const notificationsRoutes = require("./routes/notifications");
const executionRoutes = require("./routes/execution");
const diagnosticsRoutes = require("./routes/diagnostics");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("[BACKEND] Incoming request:", req.method, req.originalUrl, "body:", req.body);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/notifications", verifyToken, notificationsRoutes);
app.use("/api/patients", verifyToken, patientsRoutes);
app.use("/api/tasks", verifyToken, tasksRoutes);
app.use("/api/careplans", verifyToken, careplansRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/execution", verifyToken, executionRoutes);
app.use("/api/diagnostics", verifyToken, diagnosticsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", name: "CarePortal Backend", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5170;
app.listen(PORT, () => {
  console.log(`CarePortal backend listening on port ${PORT}`);
});
