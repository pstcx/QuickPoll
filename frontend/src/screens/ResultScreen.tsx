import React, { useState, useEffect } from "react";
import {
  BarChart3,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Star,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getSurvey, getSurveyResponses, updateSurveyStatus, exportSurveyToExcel, type Survey, type Question, type Response } from "../lib/api";
import { useWebSocketStable as useWebSocket, type WebSocketMessage } from "../hooks/useWebSocketStable";

// Process response data for different question types
interface ProcessedQuestion {
  id: string;
  title: string;
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'yes_no';
  totalResponses: number;
  data: any; // Different data structure based on type
}

const ResultScreen: React.FC = () => {
  const { id: pollId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [processedQuestions, setProcessedQuestions] = useState<ProcessedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEndingPoll, setIsEndingPoll] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState(0);

  // WebSocket für Live-Updates
  const { isConnected, sendMessage } = useWebSocket({
    surveyId: pollId && pollId !== 'undefined' ? pollId : null,
    role: 'host',
    onMessage: (message: WebSocketMessage) => {
      switch (message.type) {
        case 'response_submitted':
          // Neue Antwort erhalten - Daten neu laden
          loadResponsesData();
          break;
        case 'participant_joined':
        case 'participant_left':
          setWaitingParticipants(message.waiting_count || 0);
          break;
        case 'initial_stats':
          setWaitingParticipants(message.waiting_count || 0);
          break;
      }
    },
    enabled: true
  });

  useEffect(() => {
    if (!pollId || pollId.length !== 4) {
      setError("Ungültige Poll-ID. Die ID muss genau 4 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    loadSurveyData();
  }, [pollId]);

  // Auto-update processed questions when responses or survey data changes for live chart updates
  useEffect(() => {
    if (survey && responses) {
      const processed = processQuestionData(survey.questions, responses);
      setProcessedQuestions(processed);
    }
  }, [survey, responses]);

  const loadResponsesData = async () => {
    if (!pollId) {
      return;
    }
    
    try {
      const responseData = await getSurveyResponses(pollId);
      setResponses(responseData);
      // processedQuestions will be automatically updated via useEffect
    } catch (error) {
      console.error("Fehler beim Laden der Antworten:", error);
    }
  };

  const loadSurveyData = async () => {
    if (!pollId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [surveyData, responseData] = await Promise.all([
        getSurvey(pollId),
        getSurveyResponses(pollId)
      ]);
      
      setSurvey(surveyData);
      setResponses(responseData);
      
      // Wenn Umfrage noch im Status "ready" ist, zum ManageScreen weiterleiten
      if (surveyData.status === 'ready') {
        navigate(`/my-polls/${pollId}`);
        return;
      }
      
      // Process question data for visualization
      const processed = processQuestionData(surveyData.questions, responseData);
      setProcessedQuestions(processed);
      
    } catch (error: any) {
      console.error('Error loading survey data:', error);
      
      // Prüfe auf 403 Unauthorized Fehler
      if (error.message?.includes('403')) {
        setError("Du hast keine Berechtigung, auf diese Umfrage zuzugreifen. Du kannst nur deine eigenen Umfragen einsehen.");
      } else {
        setError("Poll nicht gefunden oder nicht verfügbar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Process responses for each question type
  const processQuestionData = (questions: Question[], responses: Response[]): ProcessedQuestion[] => {
    return questions.map(question => {
      const questionResponses = responses.flatMap(response => 
        response.answers.filter(answer => answer.question_id === question.id)
      );

      const processedQuestion: ProcessedQuestion = {
        id: question.id,
        title: question.title,
        type: question.type,
        totalResponses: questionResponses.length,
        data: null
      };

      switch (question.type) {
        case 'single_choice':
        case 'multiple_choice':
          const optionCounts: { [key: string]: number } = {};
          question.options?.forEach(option => {
            optionCounts[option] = 0;
          });

          questionResponses.forEach(response => {
            if (question.type === 'single_choice') {
              const answer = response.answer as string;
              if (optionCounts.hasOwnProperty(answer)) {
                optionCounts[answer]++;
              }
            } else {
              const answers = response.answer as string[];
              answers.forEach(answer => {
                if (optionCounts.hasOwnProperty(answer)) {
                  optionCounts[answer]++;
                }
              });
            }
          });

          processedQuestion.data = Object.entries(optionCounts).map(([option, count]) => ({
            label: option,
            count,
            percentage: questionResponses.length > 0 ? Math.round((count / questionResponses.length) * 100) : 0
          }));
          break;

        case 'rating':
          const ratingCounts: { [key: number]: number } = {};
          for (let i = 1; i <= 5; i++) {
            ratingCounts[i] = 0;
          }

          questionResponses.forEach(response => {
            const rating = response.answer as number;
            if (ratingCounts.hasOwnProperty(rating)) {
              ratingCounts[rating]++;
            }
          });

          const average = questionResponses.length > 0 
            ? questionResponses.reduce((sum, response) => sum + (response.answer as number), 0) / questionResponses.length
            : 0;

          processedQuestion.data = {
            ratings: Object.entries(ratingCounts).map(([rating, count]) => ({
              rating: parseInt(rating),
              count,
              percentage: questionResponses.length > 0 ? Math.round((count / questionResponses.length) * 100) : 0
            })),
            average: Math.round(average * 10) / 10
          };
          break;

        case 'yes_no':
          const yesCount = questionResponses.filter(response => response.answer === true).length;
          const noCount = questionResponses.filter(response => response.answer === false).length;
          
          processedQuestion.data = [
            {
              label: 'Ja',
              count: yesCount,
              percentage: questionResponses.length > 0 ? Math.round((yesCount / questionResponses.length) * 100) : 0
            },
            {
              label: 'Nein',
              count: noCount,
              percentage: questionResponses.length > 0 ? Math.round((noCount / questionResponses.length) * 100) : 0
            }
          ];
          break;

        case 'text':
          processedQuestion.data = questionResponses.map(response => response.answer as string);
          break;
      }

      return processedQuestion;
    });
  };

  if (!pollId || pollId.length !== 4) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">
            Ungültige Poll-ID. Die ID muss genau 4 Zeichen lang sein.
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Umfrageergebnisse...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">
            Umfrage nicht gefunden.
          </span>
        </div>
      </div>
    );
  }

  const handleEndPoll = async () => {
    if (!survey) return;
    
    try {
      setIsEndingPoll(true);
      
      // WebSocket-Nachricht senden (wird zu allen Teilnehmern weitergeleitet)
      sendMessage({
        type: 'end_survey',
        survey_id: survey.id
      });
      
      // Fallback: Auch über API Status ändern
      await updateSurveyStatus(survey.id, 'finished');
      await loadSurveyData(); // Reload to get updated status
    } catch (error) {
      console.error('Error ending poll:', error);
    } finally {
      setIsEndingPoll(false);
    }
  };

  const handleExportResults = () => {
    if (survey?.status === 'active') {
      setShowExportModal(true);
    } else {
      confirmExport();
    }
  };

  const confirmExport = async () => {
    if (!pollId || !survey) return;
    
    setShowExportModal(false);
    setIsExporting(true);
    
    try {
      // Excel-Datei vom Backend abrufen
      const blob = await exportSurveyToExcel(pollId);
      
      // Download-Link erstellen
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PollExport_${survey.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download starten
      document.body.appendChild(link);
      link.click();
      
      // Aufräumen
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export fehlgeschlagen:', error);
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
    }
  };

  const cancelExport = () => {
    setShowExportModal(false);
  };

  // Rendering functions for different question types
  const renderChoiceQuestion = (question: ProcessedQuestion) => {
    const maxCount = Math.max(...question.data.map((opt: any) => opt.count));
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {question.title}
            </h3>
            <p className="text-sm text-gray-600">
              {question.totalResponses} Antwort{question.totalResponses !== 1 ? 'en' : ''}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {question.data.map((option: any, index: number) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-700">
                {option.label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`${colors[index % colors.length]} h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                  style={{
                    width: `${maxCount > 0 ? (option.count / maxCount) * 100 : 0}%`,
                    minWidth: option.count > 0 ? "40px" : "0px",
                  }}
                >
                  <span className="text-white text-xs font-semibold">
                    {option.count}
                  </span>
                </div>
              </div>
              <div className="w-12 text-sm font-semibold text-gray-600">
                {option.percentage}%
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Gesamt: {question.totalResponses} Antworten</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRatingQuestion = (question: ProcessedQuestion) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {question.title}
            </h3>
            <p className="text-sm text-gray-600">
              {question.totalResponses} Bewertung{question.totalResponses !== 1 ? 'en' : ''} • 
              Durchschnitt: {question.data.average}/5
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {question.data.ratings.map((rating: any) => (
            <div key={rating.rating} className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(rating.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - rating.rating)].map((_, i) => (
                  <Star key={i + rating.rating} className="w-4 h-4 text-gray-300" />
                ))}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-yellow-500 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${rating.percentage}%`,
                    minWidth: rating.count > 0 ? "30px" : "0px",
                  }}
                >
                  <span className="text-white text-xs font-semibold">
                    {rating.count}
                  </span>
                </div>
              </div>
              <div className="w-12 text-sm font-semibold text-gray-600">
                {rating.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTextQuestion = (question: ProcessedQuestion) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {question.title}
            </h3>
            <p className="text-sm text-gray-600">
              {question.totalResponses} Antwort{question.totalResponses !== 1 ? 'en' : ''}
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {question.data.length === 0 ? (
            <p className="text-gray-500 italic">Noch keine Antworten</p>
          ) : (
            question.data.map((response: string, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-700">{response || "Keine Antwort"}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderQuestion = (question: ProcessedQuestion) => {
    switch (question.type) {
      case 'single_choice':
      case 'multiple_choice':
      case 'yes_no':
        return renderChoiceQuestion(question);
      case 'rating':
        return renderRatingQuestion(question);
      case 'text':
        return renderTextQuestion(question);
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Umfrage wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Umfrage nicht gefunden</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  {survey?.title || "Umfrage"}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-mono">
                  ID: {pollId}
                </span>
                <p className="text-gray-600 flex items-center gap-2">
                  {survey?.status === 'finished' ? (
                    <>
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Umfrage beendet • {responses.length} Antworten
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Live • {waitingParticipants} Teilnehmer aktiv • {responses.length} Antworten
                    </>
                  )}
                  {/* WebSocket Status - nur bei aktiven Umfragen anzeigen */}
                  {survey?.status !== 'finished' && (
                    isConnected ? (
                      <span title="Live-Verbindung aktiv">
                        <Wifi className="w-4 h-4 text-green-500" />
                      </span>
                    ) : (
                      <span title="Verbindung unterbrochen">
                        <WifiOff className="w-4 h-4 text-red-500" />
                      </span>
                    )
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportResults}
                disabled={isExporting}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  isExporting
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exportiere...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Ergebnisse exportieren
                  </>
                )}
              </button>
              {survey?.status === 'active' && (
                <button
                  onClick={handleEndPoll}
                  disabled={isEndingPoll}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                    isEndingPoll
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isEndingPoll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Beende...
                    </>
                  ) : (
                    "Poll beenden"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {processedQuestions.map((question, index) => (
            <div
              key={question.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="h-px bg-gradient-to-r from-blue-200 to-transparent flex-1" />
              </div>

              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-out animate-modal-enter">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Bist du dir sicher?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Willst du wirklich schon die Ergebnisse exportieren, bevor die
              Poll beendet wurde?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelExport}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmExport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ResultScreen;
