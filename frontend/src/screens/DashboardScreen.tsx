import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSurveys, deleteSurvey, type Survey } from '../lib/api';
import ConfirmDialog from './Components/ConfirmDialog';

const DashboardScreen = () => {
  const navigate = useNavigate();
  
  // State für Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    surveyId: '',
    surveyTitle: ''
  });
  
  // State für Umfragen und Loading
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Umfragen beim Component Mount laden
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSurveys();
        setSurveys(data);
      } catch (err) {
        console.error('Fehler beim Laden der Umfragen:', err);
        setError('Fehler beim Laden der Umfragen');
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, []);

  // Hilfsfunktion für Datumsformatierung
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const hasSurveys = surveys.length > 0;

  const createFirstPoll = () => {
    navigate('/create');
  };

  const startenBtn = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    
    // If survey is already active or finished, redirect to results
    if (survey && (survey.status === 'active' || survey.status === 'finished')) {
      navigate(`/my-polls/${surveyId}/result`);
    } else {
      // If survey is ready, go to manage screen
      navigate(`/my-polls/${surveyId}`);
    }
  };

  const loeschenBtn = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    setConfirmDialog({
      isOpen: true,
      surveyId: surveyId,
      surveyTitle: survey?.title || 'Unbekannte Umfrage'
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSurvey(confirmDialog.surveyId);
      
      // Survey aus der lokalen Liste entfernen
      setSurveys(prevSurveys => prevSurveys.filter(survey => survey.id !== confirmDialog.surveyId));
      
      console.log('Survey erfolgreich gelöscht:', confirmDialog.surveyId);
    } catch (error) {
      console.error('Fehler beim Löschen der Survey:', error);
      alert('Fehler beim Löschen der Umfrage. Bitte versuche es erneut.');
    } finally {
      setConfirmDialog({ isOpen: false, surveyId: '', surveyTitle: '' });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, surveyId: '', surveyTitle: '' });
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center pt-8 pb-6 px-4">
        <h1 className="text-4xl font-extrabold text-[#093a80] mb-2">📋 Meine Polls</h1>
        <p className="text-gray-600 text-lg">
          Verwalte deine erstellten Umfragen und sieh dir die Ergebnisse an
        </p>
      </div>

      {!hasSurveys && !loading && !error && (
        <div className="flex justify-center items-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Keine Umfragen vorhanden
            </h3>
            <p className="text-gray-500 text-base mb-6">
              Du hast noch keine Umfragen erstellt
            </p>
            <button
              onClick={createFirstPoll}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Erste Umfrage erstellen
            </button>
          </div>
        </div>
      )}

      {hasSurveys && !loading && (
        <div className="flex flex-col items-center px-4">
          <div className="flex flex-col sm:flex-row justify-end items-center mb-8 w-full max-w-6xl gap-4">
            <button
              onClick={createFirstPoll}
              className="py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Neue Umfrage erstellen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-10">
            {surveys.map((survey) => {
              // Datum formatieren im Format dd.MM.yyyy
              const formattedCreatedDate = formatDate(survey.created_at);
              const formattedExpiresDate = formatDate(survey.expires_at);
              
              // Prüfen ob die Umfrage bald abläuft (weniger als 2 Tage)
              const expiresAt = new Date(survey.expires_at);
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = daysUntilExpiry <= 2;
              
              return (
                <div
                  key={survey.id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full hover:shadow-xl transition-shadow duration-200"
                >
                  {/* Titel linksbündig */}
                  <h5 className="font-bold text-lg truncate mb-4 text-left text-gray-900">{survey.title}</h5>

                  {/* Info-Bereich - flex-grow sorgt dafür, dass dieser Bereich den verfügbaren Platz ausfüllt */}
                  <div className="flex flex-col gap-3 text-sm text-gray-600 flex-grow">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75" />
                      </svg>
                      <span>Erstellt: {formattedCreatedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className={isExpiringSoon ? "text-red-600 font-medium" : ""}>
                        Läuft ab: {formattedExpiresDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                      </svg>
                      <span>{survey.questions.length} {survey.questions.length === 1 ? 'Frage' : 'Fragen'}</span>
                    </div>

                    {/* Antworten-Count nur für aktive und beendete Umfragen anzeigen */}
                    {(survey.status === 'active' || survey.status === 'finished') && (
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <span>{survey.response_count || 0} {(survey.response_count || 0) === 1 ? 'Antwort' : 'Antworten'}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <span>Status:</span>
                      {survey.status === 'ready' ? 
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Bereit zum Start</span> : 
                        survey.status === 'active' ? 
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Gestartet</span> :
                        <span className="bg-red-100 text-red-500 px-2 py-1 rounded-full text-xs font-medium">Beendet</span>
                      }
                    </div>
                  </div>

                  {/* Aktions-Buttons - immer am unteren Rand der Card */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => startenBtn(survey.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                    >
                      Verwalten
                    </button>

                    <button
                      onClick={() => loeschenBtn(survey.id)}
                      className="w-full flex items-center justify-center gap-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg py-2 font-medium transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244 2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center pt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-500">Umfragen werden geladen...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex justify-center items-start pt-5">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 w-[800px] text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Fehler beim Laden</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog für das Löschen */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Umfrage löschen"
        message={`Bist du sicher, dass du die Umfrage "${confirmDialog.surveyTitle}" löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </div>
  );
};

export default DashboardScreen;
