// src/components/Admin/AdminDashboard.jsx
import React from 'react';
import { logout } from '../../utils/authUtils';  // Import the logout function

const AdminDashboard = () => {
    return (
        <div>
            <h1>Welcome to the Admin Dashboard</h1>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default AdminDashboard;
