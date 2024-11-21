// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true'; // Check login status
    const userRole = localStorage.getItem('userRole'); // Get user role from localStorage

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Ensure the user is redirected based on their role if they are logged in
    if (userRole === 'admin' && location.pathname !== '/admin') {
        return <Navigate to="/admin" />;
    }
    if (userRole === 'student' && location.pathname !== '/student') {
        return <Navigate to="/student" />;
    }
    if (userRole === 'accountant' && location.pathname !== '/accountant') {
        return <Navigate to="/accountant" />;
    }
    if (userRole === 'rp' && location.pathname !== '/rp') {
        return <Navigate to="/rp" />;
    }

    return children; // Render the protected route if the user is logged in and has the correct role
};

export default ProtectedRoute;
