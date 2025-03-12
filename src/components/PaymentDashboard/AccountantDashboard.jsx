import React, { useEffect, useState } from 'react';
import { logout } from '../../utils/authUtils';
import { Link, useNavigate } from 'react-router-dom';
import './AccountantDashboard.css';
import {FaSignOutAlt, FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaBars, FaTimes } from 'react-icons/fa'; // Import icons

const AccountantDashboard = () => {
    const [studentCount, setStudentCount] = useState(0);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false); // State to manage sidebar visibility

    useEffect(() => {
        fetch("http://localhost:5000/api/students/count")
            .then((response) => response.json())
            .then((data) => {
                setStudentCount(data.count);
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération du nombre d'étudiants :", error);
            });
    }, []);
    
    const navigate = useNavigate(); // Hook to programmatically navigate
    
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible); // Toggle sidebar visibility
    };
    
    return (
        <div className="admin-dashboard">
            {/* Sidebar Toggle Button */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isSidebarVisible ? <FaTimes /> : <FaBars />} Menu
            </button>
    
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarVisible ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        <FaTimes /> {/* Close icon */}
                    </button>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/accountant"><FaUserGraduate />Tableau de bord</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher /> Manage Students</Link></li>
                </ul>
            </div>
    
            {/* Main Content Area */}
            <div className={`main-content ${isSidebarVisible ? 'shifted' : ''}`}>
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
                        <p>{studentCount}</p>
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
                <p>Copyright © Developed by SupportInformatique | AppliCodeTech</p>
            </footer>
        </div>
    );
};

export default AccountantDashboard;