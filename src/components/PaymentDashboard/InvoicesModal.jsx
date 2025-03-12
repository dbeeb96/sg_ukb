import React, { useEffect, useState } from "react";
import "./invoicesModal.css";

const InvoicesModal = ({ student, onClose }) => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // Fetch invoices when the component mounts
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`/api/invoices?studentId=${student.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInvoices(data);  // Set the fetched invoices to state
      } catch (error) {
        console.error("Erreur lors de la récupération des factures:", error);
        alert("Erreur lors du chargement des factures.");
      }
    };

    fetchInvoices();
  }, [student.id]);  // Re-run when student.id changes

  return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Historique des Factures</h2>
          {invoices.map((invoice, index) => (
              <div key={index} className="invoice-section">
                <div className="header">
                  <img src="/img.png" alt="Logo" className="logo" />
                  <div className="university-name">
                    KOCC BARMA, PREMIERE UNIVERSITE PRIVEE<br />
                    DE SAINT-LOUIS<br />
                    MENSUALITE: {student.filiere || "N/A"}
                  </div>
                  <div>
                    <p>Date: {new Date().toLocaleDateString("fr-FR")}</p>
                    <p>Heure: {new Date().toLocaleTimeString("fr-FR")}</p>
                  </div>
                </div>
                <div className="details">
                  <p>Nom de l'étudiant: {student.firstName} {student.lastName}</p>
                  <p>Dernier Montant Reçu: {invoice.montant.toLocaleString()} CFA</p>
                  <p>Reste: {invoice.reste.toLocaleString()} CFA</p>
                  <p>Status: <span className="status">{invoice.status}</span></p>
                </div>
                <p>Le Chef du Service et des Finances et de la comptabilité (Cachet et Signature)</p>
                <hr />
              </div>
          ))}
          <button onClick={onClose} className="close-btn">Fermer</button>
        </div>
      </div>
  );
};

export default InvoicesModal;
