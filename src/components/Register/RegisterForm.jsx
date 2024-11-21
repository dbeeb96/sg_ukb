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
            const response = await axios.post('http://localhost:5000/api/register', {
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
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="accountant">Accountant</option>
                <option value="rp">RP</option>
            </select>
            <button type="submit">Register</button>
            <p>{message}</p>
        </form>
    );
};

export default RegisterForm;