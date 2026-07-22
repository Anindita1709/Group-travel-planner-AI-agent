require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const groupsRouter = require("./routes/groups");
const aiRouter = require("./routes/ai");
const itineraryRouter = require("./routes/itinerary");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { seed } = require("./utils/seed");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "AI request limit reached. Please wait before trying again." },
});

app.use(limiter);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/groups", groupsRouter);
app.use("/api/ai", aiLimiter, aiRouter);
app.use("/api/itinerary", itineraryRouter);

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🤖 AI Provider: Anthropic Claude`);
  console.log(`📡 API Base: http://localhost:${PORT}/api\n`);

  // Load demo data in development so you can explore without clicking through forms
  if (process.env.NODE_ENV !== "production") {
    seed();
  }
});

module.exports = app;
