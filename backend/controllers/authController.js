// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
// Example usage for hashing a password
const hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
};
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Hash the password and save the user (this part depends on your database logic)
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('User registration data:', { email, hashedPassword });

        // Simulate saving user logic, replace this with your database code
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error); // Log the full error stack
        res.status(500).json({ message: 'An error occurred while registering' });
    }
};

// Example usage for comparing a password
const checkPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};
const db = require('../config/db'); // Import the database connection

// Login Endpoint
exports.login = (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (error, results) => {
        if (error || results.length === 0) return res.status(400).json({ message: "Invalid email or password." });

        const user = results[0];

        if (!user.is_verified) {
            return res.status(400).json({ message: "Please verify your email first." });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) return res.status(400).json({ message: "Invalid email or password." });

            // Send a success response and user role
            res.json({ success: true, role: user.role });
        });
    });
};
// Export functions
module.exports = { registerUser };