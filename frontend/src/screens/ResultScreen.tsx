import React, { useState, useEffect } from "react";
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

interface MultipleChoiceOption {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface MultipleChoiceQuestion {
  type: "multiple-choice";
  id: string;
  title: string;
  options: MultipleChoiceOption[];
  totalResponses: number;
}

interface FreeTextQuestion {
  type: "free-text";
  id: string;
  title: string;
  responses: string[];
}

type Question = MultipleChoiceQuestion | FreeTextQuestion;

const ResultScreen: React.FC = () => {
  const { id: pollId } = useParams<{ id: string }>();

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

  const [isAnimating, setIsAnimating] = useState(true);
  const [isEndingPoll, setIsEndingPoll] = useState(false);
  const [isPollEnded, setIsPollEnded] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Trigger chart animations after component mounts
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleExportResults = () => {
    if (!isPollEnded) {
      setShowExportModal(true);
    } else {
      alert("Ergebnisse werden exportiert...");
    }
  };

  const confirmExport = () => {
    setShowExportModal(false);
    alert("Ergebnisse werden exportiert...");
  };

  const cancelExport = () => {
    setShowExportModal(false);
  };

  const handleEndPoll = () => {
    setIsEndingPoll(true);
    setTimeout(() => {
      setIsEndingPoll(false);
      setIsPollEnded(true);
    }, 1000);
  };
  // Sample data
  const surveyData: Question[] = [
    {
      type: "multiple-choice",
      id: "1",
      title: "Wie bewerten Sie unseren Service?",
      totalResponses: 150,
      options: [
        {
          label: "Sehr gut",
          count: 85,
          percentage: 57,
          color: "bg-emerald-500",
        },
        { label: "Gut", count: 45, percentage: 30, color: "bg-blue-500" },
        {
          label: "Befriedigend",
          count: 15,
          percentage: 10,
          color: "bg-yellow-500",
        },
        { label: "Schlecht", count: 5, percentage: 3, color: "bg-red-500" },
      ],
    },
    {
      type: "multiple-choice",
      id: "2",
      title: "Welches Feature nutzen Sie am häufigsten?",
      totalResponses: 120,
      options: [
        {
          label: "Dashboard",
          count: 60,
          percentage: 50,
          color: "bg-purple-500",
        },
        { label: "Reports", count: 36, percentage: 30, color: "bg-indigo-500" },
        { label: "Analytics", count: 24, percentage: 20, color: "bg-pink-500" },
      ],
    },
    {
      type: "free-text",
      id: "3",
      title: "Was können wir verbessern?",
      responses: [
        "Die Ladezeiten könnten schneller sein. Manchmal dauert es zu lange, bis die Daten geladen sind.",
        "Mehr Anpassungsmöglichkeiten im Dashboard wären super. Ich würde gerne die Widgets verschieben können.",
        "Ein Dark Mode wäre toll für die Nutzung am Abend.",
        "Die mobile App könnte mehr Features haben, die auch in der Desktop-Version verfügbar sind.",
      ],
    },
    {
      type: "free-text",
      id: "4",
      title: "Weitere Kommentare",
      responses: [
        "Insgesamt bin ich sehr zufrieden mit der Plattform. Das Team ist sehr hilfsbereit.",
        "Die neuen Features sind großartig, besonders die automatischen Berichte.",
      ],
    },
  ];

  const totalParticipants = 150;
  const pollTitle = "Kundenzufriedenheit Q3 2024";

  const renderMultipleChoice = (question: MultipleChoiceQuestion) => {
    const maxCount = Math.max(...question.options.map((opt) => opt.count));

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {question.title}
          </h3>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="relative h-48 flex items-end justify-center gap-8">
              {question.options.map((option, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {option.count}
                  </div>
                  <div
                    className={`${option.color} rounded-t-md transition-all duration-1000 ease-out hover:opacity-80 transform origin-bottom`}
                    style={{
                      height: isAnimating
                        ? "0px"
                        : `${(option.count / maxCount) * 160}px`,
                      width: "60px",
                      minHeight: isAnimating ? "0px" : "20px",
                      transitionDelay: `${index * 200}ms`,
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-2 text-center max-w-16">
                    {option.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${option.color}`} />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {option.count}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${option.color} transition-all duration-1000 ease-out`}
                      style={{
                        width: isAnimating ? "0%" : `${option.percentage}%`,
                        transitionDelay: `${index * 200 + 500}ms`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">
                    {option.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {question.totalResponses} Antworten
        </div>
      </div>
    );
  };

  const renderFreeText = (question: FreeTextQuestion) => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {question.title}
          </h3>
        </div>

        <div className="space-y-4">
          {question.responses.map((response, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-400 hover:bg-gray-100 transition-colors duration-200"
            >
              <p className="text-gray-700 leading-relaxed">{response}</p>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 flex items-center gap-2 mt-4">
          <MessageSquare className="w-4 h-4" />
          {question.responses.length} Antworten
        </div>
      </div>
    );
  };

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
                  {pollTitle}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-mono">
                  ID: {pollId}
                </span>
                <p className="text-gray-600 flex items-center gap-2">
                  {isPollEnded ? (
                    <>
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Umfrage beendet • {totalParticipants} Teilnehmer
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Live • {totalParticipants} Teilnehmer
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportResults}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  isPollEnded
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Ergebnisse exportieren
              </button>
              {!isPollEnded && (
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
          {surveyData.map((question, index) => (
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

              {question.type === "multiple-choice"
                ? renderMultipleChoice(question)
                : renderFreeText(question)}
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
