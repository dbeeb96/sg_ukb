const express = require('express');
const mysql = require("mysql");
const router = express.Router();

// MySQL connection setup
const db = mysql.createConnection({
    host: 'ukb.clw6e00uwrd5.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Passer2025',
    database: 'ukb_db',

});

// POST request to add a payment
router.post("/", (req, res) => {
    const { student_id, montantReçu, reste, status, date, paymentMethod, receiptNumber } = req.body;

    // Get all student details including level and studentId
    const getStudentQuery = 'SELECT firstName, lastName, subject, totalFees, level, studentId FROM students WHERE id = ?';
    db.query(getStudentQuery, [student_id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error fetching student data.", error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Student not found." });
        }

        const { firstName, lastName, subject, totalFees, level, studentId } = results[0];
        const filiere = subject || "Unknown";
        const finalDate = date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
        const finalMontantReçu = montantReçu || 0.00;
        const finalReste = reste || 0.00;
        const finalStatus = status || "Unpaid";
        const finalPaymentMethod = paymentMethod || "cash";
        const finalReceiptNumber = receiptNumber || null;
        
        const query = `
            INSERT INTO payments 
            (student_id, studentId, firstName, lastName, filiere, level, totalFees, montantReçu, reste, status, date, paymentMethod, receiptNumber) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            student_id, 
            studentId,
            firstName, 
            lastName, 
            filiere, 
            level,
            totalFees, 
            finalMontantReçu, 
            finalReste, 
            finalStatus, 
            finalDate,
            finalPaymentMethod,
            finalReceiptNumber
        ];

        db.query(query, values, (error, results) => {
            if (error) {
                return res.status(500).json({ message: "Error saving payment.", error });
            }
            res.status(200).json({ message: "Payment saved successfully", data: results });
        });
    });
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { montantReçu, reste, status, paymentMethod, receiptNumber } = req.body;

    const query = `
        UPDATE payments 
        SET 
            montantReçu = ?,
            reste = ?,
            status = ?,
            paymentMethod = ?,
            receiptNumber = ?,
            date = NOW()
        WHERE id = ?
    `;
    
    const values = [
        montantReçu,
        reste,
        status,
        paymentMethod,
        receiptNumber,
        id
    ];

    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Error updating payment.", error });
        }
        res.status(200).json({ message: "Payment updated successfully", data: results });
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
// Nouvelle route pour les paiements récents
router.get('/recent/:studentId', (req, res) => {
    const limit = parseInt(req.query.limit) || 5; // Par défaut 5 derniers paiements
    
    const query = `
        SELECT 
            date,
            montantReçu,
            paymentMethod,
            status
        FROM 
            payments
        WHERE 
            student_id = ?
        ORDER BY 
            date DESC
        LIMIT ?
    `;
    
    db.query(query, [req.params.studentId, limit], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        // Formater les données pour le client
        const formattedResults = results.map(payment => ({
            ...payment,
            dayOfWeek: new Date(payment.date).toLocaleDateString('fr-FR', { weekday: 'long' })
        }));
        
        res.json(formattedResults);
    });
});

// Dans paymentRoutes.js
router.get('/history/:studentId', (req, res) => {
    const studentId = parseInt(req.params.studentId);
    
    if (isNaN(studentId)) {
        return res.status(400).json({
            success: false,
            error: "ID étudiant invalide"
        });
    }

    // Requête optimisée
    const query = `
        SELECT 
            p.date,
            p.montantReçu,
            p.paymentMethod,
            p.status,
            p.receiptNumber
        FROM payments p
        WHERE p.student_id = ?
        ORDER BY p.date DESC
    `;
    
    db.query(query, [studentId], (error, results) => {
        if (error) {
            console.error('Erreur DB:', error);
            return res.status(500).json({
                success: false,
                error: "Erreur base de données"
            });
        }

        res.json({
            success: true,
            payments: results,
            count: results.length
        });
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

// Route pour l'historique des paiements
// Standardize on :id for student identifiers
router.get('/history/:id', async (req, res) => {
    try {
        const studentId = parseInt(req.params.id);
        
        if (isNaN(studentId)) {
            return res.status(400).json({
                success: false,
                error: "ID étudiant invalide"
            });
        }

        const query = `
            SELECT 
                p.date,
                p.montantReçu,
                p.paymentMethod,
                p.status,
                p.receiptNumber
            FROM payments p
            WHERE p.student_id = ?
            ORDER BY p.date DESC
        `;
        
        db.query(query, [studentId], (error, results) => {
            if (error) {
                console.error('Erreur DB:', error);
                return res.status(500).json({
                    success: false,
                    error: "Erreur base de données"
                });
            }

            res.json({
                success: true,
                payments: results,
                count: results.length
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Similarly update the recent payments route
router.get('/recent/:id', (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const studentId = parseInt(req.params.id);
    
    if (isNaN(studentId)) {
        return res.status(400).json({ error: "ID étudiant invalide" });
    }

    const query = `
        SELECT 
            date,
            montantReçu,
            paymentMethod,
            status
        FROM payments
        WHERE student_id = ?
        ORDER BY date DESC
        LIMIT ?
    `;
    
    db.query(query, [studentId, limit], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        
        res.json(results.map(payment => ({
            ...payment,
            dayOfWeek: new Date(payment.date).toLocaleDateString('fr-FR', { weekday: 'long' })
        })));
    });
});




module.exports = router;
