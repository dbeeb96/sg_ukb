import React, { useState, useEffect } from 'react';
import { logout } from '../../utils/authUtils';
import { Link } from 'react-router-dom';
import './Carte.css';
import {
    FaUserCog,
    FaUsers,
    FaChartBar,
    FaSignOutAlt,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBuilding,
    FaTrash, FaPrint
} from 'react-icons/fa'; // Import icons
import UploadProfilePicture from './UploadProfilePicture'; // Import the UploadProfilePicture component
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from "axios";
import {FaNoteSticky} from "react-icons/fa6";

const CarteComponent = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [imageSrc, setImageSrc] = useState("/CARTEPNG.png"); // Default image
    const handleFileChange = (event) => {

        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageSelect(e.target.result); // Update the image source in parent
            };
            reader.readAsDataURL(file);
        }
    }

    const onImageSelect = (imageSrc) => {
        console.log("Selected image:", imageSrc);  // Check the image URL or data URL
        setImageSrc(imageSrc);  // Update the state with the selected image
    };


    const handleStudentChange = (event) => {
        const studentId = event.target.value;
        const student = students.find((s) => s.id === parseInt(studentId, 10));
        setSelectedStudent(student);
    };

    const filteredStudents = students.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/students")
            .then((response) => setStudents(response.data))
            .catch((error) => {
                console.error("Error fetching students:", error);
                alert("Impossible de récupérer les données des étudiants. Veuillez réessayer plus tard.");
            });
    }, []);
    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/accountant"><FaUserGraduate/>Tableau de bord</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher/>Notes</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher/>Cerficats</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher/> Etudiants</Link></li>
                    <li><Link to="/student/manage"><FaChalkboardTeacher/>Emploi du temps</Link></li>
                    <li><Link to="/student/documents"><FaBuilding/> Documents</Link></li> {/* Added menu item */}
                </ul>
            </div>
            <div className="main-content">
                <header className="dashboard-header">
                    <h1>Documents pédagogiques!</h1>
                    <div className="user-profile">
                        <img src="/public/user-icon.png" alt="User" className="user-icon"/>
                        <div className="dropdown">
                            <button className="dropdown-btn">Profile</button>
                            <div className="dropdown-content">
                                <button onClick={logout}><FaSignOutAlt/>Se déconnecter</button>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="dashboard-title">
                    <h1>UNIVERSITE KOCC BARMA DE SAINT-LOUIS</h1>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="student-selection card p-3">
                                {/* Select Student */}
                                <div className="menu-item">
                                    <i className="fas fa-user-graduate icon"></i>
                                    <div className="student-selection">
                                        <select className="selected_st" onChange={handleStudentChange}>
                                            <option value="">-- Sélectionnez un étudiant --</option>
                                            {filteredStudents.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {`${student.firstName} ${student.lastName}`}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Rechercher par nom..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="filter_st"
                                        />
                                    </div>

                                </div>
                                {/* Upload Profile Picture */}
                                <div className="menu-item">
                                    <i className="fas fa-upload icon"></i>
                                    <UploadProfilePicture onImageSelect={setImageSrc} />
                                </div>

                                {/* Print Student Card */}
                                <div className="menu-item">
                                    <i className="fas fa-print icon"></i>
                                    <button className="btn btn-primary w-100">Imprimer la carte</button>
                                </div>
                            </div>
                            <table className="payment-table">
                                <thead>
                                <tr>
                                    <th>prénom</th>
                                    <th>Nom</th>
                                    <th>N° de dossier</th>
                                    <th>DL de naissance</th>
                                    <th>Filière</th>
                                    <th>Année académique</th>
                                    <th>Photo de L'étudiant</th>
                                    <th>Promo</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedStudent && (
                                    <tr>
                                        <td>{selectedStudent.firstName || 'N/A'}</td>
                                        <td>{selectedStudent.lastName || 'N/A'}</td>
                                        <td>{selectedStudent.studentId || 'N/A'}</td>
                                        <td>{selectedStudent.endDate || 'N/A'}</td>
                                        <td>{selectedStudent.subject || 'N/A'}</td>
                                        <td>{selectedStudent.academicYear || 'N/A'}</td>
                                        <td>
                                            <img
                                            src={imageSrc || "/young-man-with-glasses-illustration_1308-174706.avif"} // Default image if none is selected
                                            alt="Carte"
                                            width="50"
                                            className="profil"  // Class remains the same
                                        />
                                        </td>
                                        <td>{selectedStudent ? selectedStudent.level : "N/A"}</td>

                                    </tr>
                                )}
                                </tbody>
                            </table>

                            <hr/>
                        </div>
                        <hr/>
                        <hr/>
                        <div className="col-sm-9 card-container">
                            {/* ✅ Upload Section */}
                            <img src="/CARTEPNG.png" alt="Carte" className="card-image"/>
                            <img src="/assets/logo_2.png" alt="Carte" className="logo1"/>
                            {/* Display the uploaded image or a default image */}
                            <img
                                src={imageSrc || "/young-man-with-glasses-illustration_1308-174706.avif"} // Default image if none is selected
                                alt="Carte"
                                width="200"
                                className="profil"  // Class remains the same
                            />
                            <div className="footer-left">
                                <h3>Carte <br/> d'étudiant</h3>
                                <p>{selectedStudent ? selectedStudent.level : "N/A"}</p>
                            </div>
                            {/* Overlaying Text */}
                            <div className="top-header"><h2>UNIVERSITE KOCC BARMA DE SAINT-LOUIS</h2></div>
                            <div className="top-right">
                <span className="top-header-1">
                    La première université privée de Saint-Louis
                </span>
                                <span className="top-header-2">
                    Agrément de l'Etat N°220 MESRI / DESP /du 07/ Aout 2015
                </span>
                                <span className="top-header-3">
                    RC SN_STL.2015.B.0724
                </span>
                                <span className="top-header-4">
                    NINEA:0056481362k2
                </span>
                                <span className="top-header-5">
                    Device : Savoir - Leadership - Ethique - Compétence - Pouvoir - Progés
                </span>
                            </div>
                            <span className="line-1"></span>
                            <span className="line-2"></span>

                            <div className="info">
                                <div className="text-overlay-pr">
                                    <h3>Prénom: <strong
                                        className="pr">{selectedStudent ? selectedStudent.firstName : "N/A"}</strong>
                                    </h3>
                                </div>
                                <div className="text-overlay-nm">
                                    <h3>Nom: <strong
                                        className="nm">{selectedStudent ? selectedStudent.lastName : "N/A"}</strong>
                                    </h3>
                                </div>
                                <div className="text-overlay-dn">
                                    <h3>Date de Naissance: <strong
                                        className="dn">{selectedStudent ? selectedStudent.birthDay : "N/A"}</strong>
                                    </h3>
                                </div>
                                <div className="text-overlay-ln">
                                    <h3>Lieu de Naissance: <strong
                                            className="ln">{selectedStudent ? selectedStudent.address : "N/A"}</strong>
                                    </h3>
                                </div>
                                <div className="text-overlay-sb">
                                    <h3>Filière: <strong
                                        className="sb">{selectedStudent ? selectedStudent.subject : "N/A"}</strong></h3>
                                </div>
                                <div className="text-overlay-ac">
                                    <h3>Année Académique: <strong
                                        className="ac">{selectedStudent ? selectedStudent.academicYear : "N/A"}</strong>
                                    </h3>
                                </div>
                                <div className="text-overlay-nd">
                                    <h3>Numéro de Dossier: <strong
                                        className="nd">{selectedStudent ? selectedStudent.studentId : "N/A"}</strong>
                                    </h3>
                                </div>
                                <div className="footer-info">
                                    <strong>Tél:</strong> +221 77 538 91 91 / +221 77 125 33 37<br/>
                                    <strong>Email:</strong> univ.koccbarma@gmail.com <br/>
                                    <strong>Site web:</strong> www.ukb.sn <br/>
                                    <strong>Adresse: </strong>Niolofène, Avenue des Grands-Hommes X Rue Thierno Ousmane
                                    Sy<br/>
                                    <strong>BP:</strong> 5036 Saint-Louis, Senegal
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>
            <footer className="dashboard-footer">
                <p>Copyright © Developed by SupportInformatique | AppliCodeTech</p>
            </footer>
        </div>
    );
};

export default CarteComponent;
