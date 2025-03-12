const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Database connection (Using createPool)
const db = mysql.createPool({
    host: "localhost",
    user: "dbeeb",
    password: "papesaloum",
    database: "sgt_st",
    connectionLimit: 10, // Allows multiple connections
});

// ✅ Check DB connection at startup (Proper way)
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection error:", err);
        process.exit(1);
    } else {
        console.log("✅ Connected to MySQL database");
        connection.release(); // ✅ Release connection after checking
    }
});

// Import routes
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ✅ Use routes correctly
app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Default route with correct documentation
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

// ✅ Global error handling (Fixed)
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    res.status(err.status || 500).json({ message: err.message || "An unexpected error occurred." });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});

// ✅ Export app and DB connection for reuse
module.exports = { app, db };