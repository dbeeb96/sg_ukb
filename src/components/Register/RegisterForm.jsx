import React, { useState } from 'react';
import axios from 'axios';
import './RegisterForm.css';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://sg-ukb.onrender.com/api/register', {
                email,
                password,
                role,
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleRegister} className="register-card">
                <h2>Register</h2>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Etudiant</option>
                    <option value="admin">Admin</option>
                    <option value="accountant">Comptable</option>
                    <option value="rp">RP</option>
                </select>
                <button type="submit">S'enregistrer</button>
                <p>{message}</p>
            </form>
        </div>
    );
};

export default RegisterForm;
