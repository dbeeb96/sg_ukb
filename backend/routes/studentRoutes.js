const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
    host: 'ukb.clw6e00uwrd5.eu-north-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Passer2025',
    database: 'ukb_db',
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
    const { firstName, lastName, phoneNumber, studentId, address, 
            birthDay, academicYear, monthlyFees, totalFees, 
            subject, level, startDate, endDate } = req.body;

    // Valider que les dates obligatoires sont présentes
    if (!birthDay || !startDate || !endDate) {
        return res.status(400).json({ error: 'Les dates (naissance, début, fin) sont obligatoires' });
    }

    const query = `
        INSERT INTO students (
            firstName, lastName, phoneNumber, studentId, address, 
            birthDay, academicYear, monthlyFees, totalFees, 
            subject, level, startDate, endDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        firstName,
        lastName,
        phoneNumber,
        studentId,  // Note: Vous aviez mis 'level' à la place de studentId dans votre exemple
        address,
        toMySQLDate(birthDay),
        academicYear,
        monthlyFees,
        totalFees,
        subject,
        level,
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
        
        res.status(201).json({
            id: result.insertId,
            ...req.body,
            birthDay: birthDay,  // On conserve le format français dans la réponse
            startDate: startDate,
            endDate: endDate
        });
    });
});
// PUT update student avec gestion du format JJ/MM/AAAA
router.put('/:id', (req, res) => {
    const { 
        firstName, lastName, phoneNumber, level, studentId, address, 
        birthDay, academicYear, monthlyFees, totalFees, 
        subject, startDate, endDate 
    } = req.body;

    // Fonction de validation et conversion de date
    const validateAndConvertDate = (dateStr, fieldName) => {
        if (!dateStr) return null;
        
        // Vérifier si c'est déjà au format YYYY-MM-DD (pour compatibilité)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        
        // Vérifier le format JJ/MM/AAAA
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(dateRegex);
        
        if (!match) {
            throw new Error(`Format de date invalide pour ${fieldName}. Utilisez JJ/MM/AAAA`);
        }
        
        const [_, day, month, year] = match;
        const dateObj = new Date(`${year}-${month}-${day}`);
        
        // Vérifier que la date est valide
        if (isNaN(dateObj.getTime())) {
            throw new Error(`Date invalide pour ${fieldName}`);
        }
        
        return `${year}-${month}-${day}`; // Format MySQL
    };

    try {
        // Convertir les dates avec validation
        const mysqlBirthDay = validateAndConvertDate(birthDay, 'birthDay');
        const mysqlStartDate = validateAndConvertDate(startDate, 'startDate');
        const mysqlEndDate = validateAndConvertDate(endDate, 'endDate');

        const query = `
            UPDATE students 
            SET 
                firstName = ?, 
                lastName = ?, 
                phoneNumber = ?, 
                level = ?,  
                studentId = ?, 
                address = ?, 
                birthDay = ?, 
                academicYear = ?, 
                monthlyFees = ?, 
                totalFees = ?, 
                subject = ?, 
                startDate = ?, 
                endDate = ?
            WHERE id = ?`;

        const params = [
            firstName,
            lastName,
            phoneNumber,
            level,  // J'ai corrigé l'ordre pour mettre 'level' avant 'studentId'
            studentId,
            address,
            mysqlBirthDay,
            academicYear,
            monthlyFees || null,
            totalFees || null,
            subject,
            mysqlStartDate,
            mysqlEndDate,
            req.params.id
        ];

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Erreur de base de données:', err);
                return res.status(500).json({ 
                    error: 'Échec de la mise à jour',
                    details: err.sqlMessage
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Étudiant non trouvé' });
            }

            // Retourner les dates au format JJ/MM/AAAA
            res.status(200).json({
                message: 'Étudiant mis à jour avec succès',
                student: {
                    ...req.body,
                    id: req.params.id,
                    birthDay: birthDay, // Format original JJ/MM/AAAA
                    startDate: startDate, // Format original JJ/MM/AAAA
                    endDate: endDate // Format original JJ/MM/AAAA
                }
            });
        });

    } catch (error) {
        console.error('Erreur de validation:', error);
        return res.status(400).json({
            error: error.message
        });
    }
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
