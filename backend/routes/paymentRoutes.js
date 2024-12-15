const express = require('express');
const mysql = require("mysql");
const router = express.Router(); // Use Router instance

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dbeeb',
    password: 'papesaloum',
    database: 'ukb_st'
});

const validStatus = ['Paid', 'Partial', 'Unpaid'];
const status = "Unpaid"; // Replace "Non Payé" with "Unpaid"

// POST request to add a payment
router.post("/", (req, res) => {
    const { student_id, filiere,  montantReçu, reste, status, date } = req.body;

    // Query to fetch student first name, last name, subject, and totalFees
    const getStudentQuery = 'SELECT firstName, lastName, subject, totalFees FROM students WHERE id = ?';

    db.query(getStudentQuery, [student_id], (error, results) => {
        if (error) {
            console.error("Error fetching student data:", error);
            return res.status(500).json({ message: "Error fetching student data.", error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        const { firstName, lastName, subject, totalFees } = results[0];
        const filiere = subject || "Unknown";

        // Format the date before inserting into the database
        const finalDate = date ?
            new Date(date).toISOString().slice(0, 19).replace('T', ' ') :
            new Date().toISOString().slice(0, 19).replace('T', ' ');

        const finalMontantReçu = montantReçu || 0.00;
        const finalReste = reste || 0.00;
        const finalStatus = status || "Unpaid"; // Default status

        const query = `
            INSERT INTO payments 
            (student_id, firstName, lastName, filiere, totalFees, montantReçu, reste, status, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            student_id,
            firstName,
            lastName,
            filiere,
            totalFees, // Include totalFees when inserting payment
            finalMontantReçu,
            finalReste,
            finalStatus,
            finalDate
        ];

        db.query(query, values, (error, results) => {
            if (error) {
                console.error("Error saving payment:", error);
                return res.status(500).json({ message: "Error saving payment.", error });
            }
            res.status(200).json({ message: "Payment saved successfully", data: results });
        });
    });
});

// Handle GET request to fetch all payments
router.get("/", (req, res) => {
    const query = "SELECT * FROM payments";
    db.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching payments:", error);
            return res.status(500).json({ message: "Error fetching payments.", error });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
