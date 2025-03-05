import React, { useState, useEffect } from "react";
import axios from "axios";

const ReceiptsModal = ({ student, onClose }) => {
    const [receipts, setReceipts] = useState([]);

    useEffect(() => {
        if (student) {
            axios.get(`http://localhost:5000/api/payments/${student.id}/receipts`)
                .then((response) => {
                    setReceipts(response.data);
                })
                .catch((error) => {
                    console.error("Erreur lors de la récupération des reçus:", error);
                    alert("❌ Impossible d'afficher les reçus. Vérifiez la connexion ou réessayez.");
                });
        }
    }, [student]);

    return (
        <div className="receipts-popup">
            <div className="popup-content">
                <h3>Reçus de {student.firstName} {student.lastName}</h3>
                <ul>
                    {receipts.map((receipt, index) => (
                        <li key={index}>
                            📅 Date: {new Date(receipt.date).toLocaleDateString()} - 💰 Montant: {receipt.montantReçu} CFA
                        </li>
                    ))}
                </ul>
                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};