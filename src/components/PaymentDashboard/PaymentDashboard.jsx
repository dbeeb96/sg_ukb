import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PaymentDashboard.css";
import { FaUserGraduate, FaChalkboardTeacher, FaTrash, FaMoneyCheckAlt } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { FaPrint,} from "react-icons/fa"; // Add this import for the printer icon
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

const PaymentDashboard = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [totalPayments, setTotalPayments] = useState(0);
    const [totalRemaining, setTotalRemaining] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [payments, setPayments] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Récupérer les étudiants de la base de données
        axios
            .get("http://localhost:5000/api/students")
            .then((response) => setStudents(response.data))
            .catch((error) => {
                console.error("Error fetching students:", error);
                alert("Unable to fetch student data. Please try again later.");
            });

        // Récupérer les relevés de paiement des étudiants sélectionnés
        axios
            .get("http://localhost:5000/api/payments")
            .then((response) => {
                //Mappez les paiements aux étudiants et définissez-les dans l'état selectedStudents
                const studentsWithPayments = response.data.map(payment => {
                    const student = students.find(s => s.id === payment.student_id);
                    return { ...student, ...payment };
                });
                setSelectedStudents(studentsWithPayments);
            })
            .catch((error) => {
                console.error("Error fetching payment records:", error);
            });
    }, []);  // Cela ne s'exécutera qu'une seule fois lors du montage du composant

// Gérer l'ajout d'un étudiant à la table
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

            // Enregistrer automatiquement l'étudiant sélectionné dans la base de données
            axios.post("http://localhost:5000/api/payments", {
                student_id: student.id,
                montantReçu: 0,
                reste: student.totalFees,
                status: "Non Payé",
                date: new Date().toISOString(), // You can use the current date here
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

    // Ouvrir la fenêtre contextuelle de paiement
    const openPaymentPopup = (student) => {
        setCurrentStudent(student);
        setShowPopup(true);
    };

    // Fermer la fenêtre contextuelle de paiement
    const closePaymentPopup = () => {
        setShowPopup(false);
        setCurrentStudent(null);
    };
    // État pour stocker l'étudiant à supprimer
    const [studentToDelete, setStudentToDelete] = useState(null);

// Confirmer la suppression
    const confirmDelete = (id) => {
        const start = performance.now();

        // Find the payment to delete
        const studentToDelete = selectedStudents.find((student) => student.id === id);
        if (!studentToDelete) {
            console.error(`No student found with ID: ${id}`);
            return;
        }

        // Optimistic update
        setSelectedStudents((prev) => prev.filter((student) => student.id !== id));

        // Delete from backend
        axios.delete(`http://localhost:5000/api/payments/${id}`)
            .then(() => {
                console.log("Delete succeeded");
            })
            .catch((error) => {
                console.error("Error deleting:", error);
                // Revert optimistic update in case of failure
                setSelectedStudents((prev) => [...prev, studentToDelete]);
            });

        console.log("Handler execution time:", performance.now() - start);
    };

    // Handle delete confirmation and then call delete function
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this payment?")) {
            confirmDelete(id);
        }
    };

    // Charger les données depuis localStorage lors du montage du composant
    useEffect(() => {
        const storedData = localStorage.getItem("selectedStudents");
        if (storedData) {
            setSelectedStudents(JSON.parse(storedData));
        }
    }, []);

// Annuler la suppression
    const cancelDelete = () => {
        setShowDeleteModal(false); // Close the delete modal without deleting
    };
    // Gérer la soumission des paiements
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
                lastReceived: receivedAmount, // Add this line to track the last received amount
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
                    lastReceived: receivedAmount, // Send this to the backend
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



    // Mettre à jour les paiements totaux et les montants restants
    const updateTotals = (students) => {
        const newTotalPayments = students.reduce((acc, student) => acc + (student.montantReçu || 0), 0);
        const newTotalRemaining = students.reduce((acc, student) => acc + (student.reste || 0), 0);
        setTotalPayments(newTotalPayments);
        setTotalRemaining(newTotalRemaining);
    };

