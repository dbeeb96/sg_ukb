const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dbeeb',
    password: 'papesaloum',
    database: 'ukb_st'
});

// GET all students
router.get('/', (req, res) => {
    const query = 'SELECT * FROM students';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// GET student by ID
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
        res.json(results[0]);
    });
});

// POST new student
router.post('/', (req, res) => {
    const { firstName, lastName, age, phoneNumber, studentId, address, monthlyFees, totalFees, subject, startDate, endDate } = req.body;

    const query = `INSERT INTO students (firstName, lastName, age, phoneNumber, studentId, address, monthlyFees, totalFees, subject, startDate, endDate)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [firstName, lastName, age, phoneNumber, studentId, address, monthlyFees, totalFees, subject, startDate, endDate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: result.insertId, ...req.body });
    });
});

// PUT update student
router.put('/:id', (req, res) => {
    const { firstName, lastName, age, phoneNumber, studentId, address, monthlyFees, totalFees, subject, startDate, endDate } = req.body;

    const query = `UPDATE students SET firstName = ?, lastName = ?, age = ?, phoneNumber = ?, studentId = ?, address = ?, monthlyFees = ?, totalFees = ?, subject = ?, startDate = ?, endDate = ? 
                   WHERE id = ?`; // Use 'id' in WHERE clause
    db.query(query, [firstName, lastName, age, phoneNumber, studentId, address, monthlyFees, totalFees, subject, startDate, endDate, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student updated successfully' });
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