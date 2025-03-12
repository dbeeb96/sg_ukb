const express = require('express');
const mysql = require("mysql");
const router = express.Router();

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dbeeb',
    password: 'papesaloum',
    database: 'sgt_st',

});

// POST request to add a payment
router.post("/", (req, res) => {
    const { student_id, filiere, montantReçu, reste, status, date } = req.body;

    const getStudentQuery = 'SELECT firstName, lastName, subject, totalFees FROM students WHERE id = ?';
    db.query(getStudentQuery, [student_id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching student data.", error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        const { firstName, lastName, subject, totalFees } = results[0];
        const filiere = subject || "Unknown";
        const finalDate = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
        const finalMontantReçu = montantReçu || 0.00;
        const finalReste = reste || 0.00;
        const finalStatus = status || "Unpaid";

        const query = `
            INSERT INTO payments 
            (student_id, firstName, lastName, filiere, totalFees, montantReçu, reste, status, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [student_id, firstName, lastName, filiere, totalFees, finalMontantReçu, finalReste, finalStatus, finalDate];

        db.query(query, values, (error, results) => {
            if (error) {
                return res.status(500).json({ message: "Error saving payment.", error });
            }
            res.status(200).json({ message: "Payment saved successfully", data: results });
        });
    });
});

// GET request to fetch all payments
router.get("/", (req, res) => {
    const query = "SELECT * FROM payments";
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching payments.", error });
        }
        res.status(200).json(results);
    });
});

// PUT request to update an existing payment
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { montantReçu, reste, status, date } = req.body;

    // Check explicitly for null or undefined values
    if (id == null || montantReçu == null || reste == null || status == null || date == null) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Format the date to MySQL DATETIME format
    const finalDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

    const query = `
        UPDATE payments 
        SET montantReçu = ?, reste = ?, status = ?, date = ?
        WHERE id = ?
    `;
    const values = [montantReçu, reste, status, finalDate, id];

    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error updating payment.", error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found." });
        }
        res.status(200).json({ message: "Payment updated successfully" });
    });
});

router.get("/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT
            s.firstName,
            s.lastName,
            latest_payment.montantReçu AS lastReceived,
            SUM(p.montantReçu) AS montantReçu,
            latest_payment.reste,
            latest_payment.status
        FROM
            students s
                LEFT JOIN
            payments p ON s.id = p.student_id
                LEFT JOIN (
                SELECT
                    student_id,
                    montantReçu,
                    reste,
                    status,
                    MAX(date) AS last_payment_date
                FROM
                    payments
                GROUP BY
                    student_id
            ) latest_payment
                          ON s.id = latest_payment.student_id
        WHERE
            s.id = ?
        GROUP BY
            s.id, latest_payment.montantReçu, latest_payment.reste, latest_payment.status
        ORDER BY
            latest_payment.last_payment_date DESC
        LIMIT 1;
    `;

    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching student details.", error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Student not found." });
        }
        res.status(200).json(results[0]); // Send the first result
    });
});

// Suppression d'un paiement
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    console.log("Deleting payment with ID:", id); // Debug
    if (!id) {
        return res.status(400).json({ message: 'ID is required.' });
    }

    const startTime = Date.now();
    const query = 'DELETE FROM payments WHERE id = ?';
    db.query(query, [id], (error, results) => {
        const endTime = Date.now();
        console.log(`Delete query took ${endTime - startTime} ms`);

        if (error) {
            console.error("Error deleting payment:", error);
            return res.status(500).json({ message: 'Error deleting payment.', error });
        }
        if (results.affectedRows === 0) {
            console.warn("No payment found with ID:", id);
            return res.status(404).json({ message: 'Payment not found.' });
        }
        res.status(200).json({ message: 'Payment deleted successfully.' });
    });
});



module.exports = router;
