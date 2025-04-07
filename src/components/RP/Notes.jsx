import React, { useState, useEffect } from 'react';
import { logout } from '../../utils/authUtils';
import { Link } from 'react-router-dom';
import './Notes.css';
import {
    FaUserGraduate,
    FaBook,
    FaCalendarAlt,
    FaCertificate,
    FaSignOutAlt, 
    FaTrash, 
    FaPrint, 
    FaNoteSticky, 
    FaArrowLeft, 
    FaArrowRight, 
    FaChalkboardTeacher,
    FaPlus
} from 'react-icons/fa';
import axios from "axios";
import { FaNoteSticky as FaNote } from "react-icons/fa6";

const Notes = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isAddNotePopupOpen, setIsAddNotePopupOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [creditsUE, setCreditsUE] = useState('');
    const [moyenneUE, setMoyenneUE] = useState('');
    const [resultatUE, setResultatUE] = useState('');
    const [elementsConstitutifs, setElementsConstitutifs] = useState('');
    const [coefficient, setCoefficient] = useState('');
    const [controleContinu, setControleContinu] = useState('');
    const [examen, setExamen] = useState('');
    const [moyenneEC, setMoyenneEC] = useState('');
    const [matieres, setMatieres] = useState([{ nom: '', coefficient: '', note: '' }]);
    const [maxMatieres, setMaxMatieres] = useState(5);
    const [studentNotes, setStudentNotes] = useState([]);
    const [ueNotes, setUeNotes] = useState({
        semestre1: [],
        semestre2: []
    });
    const [displayedNotes, setDisplayedNotes] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/students')
            .then(response => setStudents(response.data))
            .catch(error => console.error('Error fetching students:', error));
    }, []);
 // Dans votre composant React (Notes.js), mettez à jour la fonction fetchStudentNotes comme suit :

// Ajoutez cet état pour gérer le chargement
const [isLoading, setIsLoading] = useState(false);

// Modifiez fetchStudentNotes
const fetchStudentNotes = async (studentId) => {
  setIsLoading(true);
  try {
    const response = await axios.get(`http://localhost:5000/api/students/${studentId}/notes`);
    
    if (!response.data) {
      throw new Error('Aucune donnée reçue');
    }

    const notesToDisplay = transformNotesForDisplay(response.data);
    setDisplayedNotes(notesToDisplay);
    setStudentNotes(response.data);
    
  } catch (error) {
    console.error("Erreur:", error);
    setDisplayedNotes([]);
  } finally {
    setIsLoading(false);
  }
};

// Fonction de transformation des données
const transformNotesForDisplay = (apiData) => {
  return apiData.semestre1.concat(apiData.semestre2 || [])
    .flatMap(ue => 
      ue.ecs.map(ec => ({
        studentId: apiData.student.id,
        firstName: apiData.student.firstName,
        lastName: apiData.student.lastName,
        subject: apiData.student.subject,
        credits: ue.credits,
        moyenneUE: ue.moyenne,
        resultatUE: ue.resultat,
        elementsConstitutifs: ec.nom,
        coefficient: ec.coefficient,
        controleContinu: ec.controle_continu,
        examen: ec.examen,
        moyenneEC: ec.moyenne,
        semestre: ue.semestre
      }))
    );
};

