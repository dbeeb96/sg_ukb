// config/db.js
require('dotenv').config();
const mysql = require("mysql");

// ✅ Use a pool for multiple connections
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false } // Needed for Railway
});

// ✅ Check connection using getConnection (not connect)
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Connected to MySQL database!");
    connection.release(); // release back to the pool
  }
});

module.exports = db;
