const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { check, validationResult } = require('express-validator');

/**
 * Récupère toutes les notes d'un étudiant avec une structure complète
 * pour l'affichage dans le frontend
 */
router.get('/notes/:studentId', [
    check('studentId').isInt().withMessage('ID étudiant invalide')
], async (req, res) => {
    // Validation des paramètres
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 1. Récupération des informations de base de l'étudiant
        const [student] = await db.query(
            `SELECT id, firstName, lastName, subject, studentId 
             FROM students WHERE id = ?`,
            [req.params.studentId]
        );

        if (student.length === 0) {
            return res.status(404).json({ error: 'Étudiant non trouvé' });
        }

        // 2. Récupération des données complètes
        const [notes] = await db.query(`
            SELECT 
                ue.id AS ue_id,
                ue.nom AS ue_nom,
                ue.coefficient AS ue_coefficient,
                ue.credits,
                ue.semestre,
                ec.id AS ec_id,
                ec.nom AS ec_nom,
                ec.coefficient AS ec_coefficient,
                ne.controle_continu,
                ne.examen,
                ne.moyenne AS ec_moyenne,
                ru.moyenne AS ue_moyenne,
                ru.resultat,
                ru.credits_obtenus
            FROM notes_etudiants ne
            JOIN elements_constitutifs ec ON ne.ec_id = ec.id
            JOIN unites_enseignement ue ON ec.ue_id = ue.id
            LEFT JOIN resultats_ue ru ON 
                ru.ue_id = ue.id AND 
                ru.student_id = ne.student_id AND
                ru.annee_academique = ne.annee_academique
            WHERE ne.student_id = ?
            ORDER BY ue.semestre, ue.nom, ec.nom
        `, [req.params.studentId]);

        // 3. Structuration des données
        const response = {
            student: {
                id: student[0].id,
                firstName: student[0].firstName,
                lastName: student[0].lastName,
                subject: student[0].subject,
                studentId: student[0].studentId
            },
            semestre1: [],
            semestre2: []
        };

        // 4. Organisation par UE et EC
        notes.forEach(note => {
            const target = note.semestre === 1 ? response.semestre1 : response.semestre2;
            let ue = target.find(u => u.id === note.ue_id);

            if (!ue) {
                ue = {
                    id: note.ue_id,
                    nom: note.ue_nom,
                    coefficient: note.ue_coefficient,
                    credits: note.credits,
                    moyenne: note.ue_moyenne,
                    resultat: note.resultat,
                    ecs: []
                };
                target.push(ue);
            }

            ue.ecs.push({
                id: note.ec_id,
                nom: note.ec_nom,
                coefficient: note.ec_coefficient,
                controle_continu: note.controle_continu,
                examen: note.examen,
                moyenne: note.ec_moyenne
            });
        });

        // 5. Calcul des moyennes UE si non fournies
        [response.semestre1, response.semestre2].forEach(semestre => {
            semestre.forEach(ue => {
                if (!ue.moyenne && ue.ecs.length > 0) {
                    const total = ue.ecs.reduce((sum, ec) => sum + (ec.moyenne * ec.coefficient), 0);
                    const totalCoeff = ue.ecs.reduce((sum, ec) => sum + ec.coefficient, 0);
                    ue.moyenne = (total / totalCoeff).toFixed(2);
                }
            });
        });

        res.json(response);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur',
            details: error.message 
        });
    }
});

/**
 * Enregistre ou met à jour les notes d'un étudiant
 */
