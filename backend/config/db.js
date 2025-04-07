// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'ukb.clw6e00uwrd5.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Passer2025',
    database: 'ukb_db', 
});

db.connect((err) => {
    if (err) {
        console.error('Connexion de la base de donnée réussie: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;
