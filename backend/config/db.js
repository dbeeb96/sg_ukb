// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',   // Database host
    user: 'dbeeb',        // Database username
    password: 'papesaloum',// Database password
    database: 'sgt_st' // Database name
});

db.connect((err) => {
    if (err) {
        console.error('Connexion de la base de donnée réussie: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;