// Et dans votre JSX, mettez à jour le tableau comme ceci :
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
        {displayedNotes.length > 0 ? (
            displayedNotes.map((note, index) => (
                <tr key={index}>
                    <td>{note.firstName} {note.lastName}</td>
                    <td>{note.subject}</td>
                    <td>{note.studentId}</td>
                    <td>{note.credits || 'N/A'}</td>
                    <td>{note.moyenneUE || 'N/A'}</td>
                    <td>{note.resultatUE || 'N/A'}</td>
                    <td>{note.elementsConstitutifs}</td>
                    <td>{note.coefficient}</td>
                    <td>{note.controleContinu || 'N/A'}</td>
                    <td>{note.examen || 'N/A'}</td>
                    <td>{note.moyenneEC || 'N/A'}</td>
                    <td style={{textAlign: "right"}} className="btn">
                        <button className="icon-btn1" onClick={() => handleOpenPopup(selectedStudent)}>
                            <FaNote/>
                        </button>
                        <button className="icon-btn2"><FaTrash/></button>
                        <button className="icon-btn3"><FaPrint/></button>
                    </td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="12" style={{textAlign: "center"}}>
                    {selectedStudent ? "Aucune note enregistrée pour cet étudiant" : "Sélectionnez un étudiant"}
                </td>
            </tr>
        )}
    </tbody>
</table>


    const organizeNotesByUE = () => {
        const sem1 = [];
        const sem2 = [];
        
        // Structure d'exemple - à adapter avec vos données réelles
        matieres.forEach((matiere, index) => {
            if (matiere.nom && matiere.note) {
                // Exemple d'organisation pour le semestre 1
                if (index % 2 === 0) {
                    sem1.push({
                        ue: `UE ${Math.floor(index/2) + 1}`,
                        ec: matiere.nom,
                        coefficient: matiere.coefficient,
                        note: matiere.note,
                        ueCoefficient: coefficient || 1
                    });
                } else {
                    // Exemple d'organisation pour le semestre 2
                    sem2.push({
                        ue: `UE ${Math.floor(index/2) + 1}`,
                        ec: matiere.nom,
                        coefficient: matiere.coefficient,
                        note: matiere.note,
                        ueCoefficient: coefficient || 1
                    });
                }
            }
        });

        setUeNotes({
            semestre1: sem1,
            semestre2: sem2
        });
    };

    useEffect(() => {
        if (matieres.some(m => m.nom && m.note)) {
            organizeNotesByUE();
        }
    }, [matieres, coefficient]);

    const calculateUEMoyenne = (notes, ueName) => {
        const ueNotes = notes.filter(note => note.ue === ueName);
        if (ueNotes.length === 0) return null;
        
        const total = ueNotes.reduce((sum, note) => sum + (parseFloat(note.note) * parseFloat(note.coefficient)), 0);
        const totalCoeff = ueNotes.reduce((sum, note) => sum + parseFloat(note.coefficient), 0);
        return (total / totalCoeff).toFixed(2);
    };

    const handleOpenPopup = (student) => {
        setSelectedStudent(student);
        fetchStudentNotes(student.id);
        setIsPopupOpen(true);
    };

    const handleOpenAddNotePopup = (student) => {
        setSelectedStudent(student);
        setIsAddNotePopupOpen(true);
    };

    const handleStudentChange = (event) => {
        const studentId = event.target.value;
        const student = students.find((s) => s.id === parseInt(studentId, 10));
        setSelectedStudent(student);
    };

    const [ueStructure, setUeStructure] = useState({
        semestre1: [
          {
            nom: '',
            coefficient: '',
            credits: '',
            ecs: [
              { nom: '', coefficient: '', note: '' }
            ]
          }
        ],
        semestre2: [
          {
            nom: '',
            coefficient: '',
            credits: '',
            ecs: [
              { nom: '', coefficient: '', note: '' }
            ]
          }
        ]
      });

      // Calcul de la moyenne d'une UE à partir de sa structure
const calculateUEMoyenneFromStructure = (ue) => {
    if (!ue.ecs || ue.ecs.length === 0) return 0;
    
    let totalCoeff = 0;
    let totalNotes = 0;
    
    ue.ecs.forEach(ec => {
        if (ec.note) {
            totalNotes += ec.note * ec.coefficient;
            totalCoeff += ec.coefficient;
        }
    });
    
    return totalCoeff > 0 ? totalNotes / totalCoeff : 0;
};

// Calcul de la moyenne d'un semestre
        const calculateSemesterAverage = (semestre) => {
            if (!ueStructure[semestre] || ueStructure[semestre].length === 0) return 0;
            
            let totalCoeff = 0;
            let totalNotes = 0;
            
            ueStructure[semestre].forEach(ue => {
                const ueMoyenne = calculateUEMoyenneFromStructure(ue);
                totalNotes += ueMoyenne * ue.coefficient;
                totalCoeff += ue.coefficient;
            });
            
            return totalCoeff > 0 ? totalNotes / totalCoeff : 0;
        };

// Calcul de la moyenne générale
const calculateGlobalAverage = () => {
    const s1 = calculateSemesterAverage('semestre1');
    const s2 = calculateSemesterAverage('semestre2');
    
    // Vous pouvez ajuster la pondération entre semestres si nécessaire
    return (s1 + s2) / 2;
};

// Récupération des notes d'une UE
const getUENotes = (semestre, ueIndex) => {
    return ueNotes[semestre].filter(note => 
        note.ueIndex === ueIndex
    );
};

      const handleAddUE = (semestre) => {
        setUeStructure(prev => ({
          ...prev,
          [semestre]: [
            ...prev[semestre],
            {
              nom: '',
              coefficient: '',
              credits: '',
              ecs: [
                { nom: '', coefficient: '', note: '' }
              ]
            }
          ]
        }));
      };
      
      const handleRemoveUE = (semestre, index) => {
        setUeStructure(prev => ({
          ...prev,
          [semestre]: prev[semestre].filter((_, i) => i !== index)
        }));
      };
      
      const handleAddEC = (semestre, ueIndex) => {
        setUeStructure(prev => {
          const newStructure = { ...prev };
          newStructure[semestre][ueIndex].ecs.push({
            nom: '', coefficient: '', note: ''
          });
          return newStructure;
        });
      };
      
      const handleRemoveEC = (semestre, ueIndex, ecIndex) => {
        setUeStructure(prev => {
          const newStructure = { ...prev };
          newStructure[semestre][ueIndex].ecs = 
            newStructure[semestre][ueIndex].ecs.filter((_, i) => i !== ecIndex);
          return newStructure;
        });
      };
      
      const handleUEChange = (semestre, ueIndex, field, value) => {
        setUeStructure(prev => {
          const newStructure = { ...prev };
          newStructure[semestre][ueIndex][field] = value;
          return newStructure;
        });
      };
      
      const handleECChange = (semestre, ueIndex, ecIndex, field, value) => {
        setUeStructure(prev => {
          const newStructure = { ...prev };
          newStructure[semestre][ueIndex].ecs[ecIndex][field] = value;
          return newStructure;
        });
      };

    const filteredStudents = students.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveNote = async () => {
        if (!selectedStudent) return;
        
        try {
            // Préparer les données dans le format attendu par l'API
            const noteData = {
                creditsUE: parseFloat(creditsUE),
                moyenneUE: moyenneUE ? parseFloat(moyenneUE) : null,
                resultatUE,
                ueNotes: {
                    semestre1: ueStructure.semestre1.map(ue => ({
                        ue: ue.nom,
                        ecs: ue.ecs.map(ec => ({
                            ec: ec.nom,
                            coefficient: parseFloat(ec.coefficient || 0),
                            note: parseFloat(ec.note || 0)
                        })),
                        ueCoefficient: parseFloat(ue.coefficient || 0),
                        credits: parseFloat(ue.credits || 0)
                    })),
                    semestre2: ueStructure.semestre2.map(ue => ({
                        ue: ue.nom,
                        ecs: ue.ecs.map(ec => ({
                            ec: ec.nom,
                            coefficient: parseFloat(ec.coefficient || 0),
                            note: parseFloat(ec.note || 0)
                        })),
                        ueCoefficient: parseFloat(ue.coefficient || 0),
                        credits: parseFloat(ue.credits || 0)
                    }))
                }
            };
    
            const response = await axios.post(
                `http://localhost:5000/api/students/notes/${selectedStudent.id}`,
                noteData
            );
    
            if (response.data.success) {
                // 1. Fermer le popup
                setIsAddNotePopupOpen(false);
                
                // 2. Réinitialiser le formulaire
                resetForm();
                
                // 3. Recharger les notes de l'étudiant
                await fetchStudentNotes(selectedStudent.id);
                
                // 4. Afficher un message de succès
                alert('Notes enregistrées avec succès');
            }
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response) {
                alert(`Erreur: ${error.response.data.error || error.response.data.message}`);
            } else {
                alert('Erreur lors de la communication avec le serveur');
            }
        }
    };

      const resetForm = () => {
        setCreditsUE('');
        setMoyenneUE('');
        setResultatUE('');
        setUeStructure({
          semestre1: [
            {
              nom: '',
              coefficient: '',
              credits: '',
              ecs: [
                { nom: '', coefficient: '', note: '' }
              ]
            }
          ],
          semestre2: [
            {
              nom: '',
              coefficient: '',
              credits: '',
              ecs: [
                { nom: '', coefficient: '', note: '' }
              ]
            }
          ]
        });
      };

    const handleAddMatiere = () => {
        if (matieres.length < maxMatieres) {
            setMatieres([...matieres, { nom: '', coefficient: '', note: '' }]);
        }
    };

    const handleRemoveMatiere = (index) => {
        const newMatieres = [...matieres];
        newMatieres.splice(index, 1);
        setMatieres(newMatieres);
    };

    const handleMatiereChange = (index, field, value) => {
        const newMatieres = [...matieres];
        newMatieres[index][field] = value;
        setMatieres(newMatieres);
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
                
                <div className="add-note-btn-container">
                    <button 
                        className="add-note-btn"
                        onClick={() => selectedStudent && handleOpenAddNotePopup(selectedStudent)}
                        disabled={!selectedStudent}
                    >
                        <FaPlus /> Ajouter des notes
                    </button>
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
                            {displayedNotes.length > 0 ? (
                                displayedNotes.map((note, index) => (
                                    <tr key={index}>
                                        <td>{note.firstName} {note.lastName}</td>
                                        <td>{note.subject}</td>
                                        <td>{note.studentId}</td>
                                        <td>{note.credits ?? 'N/A'}</td>
                                        <td>{note.moyenneUE ?? 'N/A'}</td>
                                        <td>{note.resultatUE ?? 'N/A'}</td>
                                        <td>{note.elementsConstitutifs}</td>
                                        <td>{note.coefficient}</td>
                                        <td>{note.controleContinu ?? 'N/A'}</td>
                                        <td>{note.examen ?? 'N/A'}</td>
                                        <td>{note.moyenneEC ?? 'N/A'}</td>
                                        <td style={{textAlign: "right"}} className="btn">
                                            <button className="icon-btn1" onClick={() => handleOpenPopup(selectedStudent)}>
                                                <FaNote/>
                                            </button>
                                            <button className="icon-btn2"><FaTrash/></button>
                                            <button className="icon-btn3"><FaPrint/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" style={{textAlign: "center"}}>
                                        {selectedStudent ? "Aucune note enregistrée pour cet étudiant" : "Sélectionnez un étudiant"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Popup pour ajouter des notes */}
                {isAddNotePopupOpen && (
                    <div className="popup-overlay">
                        <div className="popup-content large-popup">
                            <h3>AJOUTER DES NOTES</h3>
                            <p>Étudiant : <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong></p>

                            <div className="form-section">
                                <h4>Structure UE/EC</h4>
                                
                                {['semestre1', 'semestre2'].map(semestre => (
                                    <div key={semestre} className="semestre-section">
                                    <h5>Semestre {semestre === 'semestre1' ? '1' : '2'}</h5>
                                    
                                    {ueStructure[semestre].map((ue, ueIndex) => (
                                        <div key={`${semestre}-${ueIndex}`} className="ue-group">
                                        <div className="ue-header">
                                            <h6>Unité d'Enseignement {ueIndex + 1}</h6>
                                            <button 
                                            className="remove-btn"
                                            onClick={() => handleRemoveUE(semestre, ueIndex)}
                                            >
                                            <FaTrash />
                                            </button>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-group">
                                            <label>Nom UE</label>
                                            <input
                                                value={ue.nom}
                                                onChange={(e) => handleUEChange(semestre, ueIndex, 'nom', e.target.value)}
                                                placeholder="Nom de l'UE"
                                            />
                                            </div>
                                            <div className="form-group">
                                            <label>Coefficient UE</label>
                                            <input
                                                type="number"
                                                value={ue.coefficient}
                                                onChange={(e) => handleUEChange(semestre, ueIndex, 'coefficient', e.target.value)}
                                                placeholder="Coefficient"
                                                step="0.5"
                                            />
                                            </div>
                                            <div className="form-group">
                                            <label>Crédits UE</label>
                                            <input
                                                type="number"
                                                value={ue.credits}
                                                onChange={(e) => handleUEChange(semestre, ueIndex, 'credits', e.target.value)}
                                                placeholder="Crédits"
                                            />
                                            </div>
                                        </div>
                                        
                                        <div className="ecs-list">
                                            <h6>Éléments Constitutifs</h6>
                                            {ue.ecs.map((ec, ecIndex) => (
                                            <div key={`${semestre}-${ueIndex}-${ecIndex}`} className="ec-row">
                                                <div className="form-group">
                                                <label>Nom EC</label>
                                                <input
                                                    value={ec.nom}
                                                    onChange={(e) => handleECChange(semestre, ueIndex, ecIndex, 'nom', e.target.value)}
                                                    placeholder="Nom de l'EC"
                                                />
                                                </div>
                                                <div className="form-group">
                                                <label>Coefficient EC</label>
                                                <input
                                                    type="number"
                                                    value={ec.coefficient}
                                                    onChange={(e) => handleECChange(semestre, ueIndex, ecIndex, 'coefficient', e.target.value)}
                                                    placeholder="Coefficient"
                                                    step="0.5"
                                                />
                                                </div>
                                                <div className="form-group">
                                                <label>Note</label>
                                                <input
                                                    type="number"
                                                    value={ec.note}
                                                    onChange={(e) => handleECChange(semestre, ueIndex, ecIndex, 'note', e.target.value)}
                                                    placeholder="Note"
                                                    min="0"
                                                    max="20"
                                                    step="0.01"
                                                />
                                                </div>
                                                <button 
                                                className="remove-btn"
                                                onClick={() => handleRemoveEC(semestre, ueIndex, ecIndex)}
                                                >
                                                <FaTrash />
                                                </button>
                                            </div>
                                            ))}
                                            
                                            <button 
                                            className="add-btn"
                                            onClick={() => handleAddEC(semestre, ueIndex)}
                                            >
                                            <FaPlus /> Ajouter un EC
                                            </button>
                                        </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        className="add-btn"
                                        onClick={() => handleAddUE(semestre)}
                                    >
                                        <FaPlus /> Ajouter une UE
                                    </button>
                                    </div>
                                ))}
                                </div>
                 {/* Aperçu dynamique du bulletin */}
                            <div className="preview-section">
                                <h4>Aperçu du Bulletin</h4>
                                <div className="preview-notes-table">
                                    {['semestre1', 'semestre2'].map(semestre => (
                                        <div key={semestre} className="semester-preview">
                                            <h5>Semestre {semestre === 'semestre1' ? '1' : '2'}</h5>
                                            
                                            {ueStructure[semestre].length > 0 ? (
                                                ueStructure[semestre].map((ue, ueIndex) => {
                                                    const ueNotes = getUENotes(semestre, ueIndex);
                                                    const ueMoyenne = calculateUEMoyenneFromStructure(ue);
                                                    
                                                    return (
                                                        <div key={`preview-${semestre}-${ueIndex}`} className="ue-preview">
                                                            <div className="ue-preview-header">
                                                                <h6>UE {ueIndex + 1}: {ue.nom}</h6>
                                                                <span className="ue-average">Moyenne UE: {ueMoyenne.toFixed(2)}</span>
                                                            </div>
                                                            
                                                            <table className="ec-preview-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>EC</th>
                                                                        <th>Coeff</th>
                                                                        <th>Note</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {ue.ecs.map((ec, ecIndex) => (
                                                                        <tr key={`preview-ec-${semestre}-${ueIndex}-${ecIndex}`}>
                                                                            <td>{ec.nom}</td>
                                                                            <td>{ec.coefficient}</td>
                                                                            <td className={ec.note ? '' : 'missing-note'}>
                                                                                {ec.note || '--'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="no-ue-message">Aucune UE définie pour ce semestre</p>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Résumé global */}
                                    <div className="global-summary">
                                        <h5>Résumé Global</h5>
                                        <div className="summary-grid">
                                            <div className="summary-item">
                                                <span>Moyenne Semestre 1</span>
                                                <strong>{calculateSemesterAverage('semestre1').toFixed(2)}</strong>
                                            </div>
                                            <div className="summary-item">
                                                <span>Moyenne Semestre 2</span>
                                                <strong>{calculateSemesterAverage('semestre2').toFixed(2)}</strong>
                                            </div>
                                            <div className="summary-item">
                                                <span>Moyenne Générale</span>
                                                <strong>{calculateGlobalAverage().toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="popup-actions">
                                <button className="save-btn" onClick={handleSaveNote}>Enregistrer</button>
                                <button className="cancel-btn" onClick={() => {
                                    setIsAddNotePopupOpen(false);
                                    resetForm();
                                }}>Annuler</button>
                            </div>
                        </div>
                    </div>
                )}
 
                    {isPopupOpen && (
                                    <div className="popup-overlay">
                                        <div className="popup-content large-popup notes-popup">
                                            <div className="notes-header">
                                                <h2>REPUBLIQUE DU SENEGAL</h2>
                                                <h3>MINISTÈRE DE L'ENSEIGNEMENT SUPERIEUR, DE LA RECHERCHE ET DE L'INNOVATION</h3>
                                                <h2>UNIVERSITE KOCC BARMA DE SAINT-LOUIS</h2>
                                                <p>Savoir - Leadership - Éthique - Compétence - Pouvoir - Progrès</p>
                                                <p>Agrément de l'UNI N°2200K1MJ/OGK2/OFSP du 09 août 2015</p>
                                            </div>

                                            <div className="student-info-section">
                                                <div className="info-row">
                                                    <span>Filière : {selectedStudent?.subject || 'N/A'}</span>
                                                    <span>Niveau : {selectedStudent?.level || 'N/A'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span>Année Académique : {new Date().getFullYear()}/{new Date().getFullYear()+1}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span>Prénom et Nom : {selectedStudent?.firstName} {selectedStudent?.lastName}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span>Date et lieu de naissance : {selectedStudent?.birthDate || 'N/A'} à {selectedStudent?.birthPlace || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="notes-table-container">
                                                <h3>RELEVE DE NOTES</h3>
                                                
                                                <table className="semester-notes-table">
                                                    <thead>
                                                        <tr>
                                                            <th rowSpan="2">Unités d'Enseignement (UE)</th>
                                                            <th colSpan="3">SEMESTRE 1</th>
                                                            <th rowSpan="2">Unités d'Enseignement (UE)</th>
                                                            <th colSpan="3">SEMESTRE 2</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Éléments Constitutifs (EC)</th>
                                                            <th>Moy</th>
                                                            <th>Moy UE</th>
                                                            <th>Éléments Constitutifs (EC)</th>
                                                            <th>Moy</th>
                                                            <th>Moy UE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentNotes.semestre1 && studentNotes.semestre1.length > 0 ? (
                                                            // Afficher les notes du semestre 1 et 2 côte à côte
                                                            // On détermine le nombre maximum de lignes nécessaires
                                                            Array.from({ length: Math.max(
                                                                studentNotes.semestre1.reduce((max, ue) => Math.max(max, ue.ecs.length), 0),
                                                                studentNotes.semestre2.reduce((max, ue) => Math.max(max, ue.ecs.length), 0)
                                                            )}).map((_, rowIndex) => {
                                                                // Trouver les UE correspondantes pour cette ligne
                                                                const ue1 = studentNotes.semestre1.find(ue => ue.ecs.length > rowIndex);
                                                                const ue2 = studentNotes.semestre2.find(ue => ue.ecs.length > rowIndex);
                                                                
                                                                return (
                                                                    <tr key={`row-${rowIndex}`}>
                                                                        {/* Colonnes Semestre 1 */}
                                                                        {ue1 ? (
                                                                            <>
                                                                                {rowIndex === 0 && (
                                                                                    <td rowSpan={ue1.ecs.length}>
                                                                                        {ue1.nom} (Coeff: {ue1.coefficient}, Crédits: {ue1.credits})
                                                                                    </td>
                                                                                )}
                                                                                <td>{ue1.ecs[rowIndex].nom} (Coeff: {ue1.ecs[rowIndex].coefficient})</td>
                                                                                <td>{ue1.ecs[rowIndex].moyenne}</td>
                                                                                {rowIndex === 0 && (
                                                                                    <td rowSpan={ue1.ecs.length}>{ue1.moyenne}</td>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                            </>
                                                                        )}
                                                                        
                                                                        {/* Colonnes Semestre 2 */}
                                                                        {ue2 ? (
                                                                            <>
                                                                                {rowIndex === 0 && (
                                                                                    <td rowSpan={ue2.ecs.length}>
                                                                                        {ue2.nom} (Coeff: {ue2.coefficient}, Crédits: {ue2.credits})
                                                                                    </td>
                                                                                )}
                                                                                <td>{ue2.ecs[rowIndex].nom} (Coeff: {ue2.ecs[rowIndex].coefficient})</td>
                                                                                <td>{ue2.ecs[rowIndex].moyenne}</td>
                                                                                {rowIndex === 0 && (
                                                                                    <td rowSpan={ue2.ecs.length}>{ue2.moyenne}</td>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                            </>
                                                                        )}
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="no-notes">Aucune note enregistrée pour cet étudiant</td>
                                                            </tr>
                                                        )}
                                                        
                                                        {/* Ligne de résumé */}
                                                        <tr className="summary-row">
                                                            <td colSpan="3">Crédits semestre 1</td>
                                                            <td>
                                                                {studentNotes.semestre1?.reduce((sum, ue) => sum + (ue.resultat === 'Validé' ? ue.credits : 0), 0)}/
                                                                {studentNotes.semestre1?.reduce((sum, ue) => sum + ue.credits, 0)}
                                                            </td>
                                                            <td colSpan="3">Crédits semestre 2</td>
                                                            <td>
                                                                {studentNotes.semestre2?.reduce((sum, ue) => sum + (ue.resultat === 'Validé' ? ue.credits : 0), 0)}/
                                                                {studentNotes.semestre2?.reduce((sum, ue) => sum + ue.credits, 0)}
                                                            </td>
                                                        </tr>
                                                        <tr className="summary-row">
                                                            <td colSpan="4">Total crédits obtenus</td>
                                                            <td colSpan="4">
                                                                {(studentNotes.semestre1?.reduce((sum, ue) => sum + (ue.resultat === 'Validé' ? ue.credits : 0), 0) || 0) + 
                                                                (studentNotes.semestre2?.reduce((sum, ue) => sum + (ue.resultat === 'Validé' ? ue.credits : 0), 0) || 0)}/
                                                                {(studentNotes.semestre1?.reduce((sum, ue) => sum + ue.credits, 0) || 0) + 
                                                                (studentNotes.semestre2?.reduce((sum, ue) => sum + ue.credits, 0) || 0)}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="university-footer">
                                                <p>Le Président</p>
                                                <p>Université Kocc Barma – Saint-Louis. Site web: www.ukb-senegal.com Courriel: univ.koccbarma@gmail.com</p>
                                                <p>BP 5036 - Tel : +221 77 538 91 91 / +221 77 125 33 37 / +221 33 961 77 03</p>
                                            </div>

                                            <div className="popup-actions">
                                                <button className="print-btn" onClick={() => window.print()}><FaPrint /> Imprimer</button>
                                                <button className="cancel-btn" onClick={() => setIsPopupOpen(false)}>Fermer</button>
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