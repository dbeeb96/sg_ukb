// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'student', 'accountant', 'rp'],
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false, // Set to true once the email is verified
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// You can add instance methods to the schema (e.g., for password hashing, etc.)
const User = mongoose.model('User', userSchema);

module.exports = User;
