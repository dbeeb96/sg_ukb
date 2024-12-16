import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaStudiovinari,  FaChalkboardTeacher, FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './StudentDashboard.css';
import axios from 'axios';

const StudentDashboard = () => {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({
        firstName: '',
        lastName: '',
        age: '',
        phoneNumber: '',
        studentId: '',
        address: '',
        monthlyFees: '',
        totalFees: '',
        teachers: '',
        startDate: '',
        endDate: '',
        subject: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [validationErrors, setValidationErrors] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState('');
    const rowsPerPage = 5;

    useEffect(() => {
        axios.get('http://localhost:5000/api/students')
            .then(response => {
                setStudents(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the students!', error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewStudent({ ...newStudent, [name]: value });
    };

    const validateForm = () => {
        const errors = [];
        const requiredFields = [
            'firstName', 'lastName', 'age', 'phoneNumber', 'studentId',
            'address', 'monthlyFees', 'totalFees', 'startDate', 'endDate','subject'
        ];


        requiredFields.forEach(field => {
            if (!newStudent[field]) {
                errors.push(`${field} is required.`);
            }
        });

        if (errors.length > 0) {
            setValidationErrors(errors);
            return false;
        }
        return true;
    };

    const handleSaveStudent = () => {
        if (!validateForm()) return;
        setValidationErrors([]);

        const studentData = {
            firstName: newStudent.firstName,
            lastName: newStudent.lastName,
            age: newStudent.age,
            phoneNumber: newStudent.phoneNumber,
            studentId: newStudent.studentId,
            address: newStudent.address,
            monthlyFees: newStudent.monthlyFees,
            totalFees: newStudent.totalFees,
            subject: newStudent.subject,
            startDate: newStudent.startDate,
            endDate: newStudent.endDate,
        };

        if (currentStudent === null) {
            axios.post('http://localhost:5000/api/students', studentData)
                .then(response => {
                    setStudents([...students, response.data]);
                    resetForm();
                })
                .catch(error => {
                    console.error('Error adding student:', error);
                    alert('There was an error adding the student. Please try again.');
                });
        } else {
            axios.put(`http://localhost:5000/api/students/${students[currentStudent].id}`, studentData) // Use 'id' from students array
                .then(response => {
                    const updatedStudents = students.map(student =>
                        student.id === students[currentStudent].id ? response.data : student
                    );
                    setStudents(updatedStudents);
                    resetForm();
                })
                .catch(error => {
                    console.error('Error updating student:', error);
                    alert('There was an error updating the student. Please try again.');
                });
        }
    };

    const resetForm = () => {
        setNewStudent({
            firstName: '',
            lastName: '',
            age: '',
            phoneNumber: '',
            studentId: '',
            address: '',
            monthlyFees: '',
            totalFees: '',
            teachers: '',
            startDate: '',
            endDate: '',
            subject: '',
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
        axios.delete(`http://localhost:5000/api/students/${studentId}`)
            .then(response => {
                const updatedStudents = students.filter((_, i) => i !== index);
                setStudents(updatedStudents);
            })
            .catch(error => {
                console.error('Error deleting student:', error);
                alert('There was an error deleting the student. Please try again.');
            });
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const filteredStudents = students
        .filter(student => student.subject.toLowerCase().includes(filteredSubjects.toLowerCase()));

    const currentStudents = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/accountant"><FaUserGraduate/>Tableau de bord</Link></li>
                    <li><Link to="/students"><FaChalkboardTeacher/>Etudiants</Link></li>
                    <li><Link to="/payment"><FaChalkboardTeacher/>Paiements</Link></li>
                    <li><Link to="/payment"><FaChalkboardTeacher/>Personnel</Link></li>

                </ul>
            </div>

            <div className="main-content">
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
                        className="filter-input"
                        value={filteredSubjects}
                        onChange={(e) => setFilteredSubjects(e.target.value)}
                    />
                </div>

                <table className="student-table">
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>prénom</th>
                        <th>Age</th>
                        <th>TEL</th>
                        <th>N° Carte</th>
                        <th>Address</th>
                        <th>Frai mensuel (en CFA)</th>
                        <th>Total des paiements (en CFA)</th>
                        <th>Date de début</th>
                        <th>Date de fin</th>
                        <th>Filière</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentStudents.map((student, index) => (
                        <tr key={index}>
                            <td>{student.firstName}</td>
                            <td>{student.lastName}</td>
                            <td>{student.age}</td>
                            <td>{student.phoneNumber}</td>
                            <td>{student.studentId}</td>
                            <td>{student.address}</td>
                            <td>{student.monthlyFees}</td>
                            <td>{student.totalFees}</td>
                            <td>{student.startDate}</td>
                            <td>{student.endDate}</td>
                            <td>{student.subject}</td>
                            <td>
                                <button onClick={() => handleEdit(index)}><FaEdit /></button>
                                <button onClick={() => handleDelete(index)}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        <FaArrowLeft />
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {Math.ceil(filteredStudents.length / rowsPerPage)}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={indexOfLastRow >= filteredStudents.length}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        <FaArrowRight />
                    </button>
                </div>

                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                  <h2><FaStudiovinari />{currentStudent === null ? 'AJOUTER UN ' : 'ETUDIANT'} ETUDIANT</h2>
                            {validationErrors.length > 0 && (
                                <div className="awesome-validation-popup">
                                    <h3>Please fix the following errors:</h3>
                                    <ul>
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                    <button
                                        className="cancel-validation-btn"
                                        onClick={() => setValidationErrors([])}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                            <form>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Prénom"
                                    value={newStudent.firstName}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Nom"
                                    value={newStudent.lastName}
                                    onChange={handleChange}
                                />
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Age"
                                    value={newStudent.age}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    placeholder="Numéro de téléphone"
                                    value={newStudent.phoneNumber}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="studentId"
                                    placeholder="Identifiant de l'étudiant"
                                    value={newStudent.studentId}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Addresse"
                                    value={newStudent.address}
                                    onChange={handleChange}
                                />
                                <input
                                    type="number"
                                    name="monthlyFees"
                                    placeholder="Frais mensuel"
                                    value={newStudent.monthlyFees}
                                    onChange={handleChange}
                                />
                                <input
                                    type="number"
                                    name="totalFees"
                                    placeholder="Montant total"
                                    value={newStudent.totalFees}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="teachers"
                                    placeholder="Professeur"
                                    value={newStudent.teachers}
                                    onChange={handleChange}
                                />
                                <input
                                    type="date"
                                    name="startDate"
                                    placeholder="Date de début de formation"
                                    value={newStudent.startDate}
                                    onChange={handleChange}
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    placeholder="Date de fin de formation"
                                    value={newStudent.endDate}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="subject"
                                    placeholder="Fillière"
                                    value={newStudent.subject}
                                    onChange={handleChange}
                                />
                                <button type="button" onClick={handleSaveStudent}>
                                    {currentStudent === null ? 'Ajouter un ' : 'Mettre à jour'} étudiant
                                </button>
                                <button type="button" onClick={resetForm}>
                                    Annuler
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
