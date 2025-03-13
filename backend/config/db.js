// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-monpf.alwaysdata.net',
    user: process.env.DB_USER || 'monpf',
    password: process.env.DB_PASSWORD || 'Passer@25',
    database: process.env.DB_NAME || 'monpf_ukbdb',
    port: process.env.DB_PORT || 3306,
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
