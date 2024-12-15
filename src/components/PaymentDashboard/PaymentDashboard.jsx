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

    useEffect(() => {
        // Fetch the students from the database
        axios
            .get("http://localhost:5000/api/students")
            .then((response) => setStudents(response.data))
            .catch((error) => {
                console.error("Error fetching students:", error);
                alert("Unable to fetch student data. Please try again later.");
            });

        // Fetch the payment records for selected students
        axios
            .get("http://localhost:5000/api/payments")
            .then((response) => {
                // Map the payments to students and set them in selectedStudents state
                const studentsWithPayments = response.data.map(payment => {
                    const student = students.find(s => s.id === payment.student_id);
                    return { ...student, ...payment };
                });
                setSelectedStudents(studentsWithPayments);
            })
            .catch((error) => {
                console.error("Error fetching payment records:", error);
            });
    }, []);  // This will run only once when the component mounts

// Handle adding a student to the table
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

            // Save the selected student to the database automatically
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

    // Open the payment popup
    const openPaymentPopup = (student) => {
        setCurrentStudent(student);
        setShowPopup(true);
    };

    // Close the payment popup
    const closePaymentPopup = () => {
        setShowPopup(false);
        setCurrentStudent(null);
    };
    // State to store the student to delete
    const [studentToDelete, setStudentToDelete] = useState(null);

// Confirm deletion
    const confirmDelete = async () => {
        try {
            // Call the API to delete the student using their id
            await axios.delete(`http://localhost:5000/api/students/${studentToDelete.id}`);
            console.log("Student deleted:", studentToDelete.id);

            // Update the student list after deletion
            setSelectedStudents((prevStudents) =>
                prevStudents.filter((student) => student.id !== studentToDelete.id)
            );
            setShowDeleteModal(false); // Close the delete modal
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };
    const handleStudentDelete = (student) => {
        setStudentToDelete(student); // Store the student to delete
        setShowDeleteModal(true);    // Show the delete confirmation modal
    };
    // Load data from localStorage on component mount
    useEffect(() => {
        const storedData = localStorage.getItem("selectedStudents");
        if (storedData) {
            setSelectedStudents(JSON.parse(storedData));
        }
    }, []);

// Cancel deletion
    const cancelDelete = () => {
        setShowDeleteModal(false); // Close the delete modal without deleting
    };
    // Handle payment submission
    const handlePaymentSubmit = (montantReçu) => {
        if (currentStudent && montantReçu) {
            const receivedAmount = parseFloat(montantReçu) || 0;
            const remainingAmount = Math.max(currentStudent.totalFees - receivedAmount, 0);
            const status = remainingAmount === 0 ? "Payé" : "Partiellement Payé";

            const updatedStudent = {
                ...currentStudent,
                montantReçu: receivedAmount,
                reste: remainingAmount,
                status,
            };

            // Update in the frontend state
            const updatedStudents = selectedStudents.map((student) =>
                student.id === currentStudent.id ? updatedStudent : student
            );
            setSelectedStudents(updatedStudents);
            updateTotals(updatedStudents);

            // Send the update to the backend
            axios
                .put(`http://localhost:5000/api/payments/${currentStudent.id}`, {
                    student_id: currentStudent.id,
                    montantReçu: receivedAmount,
                    reste: remainingAmount,
                    status: status,
                    date: new Date().toISOString(),
                })
                .then((response) => {
                    console.log("Payment updated:", response.data);
                    closePaymentPopup();
                })
                .catch((error) => {
                    console.error("Error updating payment:", error);
                    alert("Failed to update payment. Please try again later.");
                });
        } else {
            alert("Veuillez entrer un montant valide.");
        }
    };



    // Update total payments and remaining amounts
    const updateTotals = (students) => {
        const newTotalPayments = students.reduce((acc, student) => acc + (student.montantReçu || 0), 0);
        const newTotalRemaining = students.reduce((acc, student) => acc + (student.reste || 0), 0);
        setTotalPayments(newTotalPayments);
        setTotalRemaining(newTotalRemaining);
    };

// Function to handle printing the invoice
    const printInvoice = (student) => {
        const currentDate = new Date();

        // Format the date to '12 JAN 2024'
        const formattedDate = currentDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).toUpperCase(); // Ensures the month is in uppercase

        // Format the time to 24-hour format
        const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23", // 24-hour time format
        });

        const invoiceWindow = window.open("", "_blank");
        invoiceWindow.document.write(`
        <html>
        <head>
            <title>Reçu du Paiement</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .logo {
                    height: 60px;
                }
                .university-name {
                    text-align: center;
                    font-weight: bold;
                    font-size: 1.2em;
                }
                .details {
                    margin: 20px 0;
                }
                .details p {
                    margin: 5px 0;
                }
                .status {
                    font-weight: bold;
                    color: ${student.status === "Payé" ? "green" : "red"};
                }
            </style>
        </head>
        <body>
           <div class="header">
                <img src="./img.png" alt="Logo" class="logo" />
                <div class="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: ${student.subject || "N/A"}
                </div>
                <div>
                    <p>Date: ${formattedDate}</p>
                    <p>Heure: ${formattedTime}</p>
                </div>
            </div>
            <div class="details">
                <p>Nom de l'étudiant: ${student.firstName} ${student.lastName}</p>
                <p>Montant Reçu: ${student.montantReçu.toLocaleString()} CFA</p>
                <p>Reste: ${student.reste.toLocaleString()} CFA</p>
                <p>Status: <span class="status">${student.status}</span></p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature)<hr>
            <br /> <br /> <br /> <br /> <br />  <br />
            -------------------------------------------------------------------------------------------
            -----------------------------
            <br /> <br /> <br /> <br /> <br /> <br />
            <div class="header">
                <img src="/img.png" alt="Logo" class="logo" />
                <div class="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: ${student.subject || "N/A"}
                </div>
                <div>
                    <p>Date: ${formattedDate}</p>
                    <p>Heure: ${formattedTime}</p>
                </div>
            </div>
            <div class="details">
                <p>Nom de l'étudiant: ${student.firstName} ${student.lastName}</p>
                <p>Montant Reçu: ${student.montantReçu.toLocaleString()} CFA</p>
                <p>Reste: ${student.reste.toLocaleString()} CFA</p>
                <p>Status: <span class="status">${student.status}</span></p>
            </div>
            Le Chef du Service et des Finances et de la comptabilité(Cachet et Signature)<hr>
        </body>
        </html>
    `);
        invoiceWindow.document.close();
        invoiceWindow.print();
    };

    const DeleteModal = ({ student, onConfirm, onClose }) => {
        return (
            <div className="delete-popup">
                <div className="delete-popup-content">
                    <button className="delete-close-btn" onClick={onClose}>X</button>
                    <h3 className="delete-message">Êtes-vous sûr de vouloir supprimer cet étudiant ?</h3>
                    <div className="delete-actions">
                        <button onClick={onConfirm} className="confirm-delete">Oui, Supprimer</button>
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
                                    <button className="icon-btn5" onClick={() => handleStudentDelete(student.id)}>
                                        <FaTrash/>
                                    </button>

                                    {showDeleteModal && (
                                        <DeleteModal
                                            student={studentToDelete}
                                            onConfirm={confirmDelete}
                                            onClose={cancelDelete}
                                        />
                                    )}
                                    <button className="icon-btn6" onClick={() => printInvoice(student)}>
                                        <FaPrint/>
                                    </button>
                                </td>

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