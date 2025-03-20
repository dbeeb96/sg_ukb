// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
      host: 'ukb.clw6e00uwrd5.eu-north-1.rds.amazonaws.com',   // Database host
    user: 'admin',        // Database username
    password: 'Passer2025',// Database password
    database: 'ukb_db' ,// Database name
    connectionLimit: 10, // Allows multiple connections
});

db.connect((err) => {
    if (err) {
        console.error('Connexion de la base de donnée réussie: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;
