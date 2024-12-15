import React from 'react';
import { logout } from '../../utils/authUtils';
import { Link, useNavigate } from 'react-router-dom';
import './AccountantDashboard.css';
import { FaUserCog, FaUsers, FaChartBar, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher, FaBuilding } from 'react-icons/fa'; // Import icons

const AccountantDashboard = () => {
    const navigate = useNavigate(); // Hook to programmatically navigate

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/accountant"><FaUserGraduate/>Tableau de bord</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher/> Manage Students</Link></li>
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
                                <button onClick={logout}><FaSignOutAlt/>Se deconnecter</button>
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
                        <FaUserGraduate className="counter-icon"/>
                        <h3>Students</h3>
                        <p>1,200</p>
                    </div>
                    <div className="counter-card">
                        <FaChalkboardTeacher className="counter-icon"/>
                        <h3>Teachers</h3>
                        <p>150</p>
                    </div>
                    <div className="counter-card">
                        <FaBuilding className="counter-icon"/>
                        <h3>Personnel</h3>
                        <p>80</p>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-cards">
                    <div className="cards">
                        <h3>Gestion des étudiants</h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des étudiants.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/student')}
                        >
                            Gérer les étudiants
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Gestion des paiements</h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des paiements.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/payment')}
                        >
                            Gérer les paiements
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Statistiques</h3>
                        <p>Générer et examiner des rapports et des analyses financiers.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/accountant/statistics')}
                        >
                            Voir les statistiques
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Gestion du personnel</h3>
                        <p>Notes, attestations, etc.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/accountant/documents')}
                        >
                            Gérer les documents
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


export default AccountantDashboard;
