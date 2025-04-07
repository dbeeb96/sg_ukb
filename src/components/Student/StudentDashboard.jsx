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
    const [filterLevel, setFilterLevel] = useState(false);
    const rowsPerPage = 10;
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });
  

    // Fonction pour formater les dates en JJ/MM/AAAA pour l'affichage
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid Date" : 
            date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
    };


    

    useEffect(() => {
        axios.get('http://localhost:5000/api/students')
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

    const formatToFrenchDate = (dateString) => {
        if (!dateString) return null;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const studentData = {
        ...newStudent,
        birthDay: formatToFrenchDate(newStudent.birthDay),
        startDate: formatToFrenchDate(newStudent.startDate),
        endDate: formatToFrenchDate(newStudent.endDate)
    };


    const endpoint = currentStudent === null ? 
        axios.post('http://localhost:5000/api/students', studentData) :
        axios.put(`http://localhost:5000/api/students/${students[currentStudent].id}`, studentData);

    endpoint.then(response => {
        // Solution 1: Rafraîchir toute la liste depuis le serveur
        axios.get('http://localhost:5000/api/students')
            .then(updatedResponse => {
                const formattedStudents = updatedResponse.data.map(student => ({
                    ...student,
                    birthDay: formatDateDisplay(student.birthDay),
                    startDate: formatDateDisplay(student.startDate),
                    endDate: formatDateDisplay(student.endDate)
                }));
                setStudents(formattedStudents);
                
                // Si c'est un nouvel étudiant, l'ajouter aux paiements
                if (currentStudent === null) {
                    const newStudent = response.data;
                    axios.post("http://localhost:5000/api/payments", {
                        student_id: newStudent.id,
                        montantReçu: 0,
                        reste: newStudent.totalFees,
                        status: "Non Payé",
                        date: new Date().toISOString(),
                    }).catch(error => {
                        console.error("Error adding student to payments:", error);
                    });
                }
                
                resetForm();
            });
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
        // Fonction pour l'affichage dans le tableau (à conserver)
        const formatDateDisplay = (dateString) => {
            if (!dateString) return "N/A";
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
            
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? "Invalid Date" : 
                date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
        };
        
        const handleEdit = (index) => {
            const student = students[index];
            setCurrentStudent(index);
            
            // Fonction pour convertir la date au format attendu par l'input date (AAAA-MM-JJ)
            const formatForDateInput = (dateString) => {
                if (!dateString) return '';
                
                // Si la date est déjà au format JJ/MM/AAAA
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
                    const [day, month, year] = dateString.split('/');
                    return `${year}-${month}-${day}`;
                }
                
                // Si c'est une date ISO
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
        
            setNewStudent({
                ...student,
                birthDay: formatForDateInput(student.birthDay),
                startDate: formatForDateInput(student.startDate),
                endDate: formatForDateInput(student.endDate)
            });
            setShowModal(true);
        };
    const [searchQuery, setSearchQuery] = useState("");

        useEffect(() => {
            setCurrentPage(1);
        }, [searchQuery, filteredSubjects, filterLevel]);
    

    const handleDelete = (index) => {
        const studentId = students[index].id;
        if (window.confirm("Are you sure you want to delete this student?")) {
            axios.delete(`http://localhost:5000/api/students/${studentId}`)
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

    // Remplacez l'état existant pour filterLevel par :
const [selectedLevels, setSelectedLevels] = useState({
    L1: false,
    L2: false,
    L3: false,
    'Master 1': false,
    'Master 2': false
});

// Modifiez la fonction de filtrage :
const filteredStudents = students.filter(student => {
    const matchesSubject = student.subject && 
        student.subject.toLowerCase().includes(filteredSubjects.toLowerCase());
    
    // Si aucun niveau n'est sélectionné, on retourne tous les étudiants qui correspondent à la filière
    if (Object.values(selectedLevels).every(level => !level)) {
        return matchesSubject;
    }
    
    // Sinon, on filtre par niveau sélectionné
    return matchesSubject && selectedLevels[student.level];
});

    const currentStudents = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

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
                        
                        <div className="level-checkboxes">
                            {['L1', 'L2', 'L3', 'Master 1', 'Master 2'].map(level => (
                                <label key={level} className="level-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedLevels[level]}
                                        onChange={() => setSelectedLevels(prev => ({
                                            ...prev,
                                            [level]: !prev[level]
                                        }))}
                                    />
                                    {level}
                                </label>
                            ))}
                        </div>
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
                                    <td data-label="Naissance">{formatDateDisplay(student.birthDay)}</td>
                                    <td data-label="Année Acad">{student.academicYear}</td>
                                    <td data-label="Frais Mensuel">{student.monthlyFees}</td>
                                    <td data-label="Total Payé">{student.totalFees}</td>
                                    <td data-label="Début">{formatDateDisplay(student.startDate)}</td>
                                    <td data-label="Fin">{formatDateDisplay(student.endDate)}</td>
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

          {/* Pagination */}
          <div className="pagination">
                <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    <FaArrowLeft/>
                </button>
                <span className="pagination-info">
                    Page {currentPage} sur {totalPages}
                </span>
                <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    <FaArrowRight/>
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
                                            value={newStudent[dateField] || ''}
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