// config/db.js
require('dotenv').config();
const mysql = require("mysql");

// ✅ Use a pool for multiple connections
const db = mysql.createPool({
  host: "containers-us-west-157.railway.app",
  port: 3306,
  user: "root",
  password: "HXaOyjgFfGaygrwWAFTcNIvPdqDjfBdB",
  database: "railway",
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false } // nécessaire avec Railway
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
