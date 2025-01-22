import React from 'react';
import { logout } from '../../utils/authUtils';
import { Link, useNavigate } from 'react-router-dom';
import './RP-Dashboard.css';
import { FaUserCog, FaUsers, FaChartBar, FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher, FaBuilding } from 'react-icons/fa'; // Import icons
import { useState, useEffect } from "react";

const AccountantDashboard = () => {
    const navigate = useNavigate(); // Hook to programmatically navigate
    const [studentCount, setStudentCount] = useState(0);

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Responsable pédagogique</h2>
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
                    <h1>Bienvenu, RP!</h1>
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
                        <h3>ETUDIANTS</h3>
                        <p>{studentCount.toLocaleString()}</p>
                    </div>
                    <div className="counter-card">
                        <FaChalkboardTeacher className="counter-icon"/>
                        <h3>PROFESSEURS</h3>
                        <p>150</p>
                    </div>
                    <div className="counter-card">
                        <FaBuilding className="counter-icon"/>
                        <h3>PERSONNEL</h3>
                        <p>80</p>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-cards">
                    <div className="cards">
                        <h3>Gestion des documents</h3>
                        <p>Cliquez sur le bouton pour gérer la gestion des paiements.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/documents')}
                        >
                            Consulter
                        </button>
                    </div>
                    <div className="cards">
                        <h3>Statistiques</h3>
                        <p>Générer et examiner des rapports et des analyses financiers.</p>
                        <button
                            className="redirect-button"
                            onClick={() => navigate('/accountant/statistics')}
                        >
                            Consulter
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