// Fonction permettant de gérer l'impression de la facture
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
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .logo { height: 60px; }
                .university-name { text-align: center; font-weight: bold; font-size: 1.2em; }
                .details { margin: 20px 0; }
                .details p { margin: 5px 0; }
                .status { font-weight: bold; color: ${student.status === "Payé" ? "green" : "red"}; }
            </style>
        </head>
        <body>
           <div class="header">
                <img src="./img.png" alt="Logo" class="logo" />
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
                <p>Nom de l'étudiant: ${student.firstName || "N/A"} ${student.lastName || "N/A"}</p>
                <p>Dernier Montant Reçu: ${(student.lastReceived || 0).toLocaleString()} CFA</p>
                <p>Montant Total Reçu: ${(student.montantReçu || 0).toLocaleString()} CFA</p>
                <p>Reste: ${(student.reste || 0).toLocaleString()} CFA</p>
                <p>Status: <span class="status">${student.status || "N/A"}</span></p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
            <br>
            <br>
            <br>
            <br>
            
            <hr>
            <br>
            <br>
            <br>
            <br>
            ----------------------------------------------------------------------------------------------
            ----------------------------------- <br>
            
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
                       <div class="header">
                <img src="./img.png" alt="Logo" class="logo" />
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
                <p>Nom de l'étudiant: ${student.firstName || "N/A"} ${student.lastName || "N/A"}</p>
                <p>Dernier Montant Reçu: ${(student.lastReceived || 0).toLocaleString()} CFA</p>
                <p>Montant Total Reçu: ${(student.montantReçu || 0).toLocaleString()} CFA</p>
                <p>Reste: ${(student.reste || 0).toLocaleString()} CFA</p>
                <p>Status: <span class="status">${student.status || "N/A"}</span></p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature) 
            <hr>
            <br>
        </body>
        </html>
    `);
        invoiceWindow.document.close();
        invoiceWindow.print();
    };

    const DeleteModal = ({ student, onConfirm, onClose }) => {
        const handleDelete = () => {
            // Call the onConfirm function passed as prop to trigger deletion
            onConfirm(student.id);  // Assuming `student.id` contains the ID of the student or payment to delete
            onClose();  // Close the modal after confirming the deletion
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
    return (
        <div className="payment-dashboard">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>GESTION DES ETUDIANTS</h2>
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <a href="/accountant">
                            <FaUserGraduate/> Tableau de bord
                        </a>
                    </li>
                    <li>
                        <a href="/student">
                            <FaChalkboardTeacher/> Etudiants
                        </a>
                    </li>
                    <li>
                        <a href="/student/manage">
                            <FaChalkboardTeacher/> Personnel
                        </a>
                    </li>
                </ul>
            </div>

            <div className="main-content">
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
                    <select  className="selected_st" onChange={handleStudentChange}>
                        <option value="">-- Sélectionnez un étudiant --</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {`${student.firstName} ${student.lastName}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="payment-section">
                    <table className="payment-table">
                        <thead>
                        <tr>
                            <th>Étudiant</th>
                            <th>Filière</th>
                            <th>Total des Paiements (CFA)</th>
                            <th>Montant Reçu (CFA)</th>
                            <th>Reste (CFA)</th>
                            <th>Status</th>
                            <th style={{textAlign: "right"}}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedStudents.map((student) => (
                            <tr key={student.id}>
                                <td>{student.firstName}{student.lastName}</td>
                                <td>{student.filiere}</td>
                                <td>{student.totalFees.toLocaleString()} CFA</td>
                                <td>{student.montantReçu.toLocaleString()} CFA</td>
                                <td>{student.reste.toLocaleString()} CFA</td>
                                <td className={student.status === "Payé" ? "status-paid" : "status-unpaid"}>
                                    {student.status}
                                </td>
                                <td style={{textAlign: "right"}}>
                                    <button className="icon-btn4" onClick={() => openPaymentPopup(student)}>
                                        💰
                                    </button>
                                    <button className="icon-btn5" onClick={() => handleDelete(student.id)}>
                                        <FaTrash/>
                                    </button>
                                    <button className="icon-btn6" onClick={() => printInvoice(student)}>
                                        <FaPrint/>
                                    </button>
                                </td>

                                {/*
                                {showDeleteModal && (
                                    <DeleteModal
                                        student={studentToDelete}
                                        onConfirm={confirmDelete}
                                        onClose={cancelDelete}
                                    />
                                )}
                             */}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPopup && currentStudent && (
                <PaymentModal
                    student={currentStudent}
                    onSubmit={handlePaymentSubmit}
                    onClose={closePaymentPopup}
                />
            )}
        </div>
    );
};

export default PaymentDashboard;