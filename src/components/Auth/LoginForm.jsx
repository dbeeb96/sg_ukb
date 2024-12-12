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

        // Regex to allow emails ending with @ukb
        const emailRegex = /^[a-zA-Z0-9._%+-]+@ukb.sn$/i; // 'i' makes it case-insensitive
        if (!emailRegex.test(email)) {
            setErrorMessage('Seuls les emails @ukb.sn sont autorisés.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
            });
            console.log(response.data); // Debugging: Log the response to check
            const {role} = response.data.user;
            if (role === 'admin') navigate('/admin');
            else if (role === 'student') navigate('/student');
            else if (role === 'accountant') navigate('/accountant');
            else if (role === 'rp') navigate('/rp');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'La connexion a échoué.');
        }
    }

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-card">
                <h2>Login</h2>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
        </div>
    );
};

export default LoginForm;
