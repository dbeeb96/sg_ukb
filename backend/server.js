const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Replacing body-parser
app.use(express.urlencoded({ extended: true }));

// MySQL Database Configuration
const db = mysql.createPool({
    host: "localhost",
    user: "dbeeb",
    password: "papesaloum",
    database: "ukb_st",
    connectionLimit: 10,
});

// Test database connection
db.getConnection((err) => {
    if (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL database");
});

// Import routes
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Use routes
app.use('/api', authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/payments", paymentRoutes);

// Default route
app.get("/", (req, res) => {
    res.json({
        message: "API is running...",
        routes: [
            { method: "GET", path: "/api/students", description: "Retrieve student data" },
            { method: "POST", path: "/api/payments", description: "Create a payment" },
        ],
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

