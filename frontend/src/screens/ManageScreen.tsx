import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Copy,
  Info,
  User,
  QrCode,
  Link,
  Play,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import QRCode from "react-qr-code";
import { getSurvey, updateSurveyStatus, type Survey } from "../lib/api";

const ManageScreen: React.FC = () => {
  const { id: pollId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (!pollId || pollId.length !== 4) {
      setError("Ungültige Poll-ID. Die ID muss genau 4 Zeichen lang sein.");
      setIsLoading(false);
      return;
    }

    loadSurvey();
  }, [pollId]);

  // ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQRModal) {
        setShowQRModal(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showQRModal]);

  const loadSurvey = async () => {
    if (!pollId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const surveyData = await getSurvey(pollId);
      setSurvey(surveyData);
      
      // If survey is already active or finished, redirect to result page
      if (surveyData.status === 'active' || surveyData.status === 'finished') {
        navigate(`/my-polls/${pollId}/result`);
        return;
      }
      
    } catch (error: any) {
      console.error('Error loading survey:', error);
      
      // Prüfe auf 403 Unauthorized Fehler
      if (error.message?.includes('403')) {
        setError("Du hast keine Berechtigung, auf diese Umfrage zuzugreifen. Du kannst nur deine eigenen Umfragen verwalten.");
      } else {
        setError("Poll nicht gefunden oder nicht verfügbar.");
      }
      setSurvey(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pollId || pollId.length !== 4) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">
            Fehler - Es wurde eine ungültige Poll-ID übergeben.
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">
            {error}
          </span>
        </div>
      </div>
    );
  }

  const pollNotFound = false;
  if (pollNotFound) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">
            Fehler - Die Poll mit der ID {pollId} existiert nicht oder ist nicht
            mehr verfügbar.
          </span>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Umfrage...</p>
        </div>
      </div>
    );
  }

  // Survey details for display
  const surveyDetails = {
    title: survey?.title || "Umfrage verwalten",
    directLink: `https://quick-poll-eta.vercel.app/poll/${pollId}`,
    pollId: pollId || "-",
  };
  
  const participants: never[] = [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyDetails.directLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStartSurvey = async () => {
    if (!survey || isLoading) return;
    
    try {
      setIsLoading(true);
      await updateSurveyStatus(survey.id, 'active');
      // Redirect to result page after starting
      navigate(`/my-polls/${survey.id}/result`);
    } catch (error) {
      console.error('Error starting survey:', error);
      setIsLoading(false);
    }
  };

  const handleQRClick = () => {
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* QR Code Modal */}
      {showQRModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeQRModal}
        >
          <div 
            className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeQRModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Modal schließen"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">QR-Code</h3>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                <QRCode value={surveyDetails.directLink} size={350} />
              </div>
              <p className="text-gray-600 mt-4 text-sm">
                Scanne den QR-Code mit deinem Smartphone, um direkt zur Umfrage zu gelangen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 scale-90 origin-top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                {surveyDetails.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-mono">
                  ID: {surveyDetails.pollId}
                </span>
                <p className="text-gray-600 flex items-center gap-2">
                  {survey?.status === 'active' ? (
                    <>
                      Live
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      • {participants.length} Teilnehmer
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Bereit zum Start - warten auf Teilnehmer...
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scale-90 origin-top">
        {/* Info Banner */}
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-blue-800 font-medium">
              Scanne den QR-Code oder nutze den direkten Link, um zur Umfrage zu
              gelangen.
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pb-7">
          <div className="grid lg:grid-cols-2 gap-7">
            {/* Left Column - QR Code Scanner */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  QR-Code scannen
                </h2>
              </div>

              {/* QR Code Area */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-7 mb-5 text-center border-2 border-dashed border-gray-200">
                <div 
                  className="w-56 h-56 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 relative group"
                  onClick={handleQRClick}
                  title="Klicke für Großansicht"
                >
                  <QRCode value={surveyDetails.directLink} />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Klicke für Großansicht
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-center leading-relaxed">
                Scanne den QR-Code mit deinem Smartphone, um direkt zur Umfrage
                zu gelangen.
              </p>
            </div>

            {/* Right Column - Survey Details */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Link className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Umfrage-Details
                </h2>
              </div>

              <div className="space-y-5">
                {/* Survey Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Umfragetitel
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <span className="font-semibold text-gray-800">
                      {surveyDetails.title}
                    </span>
                  </div>
                </div>

                {/* Direct Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Direkter Link
                  </label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <input
                      type="text"
                      value={surveyDetails.directLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-2 border-l border-gray-300 transition-colors duration-200 ${
                        copySuccess
                          ? "bg-green-100 text-green-600"
                          : "hover:bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {copySuccess && (
                    <p className="text-sm text-green-600 mt-1">Link kopiert!</p>
                  )}
                </div>

                {/* Poll ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Poll-ID
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <span className="font-mono text-gray-800">
                      {surveyDetails.pollId}
                    </span>
                  </div>
                </div>

                {/* Participants Status */}
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    {participants.length === 0 ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          Noch keine Teilnehmer...
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          {participants.length} Teilnehmer wart
                          {participants.length > 1 ? "en" : "et"}...
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleStartSurvey}
                  disabled={isLoading}
                  className={`w-full py-3 px-5 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lädt...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Poll starten
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageScreen;
