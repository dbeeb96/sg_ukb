import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PaymentDashboard.css";
import { FaUserGraduate, FaChalkboardTeacher, FaTrash, FaMoneyCheckAlt, FaArrowLeft, FaArrowRight, FaBars } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { FaPrint } from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';
import InvoicesModal from "./InvoicesModal";

const PaymentDashboard = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [totalPayments, setTotalPayments] = useState(0);
    const [totalRemaining, setTotalRemaining] = useState(0);
    const rowsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [invoices, setInvoices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [studentInvoices, setStudentInvoices] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 992 });

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const PaymentModal = ({ student, onSubmit, onClose }) => {
        const [amount, setAmount] = useState("");

        return (
            <div className="payment-popup">
                <div className="popup-content">
                    <h3>
                        Entrer le Montant Reçu pour {student.firstName} {student.lastName}
                    </h3>
                    <input
                        className="receive-payment"
                        type="number"
                        placeholder="Montant Reçu (CFA)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="popup-actions">
                        <button onClick={() => onSubmit(amount)}>Valider</button>
                        <button onClick={onClose}>Fermer</button>
                    </div>
                </div>
            </div>
        );
    };

    const [selectedLevels, setSelectedLevels] = useState({
        L1: false,
        L2: false,
        L3: false,
        'Master 1': false,
        'Master 2': false
    });

    const printAllInvoices = (student) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
        const formattedTime = currentDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

        const invoiceWindow = window.open("", "_blank");
        invoiceWindow.document.write(`
        <html>
        <head>
            <title>Reçu du Paiement</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20;
                border: 0.3px dashed #000; padding-left: 15px; padding-right: 15px; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .logo { height: 50px; }
                .university-name { text-align: center; font-weight: bold; font-size: 1.2em; }
                .details { margin: 20px 0; }
                .details p { margin: 5px 0, font-weight:none; }
                .status { font-weight: bold; color: ${student.status === "Payé" ? "green" : "red"}; }
            </style>
        </head>
        <body>
           <div class="header">
                <img src="../../../public/img.png" alt="Logo" class="logo" />
                <div class="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: ${student.filiere || "N/A"}
                </div>   
                <div>
                    <p>Date: ${formattedDate}</p>
                    <p>Heure: ${formattedTime}</p>
                </div>
            </div>
            <div class="details">
               <div class="studentNameId">
                    <p>Nom de l'étudiant: <strong>${student.firstName || "N/A"} ${student.lastName || "N/A"}</strong></p>
                    <p> Identifiant de l'étudiant : <strong>${student.studentId}<strong> </p>
               </div>
                <p>Dernier Montant Reçu: <strong>${(student.lastReceived || 0).toLocaleString()} CFA </strong></p>
                <p>Montant Total Reçu: <strong>${(student.montantReçu || 0).toLocaleString()} CFA </strong></p>
                <p>Reste: <strong>${(student.reste || 0).toLocaleString()} CFA </strong> </p>
                <p>Statut: <strong><span class="status">${student.status || "N/A"} </strong></span> </p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
           <hr>

            <br>
            <br>
            <br>
            <br>

            <center>-------------------------------------------------------------------------------------------------------
            --------- </center> 
             <head>
            <title>Reçu du Paiement</title>
            </head>
            <br>
            <br>
            <br>
            <br>
        
               <div class="header">
                <img src="../../../public/img.png" alt="Logo" class="logo" />
                <div class="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: ${student.filiere || "N/A"}
                </div>   
                <div>
                    <p>Date: ${formattedDate}</p>
                    <p>Heure: ${formattedTime}</p>
                </div>
            </div>
            <div class="details">
               <div class="studentNameId">
                    <p>Nom de l'étudiant: <strong>${student.firstName || "N/A"} ${student.lastName || "N/A"}</strong></p>
                    <p> Identifiant de l'étudiant : <strong>${student.studentId}<strong> </p>
               </div>
                <p>Dernier Montant Reçu: <strong>${(student.lastReceived || 0).toLocaleString()} CFA </strong></p>
                <p>Montant Total Reçu: <strong>${(student.montantReçu || 0).toLocaleString()} CFA </strong></p>
                <p>Reste: <strong>${(student.reste || 0).toLocaleString()} CFA </strong> </p>
                <p>Statut: <strong><span class="status">${student.status || "N/A"} </strong></span> </p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
           <hr>
            
            <br>
        </body>
        </html>
    `);
        invoiceWindow.print();
        invoiceWindow.close();
    };
    useEffect(() => {
        axios
            .get("https://sg-ukb.onrender.com/api/students")
            .then((response) => setStudents(response.data))
            .catch((error) => {
                console.error("Error fetching students:", error);
                alert("Unable to fetch student data. Please try again later.");
            });
    
        axios
            .get("https://sg-ukb.onrender.com/api/payments")
            .then((response) => {
                const studentsWithPayments = response.data.map(payment => {
                    const student = students.find(s => s.id === payment.student_id);
                    return { 
                        ...student, 
                        ...payment,
                        lastReceived: payment.lastReceived || 0 // Assurez-vous que lastReceived est bien inclus
                    };
                });
                setSelectedStudents(studentsWithPayments);
            })
            .catch((error) => {
                console.error("Error fetching payment records:", error);
            });
    }, []);

     const handleStudentChange = (e) => {
        const studentId = e.target.value;
        const student = students.find((s) => s.id === parseInt(studentId, 10));
        if (student && !selectedStudents.some((s) => s.id === student.id)) {
            const newStudent = {
                ...student,
                montantReçu: 0,
                reste: student.totalFees,
                status: "Non Payé"
            };

            setSelectedStudents([...selectedStudents, newStudent]);

            axios.post("https://sg-ukb.onrender.com/api/payments", {
                student_id: student.id,
                montantReçu: 0,
                reste: student.totalFees,
                status: "Non Payé",
                date: new Date().toISOString(),
            })
                .then((response) => {
                    console.log("Student added to payment records:", response.data);
                })
                .catch((error) => {
                    console.error("Error saving student to the database:", error);
                    alert("Unable to save student. Please try again later.");
                });
        }
    };
    const openPaymentPopup = (student) => {
        setCurrentStudent(student);
        setShowPopup(true);
    };

    const closePaymentPopup = () => {
        setShowPopup(false);
        setCurrentStudent(null);
    };

    const confirmDelete = (id) => {
        const studentToDelete = selectedStudents.find((student) => student.id === id);
        if (!studentToDelete) {
            console.error(`No student found with ID: ${id}`);
            return;
        }

        setSelectedStudents((prev) => prev.filter((student) => student.id !== id));

        axios.delete(`https://sg-ukb.onrender.com/api/payments/${id}`)
            .then(() => {
                console.log("Delete succeeded");
            })
            .catch((error) => {
                console.error("Error deleting:", error);
                setSelectedStudents((prev) => [...prev, studentToDelete]);
            });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this payment?")) {
            confirmDelete(id);
        }
    };

    useEffect(() => {
        const storedData = localStorage.getItem("selectedStudents");
        if (storedData) {
            setSelectedStudents(JSON.parse(storedData));
        }
    }, []);

      // Reset à la première page quand la recherche change
   

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedLevels]);
    

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const filteredStudents = selectedStudents.filter((student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const nameMatches = fullName.includes(searchQuery.toLowerCase());
        
        // Si aucun niveau n'est sélectionné, on retourne tous les étudiants qui correspondent au nom
        if (Object.values(selectedLevels).every(level => !level)) {
            return nameMatches;
        }
        
        // Sinon, on filtre par niveau sélectionné
        return nameMatches && selectedLevels[student.level];
    });

    const handlePaymentSubmit = (montantReçu) => {
        if (currentStudent && montantReçu) {
            const receivedAmount = parseFloat(montantReçu) || 0;
            const previousReceived = currentStudent.montantReçu || 0;
            const totalAllowedPayment = currentStudent.totalFees;
            const remainingAmount = Math.max(totalAllowedPayment - (previousReceived + receivedAmount), 0);

            if (receivedAmount <= 0) {
                alert("Veuillez entrer un montant supérieur à 0 CFA.");
                return;
            }

            if (receivedAmount + previousReceived > totalAllowedPayment) {
                alert(
                    `Le montant saisi dépasse le "Total des Paiements (${totalAllowedPayment} CFA)". Veuillez entrer un montant valide.`
                );
                return;
            }

            const totalReceived = previousReceived + receivedAmount;
            const status = remainingAmount === 0 ? "Payé" : "mois Payé";

            const updatedStudent = {
                ...currentStudent,
                montantReçu: totalReceived,
                reste: remainingAmount,
                status,
                lastReceived: receivedAmount,
            };

            const updatedStudents = selectedStudents.map((student) =>
                student.id === currentStudent.id ? updatedStudent : student
            );
            setSelectedStudents(updatedStudents);
            updateTotals(updatedStudents);

            axios
                .put(`https://sg-ukb.onrender.com/api/payments/${currentStudent.id}`, {
                    student_id: currentStudent.id,
                    montantReçu: totalReceived,
                    reste: remainingAmount,
                    status: status,
                    lastReceived: receivedAmount,
                    date: new Date().toISOString(),
                })
                .then(() => {
                    closePaymentPopup();
                })
                .catch((error) => {
                    console.error("Error updating payment:", error);
                    alert("Échec de la mise à jour du paiement. Veuillez réessayer plus tard.");
                });
        } else {
            alert("Veuillez entrer un montant valide.");
        }
    };

    const updateTotals = (students) => {
        const newTotalPayments = students.reduce((acc, student) => acc + (student.montantReçu || 0), 0);
        const newTotalRemaining = students.reduce((acc, student) => acc + (student.reste || 0), 0);
        setTotalPayments(newTotalPayments);
        setTotalRemaining(newTotalRemaining);
    };

    const printInvoice = (student) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
        const formattedTime = currentDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

        const invoiceWindow = window.open("", "_blank");
        invoiceWindow.document.write(`
        <html>
        <head>
            <title>Reçu du Paiement</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20;
                border: 0.3px dashed #000; padding-left: 15px; padding-right: 15px; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .logo { height: 50px; }
                .university-name { text-align: center; font-weight: bold; font-size: 1.2em; }
                .details { margin: 20px 0; }
                .details p { margin: 5px 0, font-weight:none; }
                .status { font-weight: bold; color: ${student.status === "Payé" ? "green" : "red"}; }
            </style>
        </head>
        <body>
           <div class="header">
                <img src="../../../public/img.png" alt="Logo" class="logo" />
                <div class="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: ${student.filiere || "N/A"}
                </div>   
                <div>
                    <p>Date: ${formattedDate}</p>
                    <p>Heure: ${formattedTime}</p>
                </div>
            </div>
            <div class="details">
               <div class="studentNameId">
                    <p>Nom de l'étudiant: <strong>${student.firstName || "N/A"} ${student.lastName || "N/A"}</strong></p>
                    <p> Identifiant de l'étudiant : <strong>${student.studentId}<strong> </p>
               </div>
                <p>Dernier Montant Reçu: <strong>${(student.lastReceived || 0).toLocaleString()} CFA </strong></p>
                <p>Montant Total Reçu: <strong>${(student.montantReçu || 0).toLocaleString()} CFA </strong></p>
                <p>Reste: <strong>${(student.reste || 0).toLocaleString()} CFA </strong> </p>
                <p>Statut: <strong><span class="status">${student.status || "N/A"} </strong></span> </p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
           <hr>

            <br>
            <br>
            <br>
            <br>

            <center>-------------------------------------------------------------------------------------------------------
            --------- </center> 
             <head>
            <title>Reçu du Paiement</title>
            </head>
            <br>
            <br>
            <br>
            <br>
        
               <div class="header">
                <img src="../../../public/img.png" alt="Logo" class="logo" />
                <div class="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: ${student.filiere || "N/A"}
                </div>   
                <div>
                    <p>Date: ${formattedDate}</p>
                    <p>Heure: ${formattedTime}</p>
                </div>
            </div>
            <div class="details">
               <div class="studentNameId">
                    <p>Nom de l'étudiant: <strong>${student.firstName || "N/A"} ${student.lastName || "N/A"}</strong></p>
                    <p> Identifiant de l'étudiant : <strong>${student.studentId}<strong> </p>
               </div>
                <p>Dernier Montant Reçu: <strong>${(student.lastReceived || 0).toLocaleString()} CFA </strong></p>
                <p>Montant Total Reçu: <strong>${(student.montantReçu || 0).toLocaleString()} CFA </strong></p>
                <p>Reste: <strong>${(student.reste || 0).toLocaleString()} CFA </strong> </p>
                <p>Statut: <strong><span class="status">${student.status || "N/A"} </strong></span> </p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
           <hr>
            
            <br>
        </body>
        </html>
    `);
        invoiceWindow.print();
        invoiceWindow.close();
    };

    const DeleteModal = ({ student, onConfirm, onClose }) => {
        const handleDelete = () => {
            onConfirm(student.id);
            onClose();
        };

        return (
            <div className="delete-popup">
                <div className="delete-popup-content">
                    <button className="delete-close-btn" onClick={onClose}>X</button>
                    <h3 className="delete-message">Êtes-vous sûr de vouloir supprimer cet étudiant ?</h3>
                    <div className="delete-actions">
                        <button onClick={handleDelete} className="confirm-delete">Oui, Supprimer</button>
                        <button onClick={onClose} className="cancel-delete">Annuler</button>
                    </div>
                </div>
            </div>
        );
    };

    const currentRows = filteredStudents.slice(indexOfFirstRow, indexOfLastRow);
