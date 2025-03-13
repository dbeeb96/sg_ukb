// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'mysql-monpf.alwaysdata.net',   // Database host
    user: 'monpf',        // Database username
    password: 'Passer@25',// Database password
    database: 'monpf_ukbdb' ,// Database name
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
