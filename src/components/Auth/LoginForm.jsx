import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        // Regex to allow emails ending with @ukb
        const emailRegex = /^[a-zA-Z0-9._%+-]+@ukb\.sn$/i; // 'i' makes it case-insensitive
        if (!emailRegex.test(email)) {
            setErrorMessage('Seuls les emails @ukb.sn sont autorisés.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('https://sg-ukb.onrender.com/api/login', {
                email,
                password,
            });
            const { role } = response.data.user;
            navigateToRoleBasedPage(role);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'La connexion a échoué.');
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToRoleBasedPage = (role) => {
        switch (role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'student':
                navigate('/student');
                break;
            case 'accountant':
                navigate('/accountant');
                break;
            case 'rp':
                navigate('/rp');
                break;
            default:
                setErrorMessage('Rôle non reconnu.');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-card">
                <h2>Se connecter</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-describedby="email-error"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-describedby="password-error"
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Connexion en cours...' : 'Connexion'}
                </button>
                {errorMessage && (
                    <p className="error-message" id="email-error">
                        {errorMessage}
                    </p>
                )}
                <p className="forgot-password">
                    <a href="/forgot-password">Mot de passe oublié?</a>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;
