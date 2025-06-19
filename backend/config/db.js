// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createPool({
    host: process.env.mysql.railway.internal,
    port: process.env.3306 || 3306,
    user: process.env.root,
    password: process.env.HXaOyjgFfGaygrwWAFTcNIvPdqDjfBdB,
    database: process.env.railway,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false } // Required by Railway
});

db.connect((err) => {
    if (err) {
        console.error('Connexion de la base de donnée réussie: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;
