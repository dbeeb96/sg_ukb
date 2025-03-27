const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
   host: 'ukb.clw6e00uwrd5.eu-north-1.rds.amazonaws.com',   // Database host
    user: 'admin',        // Database username
    password: 'Passer2025',// Database password
    database: 'ukb_db' ,// Database name
    connectionLimit: 10, // Allows multiple connections
});

// Fonctions de conversion de dates
const toMySQLDate = (frenchDate) => {
    if (!frenchDate) return null;
    const [day, month, year] = frenchDate.split('/');
    return `${year}-${month}-${day}`;
};

const toFrenchDate = (mysqlDate) => {
    if (!mysqlDate) return null;
    const date = new Date(mysqlDate);
    if (isNaN(date.getTime())) return null;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// GET all students (avec conversion des dates)
router.get('/', (req, res) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Convertir les dates au format français
        const formattedResults = results.map(student => ({
            ...student,
            birthDay: toFrenchDate(student.birthDay),
            startDate: toFrenchDate(student.startDate),
            endDate: toFrenchDate(student.endDate)
        }));
        
        res.json(formattedResults);
    });
});

// GET student by ID (avec conversion des dates)
router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM students WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Convertir les dates au format français
        const formattedStudent = {
            ...results[0],
            birthDay: toFrenchDate(results[0].birthDay),
            startDate: toFrenchDate(results[0].startDate),
            endDate: toFrenchDate(results[0].endDate)
        };
        
        res.json(formattedStudent);
    });
});

// POST new student (avec conversion des dates)
router.post('/', (req, res) => {
    const { birthDay, startDate, endDate, ...otherFields } = req.body;

    const query = `
        INSERT INTO students (
            firstName, lastName, phoneNumber, studentId, address, 
            birthDay, academicYear, monthlyFees, totalFees, 
            subject, level, startDate, endDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        otherFields.firstName,
        otherFields.lastName,
        otherFields.phoneNumber,
        otherFields.studentId,
        otherFields.address,
        toMySQLDate(birthDay),
        otherFields.academicYear,
        otherFields.monthlyFees,
        otherFields.totalFees,
        otherFields.subject,
        otherFields.level,
        toMySQLDate(startDate),
        toMySQLDate(endDate)
    ];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database operation failed',
                details: err.sqlMessage
            });
        }
        
        // Renvoyer les données avec les dates en format français
        res.status(201).json({
            id: result.insertId,
            ...req.body,
            birthDay: birthDay,
            startDate: startDate,
            endDate: endDate
        });
    });
});

// PUT update student (avec conversion des dates)
router.put('/:id', (req, res) => {
    const { 
        firstName, lastName, phoneNumber, studentId, address, 
        birthDay, academicYear, monthlyFees, totalFees, 
        subject, level, startDate, endDate 
    } = req.body;

    const query = `
        UPDATE students 
        SET 
            firstName = ?, 
            lastName = ?, 
            phoneNumber = ?, 
            studentId = ?, 
            address = ?, 
            birthDay = ?, 
            academicYear = ?, 
            monthlyFees = ?, 
            totalFees = ?, 
            subject = ?, 
            level = ?,  
            startDate = ?, 
            endDate = ?
        WHERE id = ?`;

    const params = [
        firstName,
        lastName,
        phoneNumber,
        studentId,
        address,
        toMySQLDate(birthDay),
        academicYear,
        monthlyFees,
        totalFees,
        subject,
        level,
        toMySQLDate(startDate),
        toMySQLDate(endDate),
        req.params.id
    ];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database operation failed',
                details: err.sqlMessage
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Renvoyer les données avec les dates en format français
        res.status(200).json({
            message: 'Student updated successfully',
            student: {
                ...req.body,
                id: req.params.id
            }
        });
    });
});

// DELETE student
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM students WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    });
});

module.exports = router;
