const express = require('express');
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
  host: 'ukb.clw6e00uwrd5.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'Passer2025',
  database: 'ukb_db',
});

// Gestion des erreurs de connexion
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    // Réessayer la connexion ou quitter selon votre préférence
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Gestion des erreurs de connexion perdue
db.on('error', err => {
  console.error('MySQL error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    // Reconnexion
    db.connect();
  } else {
    throw err;
  }
});

const cors = require('cors');

// Autorise toutes les origines (à restreindre en production)
router.use(cors());

// Ou une configuration plus sécurisée :
router.use(cors({
  origin: ['https://votre-frontend.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


router.post("/", (req, res) => {
    console.log("Requête reçue:", req.body); // Log la requête entrante
    
    const { student_id, montantReçu, reste, status, date, paymentMethod, receiptNumber } = req.body;

    if (!student_id) {
        console.error("ID étudiant manquant");
        return res.status(400).json({ 
            success: false,
            message: "L'ID étudiant est requis." 
        });
    }

    console.log("Tentative de récupération de l'étudiant:", student_id);
    
    const getStudentQuery = 'SELECT firstName, lastName, subject, totalFees, level, studentId FROM students WHERE id = ?';
    
    db.query(getStudentQuery, [student_id], (error, results) => {
        if (error) {
            console.error("Erreur DB:", error);
            return res.status(500).json({ 
                success: false,
                message: "Erreur serveur", 
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }

        if (results.length === 0) {
            console.error("Étudiant non trouvé:", student_id);
            return res.status(404).json({ 
                success: false,
                message: "Étudiant non trouvé." 
            });
        }

        const student = results[0];
        console.log("Étudiant trouvé:", student);

        const query = `
            INSERT INTO payments 
            (student_id, studentId, firstName, lastName, filiere, level, totalFees, 
             montantReçu, reste, status, date, paymentMethod, receiptNumber) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            student_id, 
            student.studentId,
            student.firstName, 
            student.lastName, 
            student.subject || "Unknown", 
            student.level,
            student.totalFees,
            montantReçu || 0,
            reste || student.totalFees,
            status || "Non Payé",
            date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : 
                  new Date().toISOString().slice(0, 19).replace('T', ' '),
            paymentMethod || "cash",
            receiptNumber || null
        ];

        console.log("Exécution de la requête avec valeurs:", values);
        
        db.query(query, values, (error, results) => {
            if (error) {
                console.error("Erreur d'insertion:", {
                    message: error.message,
                    code: error.code,
                    sqlMessage: error.sqlMessage,
                    sql: error.sql
                });
                return res.status(500).json({ 
                    success: false,
                    message: "Erreur lors de l'enregistrement",
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                    code: error.code
                });
            }
            
            console.log("Paiement enregistré avec ID:", results.insertId);
            res.status(201).json({ 
                success: true,
                message: "Paiement enregistré",
                paymentId: results.insertId
            });
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
router.get('/history/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    
    if (isNaN(studentId)) {
        return res.status(400).json({
            success: false,
            error: "ID étudiant invalide"
        });
    }

    const query = `
        SELECT 
            id,
            DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as date,
            montantReçu,
            paymentMethod,
            status,
            receiptNumber
        FROM payments
        WHERE student_id = ?
        ORDER BY date DESC
        LIMIT 100
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
