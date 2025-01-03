import React from 'react';
import { logout } from '../../utils/authUtils';
import { Link, useNavigate } from 'react-router-dom';
import './RP-Dashboard.css';
import { FaUserCog, FaUsers, FaChartBar, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher, FaBuilding } from 'react-icons/fa'; // Import icons

const RPDashboard = () => {
    const navigate = useNavigate(); // Hook to programmatically navigate

    return (
        <div className="RP-Dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Accountant Panel</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/accountant"><FaUserCog /> Settings</Link></li>
                    <li><Link to="/accountant/users"><FaUsers /> User Management</Link></li>
                    <li><Link to="/accountant/reports"><FaChartBar /> Reports</Link></li>
                    <li><Link to="/accountant/logs">System Logs</Link></li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="main-content">

                {/* Header */}
                <header className="dashboard-header">
                    <h1>Welcome, Accountant!</h1>
                    <div className="user-profile">
                        <img
                            src="/public/user-icon.png" // Replace with dynamic user image
                            alt="User"
                            className="user-icon"
                        />
                        <div className="dropdown">
                            <button className="dropdown-btn">Profile</button>
                            <div className="dropdown-content">
                                <button onClick={logout}><FaSignOutAlt />Se deconnecter</button>
                            </div>
                        </div>
                    </div>
                </header>
                {/* Title Section */}
                <div className="dashboard-title">
                    <h1>UNIVERSITE KOCC BARMA DE SAINT-LOUIS</h1>
                </div>
                {/* Counter Section */}
                <div className="dashboard-counters">
                    <div className="counter-card">
                        <FaUserGraduate className="counter-icon" />
                        <h3>Students</h3>
                        <p>1,200</p>
                    </div>
                    <div className="counter-card">
                        <FaChalkboardTeacher className="counter-icon" />
                        <h3>Teachers</h3>
                        <p>150</p>
                    </div>
                    <div className="counter-card">
                        <FaBuilding className="counter-icon" />
                        <h3>Personnel</h3>
                        <p>80</p>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Gestion des Document</h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des étudiants.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/student')}
                        >
                            Gérer les étudiants
                        </button>
                    </div>
                    <div className="card">
                        <h3>Gestion des Enseignants</h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des paiements.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/accountant/payments')}
                        >
                            Gérer les paiements
                        </button>
                    </div>
                    <div className="card">
                        <h3>Statistiques</h3>
                        <p>Générer et examiner des rapports et des analyses financiers.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/accountant/statistics')}
                        >
                            Voir les statistiques
                        </button>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <footer className="dashboard-footer">
                <p>Copyright © Developed by SupportInformatique</p>
            </footer>
        </div>

    );
};


export default RPDashboard;
