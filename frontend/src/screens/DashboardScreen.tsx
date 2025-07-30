import React, { useState, useEffect } from "react";
import surveyData from "./data/surveys.json"; // DATENBANK: Wird durch API-Import ersetzt
import "./App.css";
import calendarIcon from "./assets/icons/calendar.svg";
import questionIcon from "./assets/icons/question.svg";

const DashboardScreen = () => {
  // DATENBANK: Zustand für API-Ladezustände hinzufügen
  const [surveys, setSurveys] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  useEffect(() => {
    // DATENBANK: Wird durch echten API-Call ersetzt
    /*
    const fetchSurveys = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/surveys');
        if (!response.ok) throw new Error('Daten konnten nicht geladen werden');
        const data = await response.json();
        setSurveys(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurveys();
    */

    // Aktuelle Mock-Daten (werden entfernt)
    setSurveys(surveyData.surveys || []);
  }, []);

  // DATENBANK: Löschfunktion für Backend
  /*
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/surveys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
      });
      if (!response.ok) throw new Error('Löschen fehlgeschlagen');
      setSurveys(prev => prev.filter(survey => survey.id !== id));
    } catch (err) {
      console.error('Fehler:', err);
      // Fehlerbehandlung im UI einbauen
    }
  };
  */

  return (
    <div className="app-container">
      <nav className="navbar">
        <button className="return-button">Zurück</button>
        <h1 className="navbar-title">Meine Umfragen</h1>
      </nav>

      <div className="content">
        {/* DATENBANK: Lade- und Fehlerzustand anzeigen
        {isLoading && <div>Lade Umfragen...</div>}
        {error && <div className="error">{error}</div>}
        */}

        {surveys.length > 0 ? (
          <>
            <div className="content-title">
              <h4>Verwalten Sie Ihre erstellten Umfragen</h4>
              {/* DATENBANK: Wird zur POST-API */}
              <button className="new-survey-button">
                Neue Umfrage erstellen
              </button>
            </div>

            <div className="cards-container">
              <div className="survey-grid">
                {surveys.map((survey) => (
                  <div key={survey.id} className="survey-card">
                    {/* DATENBANK: Alle Felder verifizieren */}
                    <div className="card-header">
                      <h3 className="survey-title">{survey.name}</h3>
                      {/* DB-Feld: title? */}
                      <p className="survey-date">
                        <img src={calendarIcon} className="icon" />
                        {survey.date}
                        {/* DB-Feld: created_at? Format anpassen */}
                      </p>
                    </div>

                    <div className="card-body">
                      <p className="survey-meta">
                        <img src={questionIcon} className="icon" />
                        {survey.questionCount} Fragen
                        {/* DB-Feld: questions_count? */}
                      </p>
                      <div className="poll-code">
                        <span>Poll-Code:</span>
                        <strong>{survey.pollCode}</strong>
                        {/* DB-Feld: code? */}
                      </div>
                    </div>

                    <div className="card-actions">
                      <div className="action-buttons-row">
                        {/* DATENBANK: API-Endpoints zuweisen */}
                        <button className="action-button start">Starten</button>
                        <button className="action-button results">
                          Ergebnisse
                        </button>
                      </div>
                      <button
                        className="action-button delete"
                        // onClick={() => handleDelete(survey.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="content-card">
            <h3 className="card-title">Keine Umfragen vorhanden</h3>
            <p className="card-text">Es wurden keine Umfragen gefunden</p>
            <button className="main-button">Erste Umfrage erstellen</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
