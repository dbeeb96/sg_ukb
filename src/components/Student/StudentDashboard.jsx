import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaStudiovinari, FaBars, FaChalkboardTeacher, FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './StudentDashboard.css';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';

const StudentDashboard = () => {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        studentId: '',
        address: '',
        birthDay: '',
        academicYear: '',
        monthlyFees: '',
        totalFees: '',
        teachers: '',
        startDate: '',
        endDate: '',
        subject: '',
        level: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [validationErrors, setValidationErrors] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState('');
    const rowsPerPage = 5;
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid Date" : 
            date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
    };

    useEffect(() => {
        axios.get('https://sg-ukb.onrender.com/api/students')
            .then(response => setStudents(response.data))
            .catch(error => console.error('Error fetching students:', error));
    }, []);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
        document.body.style.overflow = !isSidebarVisible ? 'hidden' : 'auto';
    };

    useEffect(() => {
        if (!isMobile) {
            setIsSidebarVisible(false);
            document.body.style.overflow = 'auto';
        }
    }, [isMobile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const errors = [];
        ['firstName', 'lastName', 'level', 'phoneNumber', 'studentId', 'address', 
         'birthDay', 'academicYear', 'monthlyFees', 'totalFees', 'startDate', 'endDate', 'subject']
            .forEach(field => !newStudent[field] && errors.push(`${field} is required.`));
        
        if (errors.length) {
            setValidationErrors(errors);
            return false;
        }
        return true;
    };

    const handleSaveStudent = () => {
        if (!validateForm()) return;
        setValidationErrors([]);

        const endpoint = currentStudent === null ? 
            axios.post('https://sg-ukb.onrender.com/api/students', newStudent) :
            axios.put(`https://sg-ukb.onrender.com/api/students/${students[currentStudent].id}`, newStudent);

        endpoint.then(response => {
            setStudents(prev => currentStudent === null ? 
                [...prev, response.data] : 
                prev.map(s => s.id === students[currentStudent].id ? response.data : s));
            resetForm();
        }).catch(error => {
            console.error('Error saving student:', error);
            alert(`Error ${currentStudent === null ? 'adding' : 'updating'} student. Please try again.`);
        });
    };

    const resetForm = () => {
        setNewStudent({
            firstName: '', lastName: '', phoneNumber: '', studentId: '', address: '',
            birthDay: '', academicYear: '', monthlyFees: '', totalFees: '', teachers: '',
            startDate: '', endDate: '', subject: '', level: '',
        });
        setShowModal(false);
        setCurrentStudent(null);
    };

    const handleEdit = (index) => {
        setCurrentStudent(index);
        setNewStudent(students[index]);
        setShowModal(true);
    };

    const handleDelete = (index) => {
        const studentId = students[index].id;
        if (window.confirm("Are you sure you want to delete this student?")) {
            axios.delete(`https://sg-ukb.onrender.com/api/students/${studentId}`)
                .then(() => {
                    setStudents(prev => prev.filter((_, i) => i !== index));
                    if (currentPage > 1 && currentStudents.length === 1) {
                        setCurrentPage(prev => prev - 1);
                    }
                })
                .catch(error => console.error('Error deleting student:', error));
        }
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const filteredStudents = students.filter(student => 
        student.subject.toLowerCase().includes(filteredSubjects.toLowerCase()));
    const currentStudents = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div className="admin-dashboard">
            {isMobile && (
                <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    {isSidebarVisible ? '✕' : '☰'}
                </button>
            )}

            <div className={`sidebar ${isMobile ? (isSidebarVisible ? 'active' : '') : 'active'}`}>
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/accountant" onClick={() => isMobile && toggleSidebar()}><FaUserGraduate/>Tableau de bord</Link></li>
                    <li><Link to="/students" onClick={() => isMobile && toggleSidebar()}><FaChalkboardTeacher/>Etudiants</Link></li>
                    <li><Link to="/payment" onClick={() => isMobile && toggleSidebar()}><FaChalkboardTeacher/>Paiements</Link></li>
                    <li><Link to="/payment" onClick={() => isMobile && toggleSidebar()}><FaChalkboardTeacher/>Personnel</Link></li>
                </ul>
            </div>

            <div className={`main-content ${isMobile ? (isSidebarVisible ? 'sidebar-open' : '') : ''}`}>
                <header className="dashboard-header">
                    <h1>Bienvenue, Comptable!</h1>
                </header>

                <div className="dashboard-title">
                    <h1>UNIVERSITE KOCC BARMA DE SAINT-LOUIS</h1>
                </div>

                <button className="add-student-btn" onClick={() => setShowModal(true)}>
                    Ajouter un étudiant
                </button>
                
                <div className="search-filter-container">
                    <input
                        type="text"
                        placeholder="Filtrer par filière"
                        value={filteredSubjects}
                        onChange={(e) => setFilteredSubjects(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="table-container">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>TEL</th>
                                <th>N° Carte</th>
                                <th>Lieu de Naissance</th>
                                <th>Date de Naissance</th>
                                <th>Année Académique</th>
                                <th>Frais mensuel (CFA)</th>
                                <th>Total (CFA)</th>
                                <th>Date début</th>
                                <th>Date fin</th>
                                <th>Filière</th>
                                <th>Niveau</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStudents.map((student, index) => (
                                <tr key={index}>
                                    <td data-label="ID">{student.id}</td>
                                    <td data-label="Nom">{student.firstName}</td>
                                    <td data-label="Prénom">{student.lastName}</td>
                                    <td data-label="Téléphone">{student.phoneNumber}</td>
                                    <td data-label="N° Carte">{student.studentId}</td>
                                    <td data-label="Adresse">{student.address}</td>
                                    <td data-label="Naissance">{formatDate(student.birthDay)}</td>
                                    <td data-label="Année Acad">{student.academicYear}</td>
                                    <td data-label="Frais Mensuel">{student.monthlyFees}</td>
                                    <td data-label="Total Payé">{student.totalFees}</td>
                                    <td data-label="Début">{formatDate(student.startDate)}</td>
                                    <td data-label="Fin">{formatDate(student.endDate)}</td>
                                    <td data-label="Filière">{student.subject}</td>
                                    <td data-label="Niveau">{student.level}</td>
                                    <td className="btn" data-label="Actions">
                                        <button onClick={() => handleEdit(index)} aria-label="Edit"><FaEdit/></button>
                                        <button onClick={() => handleDelete(index)} aria-label="Delete"><FaTrash/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <FaArrowLeft />
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} sur {Math.ceil(filteredStudents.length / rowsPerPage) || 1}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={indexOfLastRow >= filteredStudents.length}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        <FaArrowRight />
                    </button>
                </div>

                {showModal && (
                    <div className="modal" onClick={(e) => e.target === e.currentTarget && resetForm()}>
                        <div className="modal-content">
                            <h2><FaStudiovinari />{currentStudent === null ? 'AJOUTER UN ' : 'MODIFIER '}ETUDIANT</h2>
                            {validationErrors.length > 0 && (
                                <div className="validation-errors">
                                    <h3>Veuillez corriger les erreurs suivantes :</h3>
                                    <ul>
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                    <button className="close-errors-btn" onClick={() => setValidationErrors([])}>
                                        Fermer
                                    </button>
                                </div>
                            )}
                            <form onSubmit={(e) => e.preventDefault()}>
                                {Object.entries({
                                    firstName: 'Prénom',
                                    lastName: 'Nom',
                                    level: 'Niveau',
                                    phoneNumber: 'Numéro de téléphone',
                                    studentId: 'Identifiant étudiant',
                                    address: 'Adresse',
                                    academicYear: 'Année Académique',
                                    monthlyFees: 'Frais mensuel',
                                    totalFees: 'Montant total',
                                    subject: 'Filière'
                                }).map(([field, label]) => (
                                    <div key={field} className="form-group">
                                        <input
                                            type={field.includes('Fees') ? 'number' : 'text'}
                                            name={field}
                                            placeholder={label}
                                            value={newStudent[field]}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ))}
                                
                                {['birthDay', 'startDate', 'endDate'].map(dateField => (
                                    <div key={dateField} className="form-group">
                                        <label>{dateField === 'birthDay' ? 'Date de naissance' : 
                                               dateField === 'startDate' ? 'Date de début' : 'Date de fin'}</label>
                                        <input
                                            type="date"
                                            name={dateField}
                                            value={newStudent[dateField]}
                                            onChange={handleChange}
                                        />
                                    </div>
                                ))}

                                <div className="form-actions">
                                    <button type="button" onClick={handleSaveStudent} className="save-btn">
                                        {currentStudent === null ? 'Ajouter' : 'Mettre à jour'}
                                    </button>
                                    <button type="button" onClick={resetForm} className="cancel-btn">
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
