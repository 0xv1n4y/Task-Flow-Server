import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";

import tasksRouter from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — allow only the frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// HTTP request logger (dev mode)
app.use(morgan("dev"));

// Clerk auth middleware — verifies every request's JWT if present
// Must be added before any route that calls getAuth()
app.use(clerkMiddleware());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    name: "TaskFlow API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      tasks:      "GET|POST /api/tasks",
      task:       "GET|PUT|DELETE /api/tasks/:id",
      toggle:     "PATCH /api/tasks/:id/toggle",
      stats:      "GET /api/tasks/stats",
      bulkDelete: "DELETE /api/tasks?completed=true",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

app.use("/api/tasks", tasksRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ─── Connect to MongoDB & Start Server ───────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 TaskFlow API running at http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
});

start();
