import React, { useState, useEffect } from 'react';
import { logout } from '../../utils/authUtils';
import { Link } from 'react-router-dom';
import './Notes.css';

import {
    FaUserGraduate,
    FaBook,
    FaCalendarAlt,
    FaCertificate,
    FaSignOutAlt, FaTrash, FaPrint, FaStickyNote, FaArrowLeft, FaArrowRight, FaChalkboardTeacher,
} from 'react-icons/fa';
import axios from "axios";
import { FaNoteSticky } from "react-icons/fa6";

const Notes = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [note, setNote] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [score, setScore] = useState('');
    const [filiere, setFiliere] = useState('');
    const [numeroCarte, setNumeroCarte] = useState('');
    const [creditsUE, setCreditsUE] = useState('');
    const [moyenneUE, setMoyenneUE] = useState('');
    const [resultatUE, setResultatUE] = useState('');
    const [elementsConstitutifs, setElementsConstitutifs] = useState('');
    const [coefficient, setCoefficient] = useState('');
    const [controleContinu, setControleContinu] = useState('');
    const [examen, setExamen] = useState('');
    const [moyenneEC, setMoyenneEC] = useState('');

    const handleOpenPopup = (student) => {
        setSelectedStudent(student);
        setIsPopupOpen(true);
    };

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/students")
            .then((response) => setStudents(response.data))
            .catch((error) => {
                console.error("Error fetching students:", error);
                alert("Impossible de récupérer les données des étudiants. Veuillez réessayer plus tard.");
            });
    }, []);

    const handleStudentChange = (event) => {
        const studentId = event.target.value;
        const student = students.find((s) => s.id === parseInt(studentId, 10));
        setSelectedStudent(student);
    };

    const filteredStudents = students.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveNote = () => {
        if (!selectedStudent) return;
        axios.post(`/api/students/${selectedStudent.id}/notes`, { note })
            .then(() => {
                console.log(`Note enregistrée pour l'étudiant ID: ${selectedStudent.id}`);
                setIsPopupOpen(false);
                setNote('');
            })
            .catch((error) => {
                console.error("Erreur lors de l'/enregistrement de la note:", error);
            });
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/rp"><FaUserGraduate/>Tableau de bord</Link></li>
                    <li><Link to="/student/notes"><FaBook/> Gérer Notes</Link></li>
                    <li><Link to="/student/timetable"><FaCalendarAlt/>Emplois du temps</Link></li>
                    <li><Link to="/student/certifications"><FaCertificate/>Attestation</Link></li>
                    <li><Link to="/student/certifications"><FaCertificate/>Carte Étudiant</Link></li>
                    <li><Link to="/student/certifications"><FaCertificate/>Calendrier</Link></li>
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
                <div className="payment-section">
                    <table className="payment-table">
                        <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Filières</th>
                            <th>N°Carte</th>
                            <th>Crédits (UE)</th>
                            <th>Moyenne (UE)</th>
                            <th>Résultat (UE)</th>
                            <th>Éléments Constitutifs (EC)</th>
                            <th>Coefficient</th>
                            <th>Contrôle Continu</th>
                            <th>Examen</th>
                            <th>Moyenne (EC)</th>
                            <th style={{textAlign: "right"}}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedStudent && (
                            <tr>
                                <td>{selectedStudent.firstName} {selectedStudent.lastName}</td>
                                <td>{selectedStudent.subject || 'N/A'}</td>
                                <td>{selectedStudent.studentId || 'N/A'}</td>
                                <td>{selectedStudent.credits || 'N/A'}</td>
                                <td>{selectedStudent.moyenneUE || 'N/A'}</td>
                                <td>{selectedStudent.resultatUE || 'N/A'}</td>
                                <td>{selectedStudent.elementsConstitutifs || 'N/A'}</td>
                                <td>{selectedStudent.coefficient || 'N/A'}</td>
                                <td>{selectedStudent.controleContinu || 'N/A'}</td>
                                <td>{selectedStudent.examen || 'N/A'}</td>
                                <td>{selectedStudent.moyenneEC || 'N/A'}</td>
                                <td style={{textAlign: "right"}} className="btn">
                                    <button className="icon-btn1" onClick={() => handleOpenPopup(selectedStudent)}>
                                        <FaNoteSticky/>
                                    </button>
                                    <button className="icon-btn2"><FaTrash/></button>
                                    <button className="icon-btn3"><FaPrint/></button>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {isPopupOpen && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h3>AJOUTER UNE NOTE</h3>
                            <p>Étudiant : <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong></p>

                            {/* Filières */}
                            <label>Filières :</label>
                            <input
                                type="text"
                                value={filiere}
                                onChange={(e) => setFiliere(e.target.value)}
                                placeholder="Saisissez la filière..."
                            />

                            {/* Numéro Carte */}
                            <label>N° Carte :</label>
                            <input
                                type="text"
                                value={numeroCarte}
                                onChange={(e) => setNumeroCarte(e.target.value)}
                                placeholder="Saisissez le numéro de carte..."
                            />

                            {/* Crédits UE */}
                            <label>Crédits (UE) :</label>
                            <input
                                type="number"
                                value={creditsUE}
                                onChange={(e) => setCreditsUE(e.target.value)}
                                placeholder="Saisissez les crédits..."
                            />
                            {/* Moyenne UE */}
                            <label>Moyenne (UE) :</label>
                            <input
                                type="number"
                                value={moyenneUE}
                                onChange={(e) => setMoyenneUE(e.target.value)}
                                placeholder="Saisissez la moyenne..."
                            />

                            {/* Résultat UE */}
                            <label>Résultat (UE) :</label>
                            <input
                                type="text"
                                value={resultatUE}
                                onChange={(e) => setResultatUE(e.target.value)}
                                placeholder="Saisissez le résultat..."
                            />

                            {/* Éléments Constitutifs (EC) */}
                            <label>Éléments Constitutifs (EC) :</label>
                            <input
                                type="text"
                                value={elementsConstitutifs}
                                onChange={(e) => setElementsConstitutifs(e.target.value)}
                                placeholder="Saisissez l’élément constitutif..."
                            />

                            {/* Coefficient */}
                            <label>Coefficient :</label>
                            <input
                                type="number"
                                value={coefficient}
                                onChange={(e) => setCoefficient(e.target.value)}
                                placeholder="Saisissez le coefficient..."
                            />

                            {/* Contrôle Continu */}
                            <label>Contrôle Continu :</label>
                            <input
                                type="number"
                                value={controleContinu}
                                onChange={(e) => setControleContinu(e.target.value)}
                                placeholder="Saisissez la note de contrôle continu..."
                            />

                            {/* Examen */}
                            <label>Examen :</label>
                            <input
                                type="number"
                                value={examen}
                                onChange={(e) => setExamen(e.target.value)}
                                placeholder="Saisissez la note d’examen..."
                            />

                            {/* Moyenne EC */}
                            <label>Moyenne (EC) :</label>
                            <input
                                type="number"
                                value={moyenneEC}
                                onChange={(e) => setMoyenneEC(e.target.value)}
                                placeholder="Saisissez la moyenne EC..."
                            />

                            {/* Dropdown pour sélectionner la matière */}
                            <label>Matière :</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="">-- Sélectionnez une matière --</option>
                                {selectedStudent?.subjects?.map((subject, index) => (
                                    <option key={index} value={subject}>{subject}</option>
                                ))}
                            </select>
                            <div className="popup-actions">
                                <button className="save-btn" onClick={handleSaveNote}>Enregistrer</button>
                                <button className="cancel-btn" onClick={() => setIsPopupOpen(false)}>Annuler</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <footer className="dashboard-footer">
                <p>Copyright © Developed by SupportInformatique | AppliCodeTech</p>
            </footer>
        </div>
    );
};

export default Notes;
