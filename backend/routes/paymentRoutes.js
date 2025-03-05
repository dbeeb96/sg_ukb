const express = require("express");
const mysql = require("mysql");
const router = express.Router();

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "dbeeb",
    password: "papesaloum",
    database: "ukb_st",
});

// ✅ Create a new payment
router.post("/", (req, res) => {
    const { student_id, montantReçu, reste, status, date } = req.body;

    // Get student details
    const getStudentQuery = "SELECT firstName, lastName, subject AS filiere, totalFees FROM students WHERE id = ?";
    db.query(getStudentQuery, [student_id], (error, results) => {
        if (error) return res.status(500).json({ message: "Error fetching student data.", error });
        if (results.length === 0) return res.status(404).json({ message: "Student not found." });

        const { firstName, lastName, filiere, totalFees } = results[0];
        const finalDate = date ? new Date(date).toISOString().slice(0, 19).replace("T", " ") : new Date().toISOString().slice(0, 19).replace("T", " ");
        const finalMontantReçu = montantReçu || 0.0;
        const finalReste = reste || 0.0;
        const finalStatus = status || "Unpaid";

        const query = `
            INSERT INTO payments (student_id, firstName, lastName, filiere, totalFees, montantReçu, reste, status, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [student_id, firstName, lastName, filiere, totalFees, finalMontantReçu, finalReste, finalStatus, finalDate];

        db.query(query, values, (error, results) => {
            if (error) return res.status(500).json({ message: "Error saving payment.", error });
            res.status(200).json({ message: "Payment saved successfully", data: results });
        });
    });
});

// ✅ Get all payments
router.get("/", (req, res) => {
    db.query("SELECT * FROM payments", (error, results) => {
        if (error) return res.status(500).json({ message: "Error fetching payments.", error });
        res.status(200).json(results);
    });
});

// ✅ Get all receipts for a specific student
router.get("/:studentId/receipts", (req, res) => {
    const { studentId } = req.params;

    const query = "SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC";
    db.query(query, [studentId], (error, results) => {
        if (error) return res.status(500).json({ message: "Error fetching receipts.", error });
        if (results.length === 0) return res.status(404).json({ message: "No receipts found for this student." });

        res.status(200).json(results);
    });
});

// ✅ Get all invoices for a specific student
router.get("/api/invoices", (req, res) => {
    const studentId = req.query.studentId;
    const query = "SELECT * FROM payments WHERE student_id = ?";
    db.query(query, [studentId], (error, results) => {
      if (error) return res.status(500).json({ message: "Error fetching invoices.", error });
      res.status(200).json(results);
    });
  });

  // ✅ Get all invoices for a specific student
router.get("/api/invoices", (req, res) => {
    console.log("Received request to /api/invoices");
    const studentId = req.query.studentId;
    console.log(`Student ID: ${studentId}`);
    const query = "SELECT * FROM payments WHERE student_id = ?";
    db.query(query, [studentId], (error, results) => {
      if (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({ message: "Error fetching invoices.", error });
      }
      console.log("Invoices fetched successfully");
      console.log(results);
      res.status(200).json(results);
    });
  });
  
router.get("/:studentId/receipts", (req, res) => {
    const { studentId } = req.params;

    const query = "SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC";
    db.query(query, [studentId], (error, results) => {
        if (error) return res.status(500).json({ message: "Error fetching receipts.", error });
        if (results.length === 0) return res.status(404).json({ message: "No receipts found for this student." });

        res.status(200).json(results);
    });      
});


// ✅ Get a single student payment details
router.get("/:studentId", (req, res) => {
    const { studentId } = req.params;

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
        LEFT JOIN payments p ON s.id = p.student_id
        LEFT JOIN (
            SELECT student_id, montantReçu, reste, status, MAX(date) AS last_payment_date
            FROM payments GROUP BY student_id
        ) latest_payment ON s.id = latest_payment.student_id
        WHERE s.id = ?
        GROUP BY s.id, latest_payment.montantReçu, latest_payment.reste, latest_payment.status
        ORDER BY latest_payment.last_payment_date DESC
        LIMIT 1;
    `;

    db.query(query, [studentId], (error, results) => {
        if (error) return res.status(500).json({ message: "Error fetching student details.", error });
        if (results.length === 0) return res.status(404).json({ message: "Student not found." });

        res.status(200).json(results[0]);
    });
});

// ✅ Get all invoices for a specific student
router.get("/invoices", (req, res) => {
    const studentId = req.query.studentId;
    const query = "SELECT * FROM payments WHERE student_id = ?";
    db.query(query, [studentId], (error, results) => {
      if (error) return res.status(500).json({ message: "Error fetching invoices.", error });
      res.status(200).json(results);
    });
  });
  

// ✅ Update a payment
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { montantReçu, reste, status, date } = req.body;

    if (!id || !montantReçu || !reste || !status || !date) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const finalDate = new Date(date).toISOString().slice(0, 19).replace("T", " ");
    const query = "UPDATE payments SET montantReçu = ?, reste = ?, status = ?, date = ? WHERE id = ?";

    db.query(query, [montantReçu, reste, status, finalDate, id], (error, results) => {
        if (error) return res.status(500).json({ message: "Error updating payment.", error });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Payment not found." });

        res.status(200).json({ message: "Payment updated successfully" });
    });
});

// ✅ Delete a payment
router.delete("/:id", (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID is required." });

    const query = "DELETE FROM payments WHERE id = ?";
    db.query(query, [id], (error, results) => {
        if (error) return res.status(500).json({ message: "Error deleting payment.", error });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Payment not found." });

        res.status(200).json({ message: "Payment deleted successfully." });
    });
});

router.get("/api/invoices", async (req, res) => {
    const studentId = req.query.studentId;
    console.log("Requête reçue pour les factures de l'étudiant:", studentId);

    if (!studentId) {
        console.error("Erreur: Student ID manquant !");
        return res.status(400).json({ error: "Student ID required" });
    }

    try {
        const invoices = await getInvoicesByStudentId(studentId);  // Ta logique de récupération
        console.log("Factures récupérées:", invoices);
        res.json(invoices);
    } catch (err) {
        console.error("Erreur lors de la récupération des factures:", err);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

const fetchInvoices = async () => {
    try {
        const response = await fetch(`/api/invoices?studentId=${student.id}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des factures.");
        }
        const data = await response.json();
        console.log("Factures récupérées:", data);
        setInvoices(data);
    } catch (error) {
        console.error("Erreur lors du chargement des factures:", error);
    }
};



module.exports = router; // ✅ Export the router
