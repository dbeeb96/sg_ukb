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
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditingPayment, setIsEditingPayment] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const PaymentModal = ({ student, onSubmit, onClose, isEditing }) => {
        const [amount, setAmount] = useState(isEditing ? student.lastReceived : "");
        const [paymentMethod, setPaymentMethod] = useState(student.paymentMethod || "cash");
        const [receiptNumber, setReceiptNumber] = useState(student.receiptNumber || "");
        const [paymentDate, setPaymentDate] = useState(
            isEditing && student.paymentDate 
                ? new Date(student.paymentDate).toISOString().split('T')[0] 
                : new Date().toISOString().split('T')[0]
        );

        const handleSubmit = () => {
            if (!amount) {
                alert('Veuillez entrer un montant');
                return;
            }
            if (paymentMethod !== "cash" && !receiptNumber) {
                alert('Veuillez entrer un numéro de transaction');
                return;
            }
            onSubmit(amount, paymentMethod, receiptNumber, paymentDate);
        };

        return (
            <div className="payment-popup">
                <div className="popup-content">
                    <h3>
                        {isEditing ? 'Modifier le' : 'Entrer le'} Montant Reçu pour {student.firstName} {student.lastName}
                    </h3>
                    
                    <div className="input-section">
                        <label>Montant Reçu (CFA):</label>
                        <input
                            type="number"
                            placeholder="Entrez le montant"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    
                    <div className="input-section">
                        <label>Date de paiement:</label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                        />
                    </div>
                    
                    <div className="input-section">
                        <label>Méthode de paiement:</label>
                        <select 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="cash">Espèces</option>
                            <option value="orange_money">Orange Money</option>
                            <option value="wave">Wave</option>
                        </select>
                    </div>
                    
                    {paymentMethod !== "cash" && (
                        <div className="input-section">
                            <label>Numéro de transaction:</label>
                            <input
                                type="text"
                                placeholder="Entrez le numéro"
                                value={receiptNumber}
                                onChange={(e) => setReceiptNumber(e.target.value)}
                            />
                        </div>
                    )}
                    
                    <div className="popup-actions">
                        <button onClick={handleSubmit}>Valider</button>
                        <button onClick={onClose}>Annuler</button>
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

    const printAllInvoices = async (student) => {
        try {
            if (!student?.id || isNaN(student.id)) {
                throw new Error("Identifiant étudiant invalide");
            }
            
            const response = await axios.get(`http://localhost:5000/api/payments/history/${student.id}`);
            
            if (!response.data?.success) {
                throw new Error(response.data?.error || "Erreur du serveur");
            }
    
            const payments = response.data.payments || [];
    
            const formatDateTime = (dateString) => {
                if (!dateString) return '-';
                const date = new Date(dateString);
                return date.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };
    
            const formatCurrency = (amount) => {
                return (amount || 0).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            };
    
            const totalAmount = payments.reduce((sum, p) => sum + (p.montantReçu || 0), 0);
    
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Historique des Paiements</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; border: 1px solid #ddd; }
                    th { background-color: #4CAF50; color: white; }
                    .total { font-weight: bold; background-color: #f5f5f5; }
                    .no-data { text-align: center; padding: 20px; color: red; }
                </style>
            </head>
            <body>
                <h2>Historique des Paiements</h2>
                <p><strong>Étudiant:</strong> ${student.firstName} ${student.lastName}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date/Heure</th>
                            <th>Montant (CFA)</th>
                            <th>Méthode</th>
                            <th>Référence</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.length > 0 
                            ? payments.map(payment => `
                                <tr>
                                    <td>${formatDateTime(payment.date)}</td>
                                    <td>${formatCurrency(payment.montantReçu)}</td>
                                    <td>${payment.paymentMethod || '-'}</td>
                                    <td>${payment.receiptNumber || '-'}</td>
                                    <td>${payment.status || 'Complété'}</td>
                                </tr>
                            `).join('')
                            : `<tr><td colspan="5" class="no-data">Aucun paiement enregistré</td></tr>`
                        }
                    </tbody>
                    ${payments.length > 0 ? `
                    <tfoot>
                        <tr class="total">
                            <td>Total</td>
                            <td>${formatCurrency(totalAmount)}</td>
                            <td colspan="3"></td>
                        </tr>
                    </tfoot>
                    ` : ''}
                </table>
    
                <script>
                    window.onload = function() {
                        setTimeout(() => window.print(), 300);
                    };
                </script>
            </body>
            </html>
            `;
    
            const printWindow = window.open('', '_blank', 'width=1000,height=700');
            if (!printWindow) {
                throw new Error("Veuillez autoriser les popups");
            }
    
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
    
        } catch (error) {
            console.error("Erreur:", error);
            alert(`Erreur: ${error.message}`);
        }
    };
    
    useEffect(() => {
        axios
            .get("http://localhost:5000/api/students")
            .then((response) => setStudents(response.data))
            .catch((error) => {
                console.error("Error fetching students:", error);
                alert("Unable to fetch student data. Please try again later.");
            });
    
        axios
            .get("http://localhost:5000/api/payments")
            .then((response) => {
                const studentsWithPayments = response.data.map(payment => {
                    const student = students.find(s => s.id === payment.student_id);
                    return { 
                        ...student, 
                        ...payment,
                        lastReceived: payment.lastReceived || 0
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

            axios.post("http://localhost:5000/api/payments", {
                student_id: student.id,
                montantReçu: 0,
                reste: student.totalFees,
                status: "Non Payé",
                date: new Date().toISOString(),
                paymentMethod: "cash",
                receiptNumber: null,
                paymentDate: new Date().toISOString()
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

    const openEditPaymentPopup = (student) => {
        setCurrentStudent(student);
        setIsEditingPayment(true);
        setShowPopup(true);
    };

    const openPaymentPopup = (student) => {
        setCurrentStudent(student);
        setIsEditingPayment(false);
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

        axios.delete(`http://localhost:5000/api/payments/${id}`)
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedLevels]);
    
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    const filteredStudents = selectedStudents.filter((student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const nameMatches = fullName.includes(searchQuery.toLowerCase());
        
        if (Object.values(selectedLevels).every(level => !level)) {
            return nameMatches;
        }
        
        return nameMatches && selectedLevels[student.level];
    });

    const handlePaymentSubmit = (montantReçu, paymentMethod, receiptNumber, paymentDate) => {
        if (currentStudent && montantReçu) {
            const receivedAmount = parseFloat(montantReçu) || 0;
            let totalReceived = currentStudent.montantReçu || 0;
            let remainingAmount = currentStudent.reste || currentStudent.totalFees;
    
            if (isEditingPayment) {
                totalReceived = totalReceived - currentStudent.lastReceived + receivedAmount;
                remainingAmount = Math.max(currentStudent.totalFees - totalReceived, 0);
            } else {
                totalReceived += receivedAmount;
                remainingAmount = Math.max(currentStudent.totalFees - totalReceived, 0);
            }
    
            if (receivedAmount <= 0) {
                alert("Veuillez entrer un montant supérieur à 0 CFA.");
                return;
            }
    
            if (totalReceived > currentStudent.totalFees) {
                alert(`Le total des paiements (${totalReceived} CFA) dépasse le montant dû (${currentStudent.totalFees} CFA).`);
                return;
            }
    
            const status = remainingAmount === 0 ? "Payé" : "Non Payé";
    
            const updatedStudent = {
                ...currentStudent,
                montantReçu: totalReceived,
                reste: remainingAmount,
                status,
                lastReceived: receivedAmount,
                paymentMethod,
                receiptNumber: paymentMethod !== "cash" ? receiptNumber : null,
                paymentDate: paymentDate || new Date().toISOString()
            };
    
            const updatedStudents = selectedStudents.map((student) =>
                student.id === currentStudent.id ? updatedStudent : student
            );
            setSelectedStudents(updatedStudents);
            updateTotals(updatedStudents);
    
            axios
                .put(`http://localhost:5000/api/payments/${currentStudent.id}`, {
                    student_id: currentStudent.id,
                    montantReçu: totalReceived,
                    reste: remainingAmount,
                    status: status,
                    lastReceived: receivedAmount,
                    paymentMethod,
                    receiptNumber: paymentMethod !== "cash" ? receiptNumber : null,
                    date: new Date().toISOString(),
                    paymentDate: paymentDate || new Date().toISOString()
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

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('fr-FR');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const printInvoice = (student) => {
        const invoiceDate = student.paymentDate ? new Date(student.paymentDate) : new Date();
        const formattedDate = invoiceDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
        const formattedTime = invoiceDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

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
                <p>Date de paiement: <strong>${formatDate(student.paymentDate)}</strong></p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
           <hr>
                                        <br/> <br/> <br/>
                                             <hr/>       

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
                <p>Date de paiement: <strong>${formatDate(student.paymentDate)}</strong></p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
           <hr>

            <script>
                window.onload = function() {
                    setTimeout(() => window.print(), 300);
                };
            </script>
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
    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

    return (
        <div className="payment-dashboard">
            {isMobile && (
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    <FaBars />
                </button>
            )}

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
                                        <button className="icon-btn-edit" onClick={() => openEditPaymentPopup(student)}>
                                            ✏️
                                        </button>
                                        <button className="icon-btn5" onClick={() => handleDelete(student.id)}>
                                            <FaTrash />
                                        </button>
                                        <button className="icon-btn6" onClick={() => printInvoice(student)}>
                                            <FaPrint />
                                        </button>
                                        <button className="icon-btn7" onClick={() => printAllInvoices(student)}>
                                            📜 
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
                                        <button className="icon-btn7" onClick={() => printAllInvoices(student)}>
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
                    isEditing={isEditingPayment}
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
