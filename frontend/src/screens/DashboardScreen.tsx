import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSurveys, deleteSurvey, type Survey } from '../lib/api';
import ConfirmDialog from './Components/ConfirmDialog';
// Importiere das Bild für den QR-Code
import qrCodePlatzhalter from '../assets/qr_code_platzhalter.png'; // Pfad ggf. anpassen

const DashboardScreen = () => {
  const navigate = useNavigate();

  // State fürs Öffnen/Schließen des Modals
  const [modalOpen, setModalOpen] = useState(false);
  
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

  // Funktion zum Öffnen des Modals
  const openModal = () => {
    setModalOpen(true);
  };

  // Funktion zum Schließen des Modals
  const closeModal = () => {
    setModalOpen(false);
  };

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
    navigate(`/my-polls/${surveyId}`);
  };

  const ergebnisseBtn = (surveyId: string) => {
    navigate(`/my-polls/${surveyId}/result`);
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
    <div className="relative bg-gray-50 min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-teal-700">Meine Umfragen</h2>
      </div>

      {!hasSurveys && !loading && !error && (
        <div className="flex justify-center items-start pt-5">
          <div className="bg-white rounded-lg shadow-sm p-12 w-[800px] flex flex-col gap-8 items-center">
            <h3 className="text-2xl font-semibold text-gray-900 text-center">
              Keine Umfragen vorhanden
            </h3>
            <p className="text-gray-500 text-base text-center">
              Es wurden keine Umfragen gefunden
            </p>
            <button
              onClick={createFirstPoll}
              className="bg-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Erste Umfrage erstellen
            </button>
          </div>
        </div>
      )}

      {hasSurveys && !loading && (
        <div className="flex flex-col items-center">
          <div className="flex justify-between items-center my-5 w-full max-w-[1200px] px-5">
            <h4 className="text-[1.1rem] text-gray-500 font-normal">
              Verwalten Sie Ihre erstellten Umfragen
            </h4>
            <button
              onClick={createFirstPoll}
              className="bg-blue-600 text-white font-semibold text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Neue Umfrage erstellen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] w-full px-5 mb-10">
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
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
                >
                  {/* Titel linksbündig */}
                  <h5 className="font-bold text-lg truncate mb-4 text-left">{survey.title}</h5>

                  {/* Info und QR-Code 60/40 Aufteilung */}
                  <div className="flex gap-4">
                    {/* Linke Spalte – 60% */}
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
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
                        <span>{survey.questions.length} Fragen</span>
                      </div>

                      <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded inline-block text-left">
                        ID: {survey.id}
                      </div>
                    </div>

                  {/* Rechte Spalte – 40% */}
                  <div 
                    className="flex items-center justify-center cursor-pointer" 
                    onClick={openModal} 
                    aria-label="QR-Code vergrößern"
                  >
                    <img
                      src={qrCodePlatzhalter}
                      alt="QR-Code"
                      className="mx-[20px] w-[90px] h-[90px] rounded object-contain"
                    />
                  </div>
                </div>

                  {/* Aktions-Buttons */}
                  <div className="flex gap-3 mt-6 mb-3">
                    <button
                      onClick={() => startenBtn(survey.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded transition-colors font-semibold"
                    >
                      Verwalten
                    </button>
                    <button
                      onClick={() => ergebnisseBtn(survey.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded transition-colors font-semibold"
                    >
                      Ergebnisse
                    </button>
                  </div>

                  <button
                    onClick={() => loeschenBtn(survey.id)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg py-2 text-xs font-medium transition-all duration-200 hover:text-rose-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Löschen
                  </button>
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

      {/* Modal für vergrößertes Bild */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeModal} // Klick auf Overlay schließt Modal
        >
          <div
            className="relative bg-gray-50 p-4 rounded max-w-[80vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()} // Klick INS Modal nicht schließen
          >
            <button
              onClick={closeModal}
              className="absolute top-1 right-1 bg-gray-200 hover:bg-gray-300 font-bold text-sm"
              aria-label="Schließen"
            >
              &times;
            </button>
            <img
              src={qrCodePlatzhalter}
              alt="Vergrößerter QR-Code"
              className="max-w-full max-h-[70vh] object-contain"
            />
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
