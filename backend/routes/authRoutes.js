const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();
const saltRounds = 10;

// Register
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        db.query(query, [email, hashedPassword, role], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
            }
            res.status(201).json({ message: 'L\'utilisateur s\'est enregistré avec succès.' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur de serveur.' });
    }
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'L\'e-mail et le mot de passe sont requis.' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erreur de serveur.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe invalide..' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email ou mot de passe invalide.' });
        }

        res.status(200).json({
            message: 'Connexion réussie\n.',
            user: { id: user.id, email: user.email, role: user.role },
        });
    });
});

module.exports = router;