router.post('/notes/:studentId', [
    check('studentId').isInt().withMessage('ID étudiant invalide'),
    check('creditsUE').isFloat({ min: 0 }).withMessage('Crédits UE invalides'),
    check('moyenneUE').optional().isFloat({ min: 0, max: 20 }),
    check('resultatUE').isString().trim().notEmpty(),
    check('ueNotes.semestre1').isArray(),
    check('ueNotes.semestre2').isArray(),
    check('ueNotes.semestre1.*.ue').isString().trim().notEmpty(),
    check('ueNotes.semestre1.*.ec').isString().trim().notEmpty(),
    check('ueNotes.semestre1.*.coefficient').isFloat({ min: 0 }),
    check('ueNotes.semestre1.*.note').isFloat({ min: 0, max: 20 }),
    check('ueNotes.semestre1.*.ueCoefficient').isFloat({ min: 0 }),
    check('ueNotes.semestre2.*.ue').isString().trim().notEmpty(),
    check('ueNotes.semestre2.*.ec').isString().trim().notEmpty(),
    check('ueNotes.semestre2.*.coefficient').isFloat({ min: 0 }),
    check('ueNotes.semestre2.*.note').isFloat({ min: 0, max: 20 }),
    check('ueNotes.semestre2.*.ueCoefficient').isFloat({ min: 0 })
], async (req, res) => {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { studentId } = req.params;
    const { creditsUE, moyenneUE, resultatUE, ueNotes } = req.body;
    const anneeAcademique = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Suppression des anciennes notes pour cette année académique
        await connection.query(`
            DELETE ne FROM notes_etudiants ne
            JOIN elements_constitutifs ec ON ne.ec_id = ec.id
            JOIN unites_enseignement ue ON ec.ue_id = ue.id
            WHERE ne.student_id = ? AND ne.annee_academique = ?
        `, [studentId, anneeAcademique]);

        await connection.query(`
            DELETE FROM resultats_ue 
            WHERE student_id = ? AND annee_academique = ?
        `, [studentId, anneeAcademique]);

        // 2. Traitement des UE et EC
        for (const semestre of ['semestre1', 'semestre2']) {
            for (const note of ueNotes[semestre]) {
                // Vérifier/créer l'UE
                let [ue] = await connection.query(
                    `SELECT id FROM unites_enseignement 
                     WHERE nom = ? AND semestre = ?`,
                    [note.ue, semestre === 'semestre1' ? 1 : 2]
                );

                let ueId;
                if (ue.length > 0) {
                    ueId = ue[0].id;
                    await connection.query(
                        `UPDATE unites_enseignement 
                         SET coefficient = ?, credits = ?
                         WHERE id = ?`,
                        [note.ueCoefficient, creditsUE, ueId]
                    );
                } else {
                    [ue] = await connection.query(
                        `INSERT INTO unites_enseignement 
                         (code, nom, coefficient, credits, semestre) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [`UE_${Math.random().toString(36).substr(2, 5)}`, 
                         note.ue, note.ueCoefficient, creditsUE, 
                         semestre === 'semestre1' ? 1 : 2]
                    );
                    ueId = ue.insertId;
                }

                // Vérifier/créer l'EC
                let [ec] = await connection.query(
                    `SELECT id FROM elements_constitutifs 
                     WHERE nom = ? AND ue_id = ?`,
                    [note.ec, ueId]
                );

                let ecId;
                if (ec.length > 0) {
                    ecId = ec[0].id;
                    await connection.query(
                        `UPDATE elements_constitutifs 
                         SET coefficient = ? 
                         WHERE id = ?`,
                        [note.coefficient, ecId]
                    );
                } else {
                    [ec] = await connection.query(
                        `INSERT INTO elements_constitutifs 
                         (ue_id, nom, coefficient) 
                         VALUES (?, ?, ?)`,
                        [ueId, note.ec, note.coefficient]
                    );
                    ecId = ec.insertId;
                }

                // Enregistrer la note
                await connection.query(
                    `INSERT INTO notes_etudiants 
                     (student_id, ec_id, controle_continu, examen, moyenne, annee_academique, semestre) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [studentId, ecId, note.note, note.note, note.note, anneeAcademique, semestre === 'semestre1' ? 1 : 2]
                );

                // Enregistrer/mettre à jour le résultat UE
                await connection.query(
                    `INSERT INTO resultats_ue 
                     (student_id, ue_id, moyenne, credits_obtenus, resultat, annee_academique, semestre) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     moyenne = VALUES(moyenne),
                     credits_obtenus = VALUES(credits_obtenus),
                     resultat = VALUES(resultat)`,
                    [studentId, ueId, moyenneUE || note.note, creditsUE, resultatUE, anneeAcademique, semestre === 'semestre1' ? 1 : 2]
                );
            }
        }

        await connection.commit();
        res.json({ 
            success: true,
            message: 'Notes enregistrées avec succès'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'enregistrement',
            details: error.message 
        });
    } finally {
        connection.release();
    }
});

module.exports = router;