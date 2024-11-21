import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
            });
            const { role } = response.data.user;
            if (role === 'admin') navigate('/admin');
            if (role === 'student') navigate('/student');
            if (role === 'accountant') navigate('/accountant');
            if (role === 'rp') navigate('/rp');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
            <p>{errorMessage}</p>
        </form>
    );
};

export default LoginForm;