// Calcul du nombre total de pages BASÉ sur les résultats filtrés
    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

    return (
        <div className="payment-dashboard">
            {/* Sidebar Toggle Button (Only for Mobile) */}
            {isMobile && (
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    <FaBars />
                </button>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${isMobile ? (isSidebarVisible ? 'active' : '') : 'active'}`}>
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <a href="/accountant">
                            <FaUserGraduate /> Tableau de bord
                        </a>
                    </li>
                    <li>
                        <a href="/student">
                            <FaChalkboardTeacher /> Etudiants
                        </a>
                    </li>
                    <li>
                        <a href="/student/manage">
                            <FaChalkboardTeacher /> Personnel
                        </a>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className={`main-content ${isMobile ? (isSidebarVisible ? 'sidebar-open' : '') : ''}`}>
                <div className="dashboard-counters">
                    <div className="counter">
                        <center className="money-icon">
                            <FaMoneyCheckDollar />
                        </center>
                        <h3>Total des Paiements (CFA)</h3>
                        <p>{totalPayments.toLocaleString()} CFA</p>
                    </div>
                    <div className="counter">
                        <center className="money-icon1">
                            <FaMoneyCheckAlt />
                        </center>
                        <h3>Reste (CFA)</h3>
                        <p>{totalRemaining.toLocaleString()} CFA</p>
                    </div>
                </div>

                <div className="dashboard-title">
                    <h1>Gestion des Paiements</h1>
                </div>

                <div className="student-selection">
        <select className="selected_st" onChange={handleStudentChange}>
            <option value="">-- Sélectionnez un étudiant --</option>
            {students.map((student) => (
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
    
    <div className="level-filters">
        {['L1', 'L2', 'L3', 'Master 1', 'Master 2'].map(level => (
            <label key={level} className="level-filter-label">
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
                
                {/* Desktop Table */}
                <div className="payment-section">
                    <table className="payment-table">
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Étudiant</th>
                            <th>Filière</th>
                            <th>Niveau</th>
                            <th>N°Dossier</th>
                            <th>Total des Paiements (CFA)</th>
                            <th>Montant Reçu (CFA)</th>
                            <th>Reste (CFA)</th>
                            <th>Statut</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredStudents.length > 0 ? (
                            currentRows.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.id}</td>
                                    <td>{student.firstName} {student.lastName}</td>
                                    <td>{student.filiere}</td>
                                    <td>{student.level}</td>
                                    <td>{student.studentId}</td>
                                    <td>{student.totalFees.toLocaleString()} CFA</td>
                                    <td>{student.montantReçu.toLocaleString()} CFA</td>
                                    <td>{student.reste.toLocaleString()} CFA</td>
                                    <td className={student.status === "Payé" ? "status-paid" : "status-unpaid"}>
                                        {student.status}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button className="icon-btn4" onClick={() => openPaymentPopup(student)}>
                                            💰
                                        </button>
                                        <button className="icon-btn5" onClick={() => handleDelete(student.id)}>
                                            <FaTrash />
                                        </button>
                                        <button className="icon-btn6" onClick={() => printInvoice(student)}>
                                            <FaPrint />
                                        </button>
                                        <button className="icon-btn7" onClick={() => printAllInvoices(student, invoices)}>
                                            📜 <FaPrint />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">Aucun étudiant trouvé.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Mobile Table */}
                    <div className="mobile-table">
                        {filteredStudents.length > 0 ? (
                            currentRows.map((student) => (
                                <div className="mobile-row" key={student.id}>
                                    <div className="mobile-row-item">
                                        <span>Étudiant:</span>
                                        <strong>{student.firstName} {student.lastName}</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>Filière:</span>
                                        <strong>{student.filiere}</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>Niveau:</span>
                                        <strong>{student.level}</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>N°Dossier:</span>
                                        <strong>{student.studentId}</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>Total:</span>
                                        <strong>{student.totalFees.toLocaleString()} CFA</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>Reçu:</span>
                                        <strong>{student.montantReçu.toLocaleString()} CFA</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>Reste:</span>
                                        <strong>{student.reste.toLocaleString()} CFA</strong>
                                    </div>
                                    <div className="mobile-row-item">
                                        <span>Statut:</span>
                                        <strong className={student.status === "Payé" ? "status-paid" : "status-unpaid"}>
                                            {student.status}
                                        </strong>
                                    </div>
                                    <div className="mobile-actions">
                                        <button className="icon-btn4" onClick={() => openPaymentPopup(student)}>
                                            💰
                                        </button>
                                        <button className="icon-btn5" onClick={() => handleDelete(student.id)}>
                                            <FaTrash />
                                        </button>
                                        <button className="icon-btn6" onClick={() => printInvoice(student)}>
                                            <FaPrint />
                                        </button>
                                        <button className="icon-btn7" onClick={() => printAllInvoices(student, invoices)}>
                                            📜
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="mobile-row">
                                Aucun étudiant trouvé.
                            </div>
                        )}
                    </div>

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
                </div>
            </div>

            {showPopup && currentStudent && (
                <PaymentModal
                    student={currentStudent}
                    onSubmit={handlePaymentSubmit}
                    onClose={closePaymentPopup}
                />
            )}
            {showModal && (
                <InvoicesModal
                    invoices={studentInvoices}
                    student={selectedStudent}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default PaymentDashboard;
