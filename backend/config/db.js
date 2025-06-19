// config/db.js
require('dotenv').config();
const mysql = require("mysql");

// ✅ Use a pool for multiple connections
const db =mysql.createConnection({
    host: '91.216.107.183',
    user: 'senco2446602',
    password: 'Passer@2025',
    database: 'senco2446602', 
    connectionLimit: 10,
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
