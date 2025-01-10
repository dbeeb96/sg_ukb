import React from 'react';
import { logout } from '../../utils/authUtils';
import { Link, useNavigate } from 'react-router-dom';
import './Documents.css';
import { FaUserCog, FaUsers, FaChartBar, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher, FaBuilding } from 'react-icons/fa'; // Import icons

const AccountantDashboard = () => {
    const navigate = useNavigate(); // Hook to programmatically navigate

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>GESTION DES NOTES</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/rp"><FaUserGraduate/>Tableau de bord</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher/> Manage Students</Link></li>
                </ul>
            </div>
            {/* Main Content Area */}
            <div className="main-content">

                {/* Header */}
                <header className="dashboard-header">
                    <h1>Bienvenue, Responsable pédagogique!</h1>
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
                <div className="dashboard-cards">
                    <div className="cards">
                        <h3>Notes des étudiants</h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des étudiants.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/rp/notes')}
                        >
                            Gérer les étudiants
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Certfication </h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des paiements.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/payment')}
                        >
                            Gérer les paiements
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Calendrier</h3>
                        <p>Générer et examiner des rapports et des analyses financiers.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/accountant/statistics')}
                        >
                            Consulter
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Rapports</h3>
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
                <p>Copyright © Developed by SupportInformatique | AppliCodeTech</p>
            </footer>
        </div>

    );
};

export default AccountantDashboard;
