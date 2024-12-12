import React from 'react';
import { logout } from '../../utils/authUtils';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import { FaUserCog, FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa'; // Import icons

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/admin"><FaUserCog /> Settings</Link></li>
                    <li><Link to="/admin/users"><FaUsers /> User Management</Link></li>
                    <li><Link to="/admin/reports"><FaChartBar /> Reports</Link></li>
                    <li><Link to="/admin/logs">System Logs</Link></li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="main-content">
                {/* Header */}
                <header className="dashboard-header">
                    <h1>Welcome, Admin!</h1>
                    <div className="user-profile">
                        <img
                            src="/public/user-icon.png" // Replace with dynamic user image
                            alt="User"
                            className="user-icon"
                        />
                        <div className="dropdown">
                            <button className="dropdown-btn">Profile</button>
                            <div className="dropdown-content">
                                <button onClick={logout}><FaSignOutAlt /> Logout</button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>User Management</h3>
                        <p>Manage system users, assign roles, and monitor activity.</p>
                    </div>
                    <div className="card">
                        <h3>System Settings</h3>
                        <p>Configure application settings and manage preferences.</p>
                    </div>
                    <div className="card">
                        <h3>Reports</h3>
                        <p>Generate and review detailed system reports and analytics.</p>
                    </div>
                    <div className="card">
                        <h3>System Logs</h3>
                        <p>Review activity logs and track system performance.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
