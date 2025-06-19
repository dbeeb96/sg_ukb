// server.js
require('dotenv').config(); // Load .env first
const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // Database connection pool
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);

// Default root
app.get("/", (req, res) => {
  res.json({
    message: "✅ API is running...",
    routes: [
      { method: "GET", path: "/api/students", description: "Retrieve student data" },
      { method: "GET", path: "/api/payments", description: "Retrieve all payments" },
      { method: "POST", path: "/api/payments", description: "Create a new payment" },
    ],
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "An unexpected error occurred." });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

module.exports = app;
