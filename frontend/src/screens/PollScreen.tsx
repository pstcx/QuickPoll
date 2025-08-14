import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getPublicSurvey, submitSurveyResponse, type Survey, type Question } from "../lib/api";

const PollScreen: React.FC = () => {
  const { id: pollId } = useParams<{ id: string }>();
  
  // State für API-Daten
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number | boolean | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Lade Umfragedaten beim Komponenten-Mount
  useEffect(() => {
    if (!pollId || pollId.length !== 4) {
      setError("Ungültige Poll-ID. Die ID muss genau 4 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    loadSurveyData();
  }, [pollId]);

  const loadSurveyData = async () => {
    if (!pollId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const surveyData = await getPublicSurvey(pollId);
      setSurvey(surveyData);
      
      // Initialisiere Antworten-Objekt für alle unterstützten Fragetypen
      const initialAnswers: Record<string, string | string[] | number | boolean | null> = {};
      surveyData.questions
        .filter(question => ['multiple_choice', 'text', 'single_choice', 'rating', 'yes_no'].includes(question.type))
        .forEach(question => {
          if (question.type === 'multiple_choice') {
            initialAnswers[question.id] = [];
          } else if (question.type === 'rating') {
            initialAnswers[question.id] = null;
          } else if (question.type === 'yes_no') {
            initialAnswers[question.id] = null;
          } else {
            initialAnswers[question.id] = '';
          }
        });
      setAnswers(initialAnswers);
      
    } catch (error) {
      console.error("Fehler beim Laden der Umfrage:", error);
      setError("Fehler beim Laden der Umfrage. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  // Validierung
  const validateForm = (): boolean => {
    if (!survey) return false;
    
    const supportedQuestions = survey.questions.filter(q => 
      ['multiple_choice', 'text', 'single_choice', 'rating', 'yes_no'].includes(q.type) && q.required
    );
    
    const unansweredRequired = supportedQuestions.filter((q) => {
      const answer = answers[q.id];
      if (q.type === 'multiple_choice') {
        return !Array.isArray(answer) || answer.length === 0;
      } else if (q.type === 'rating') {
        return answer === null || answer === undefined || answer === 0;
      } else if (q.type === 'yes_no') {
        return answer === null || answer === undefined;
      } else {
        return !answer || (typeof answer === "string" && answer.trim() === "");
      }
    });

    if (unansweredRequired.length > 0) {
      setErrorMessage(
        `Bitte beantworte alle Pflichtfragen. ${unansweredRequired.length} Frage(n) fehlen noch.`
      );
      return false;
    }

    setErrorMessage("");
    return true;
  };

  // Submit Logik
  const handleSubmit = async () => {
    if (!survey || !validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const submissions = Object.entries(answers)
        .filter(([_, answer]) => answer !== null && answer !== undefined)
        .map(([questionId, answer]) => ({
          question_id: questionId,
          answer: answer as string | string[] | number | boolean
        }));

      const responseData = {
        survey_id: survey.id,
        answers: submissions
      };

      await submitSurveyResponse(responseData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Fehler beim Senden der Antworten:", error);
      setErrorMessage("Fehler beim Senden der Antworten. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event Handler
  const handleMultipleChoiceChange = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSingleChoiceChange = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleFreeTextChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setAnswers(prev => {
      const currentRating = prev[questionId] as number | null;
      return {
        ...prev,
        [questionId]: currentRating === rating ? null : rating,
      };
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleYesNoChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  // Render-Funktionen für Fragetypen
  const renderMultipleChoiceQuestion = (question: Question, index: number) => (
    <div key={question.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
          {index + 1}
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          <CheckSquare className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 text-left">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
            {!question.required && (
              <span className="text-sm text-gray-500 font-normal ml-2">
                (optional)
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              📋 Mehrfachauswahl
            </span>
            <span className="text-xs text-gray-500">Du kannst mehrere Optionen auswählen</span>
          </div>
        </div>
      </div>
      {question.description && (
        <p className="text-gray-600 text-sm mb-4 ml-11">{question.description}</p>
      )}

      <div className="space-y-3 ml-11">
        {question.options?.map((option, optionIndex) => (
          <label
            key={optionIndex}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
          >
            <input
              type="checkbox"
              name={question.id}
              value={option}
              checked={Array.isArray(answers[question.id]) && (answers[question.id] as string[]).includes(option)}
              onChange={(e) => {
                const currentAnswers = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : [];
                if (e.target.checked) {
                  setAnswers(prev => ({ ...prev, [question.id]: [...currentAnswers, option] }));
                } else {
                  setAnswers(prev => ({ ...prev, [question.id]: currentAnswers.filter(a => a !== option) }));
                }
                if (errorMessage) setErrorMessage("");
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderTextQuestion = (question: Question, index: number) => (
    <div key={question.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
          {index + 1}
        </div>
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 text-left">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
          {!question.required && (
            <span className="text-sm text-gray-500 font-normal ml-2">
              (optional)
            </span>
          )}
        </h3>
      </div>
      {question.description && (
        <p className="text-gray-600 text-sm mb-4 ml-11">{question.description}</p>
      )}

      <div className="ml-11">
        <textarea
          value={(answers[question.id] as string) || ""}
          onChange={(e) => handleFreeTextChange(question.id, e.target.value)}
          placeholder="Deine Antwort hier eingeben..."
          rows={4}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
        />
      </div>
    </div>
  );

  const renderSingleChoiceQuestion = (question: Question, index: number) => (
    <div key={question.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
          {index + 1}
        </div>
        <div className="p-2 bg-purple-100 rounded-lg">
          <CheckSquare className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 text-left">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
            {!question.required && (
              <span className="text-sm text-gray-500 font-normal ml-2">
                (optional)
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
              ⚡ Einfachauswahl
            </span>
            <span className="text-xs text-gray-500">Du kannst nur eine Option auswählen</span>
          </div>
        </div>
      </div>
      {question.description && (
        <p className="text-gray-600 text-sm mb-4 ml-11">{question.description}</p>
      )}

      <div className="space-y-3 ml-11">
        {question.options?.map((option, optionIndex) => (
          <label
            key={optionIndex}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 cursor-pointer transition-colors duration-200"
          >
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={answers[question.id] === option}
              onChange={() => handleSingleChoiceChange(question.id, option)}
              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderRatingQuestion = (question: Question, index: number) => (
    <div key={question.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
          {index + 1}
        </div>
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Star className="w-5 h-5 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 text-left">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
          {!question.required && (
            <span className="text-sm text-gray-500 font-normal ml-2">
              (optional)
            </span>
          )}
        </h3>
      </div>
      {question.description && (
        <p className="text-gray-600 text-sm mb-4 ml-11">{question.description}</p>
      )}

      <div className="ml-11">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(question.id, rating)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-semibold transition-all hover:scale-110 ${
                (answers[question.id] as number | null) !== null && (answers[question.id] as number) >= rating
                  ? 'border-yellow-500 bg-yellow-500 text-white shadow-lg'
                  : 'border-gray-300 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50'
              }`}
            >
              <Star className={`w-8 h-8 ${(answers[question.id] as number | null) !== null && (answers[question.id] as number) >= rating ? 'fill-current' : ''}`} />
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Sehr schlecht</span>
          <span>Sehr gut</span>
        </div>
        
        {answers[question.id] !== null && answers[question.id] !== undefined && (answers[question.id] as number) > 0 && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {answers[question.id]} von 5 Sternen
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderYesNoQuestion = (question: Question, index: number) => (
    <div key={question.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
          {index + 1}
        </div>
        <div className="p-2 bg-indigo-100 rounded-lg">
          <CheckSquare className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 text-left">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
          {!question.required && (
            <span className="text-sm text-gray-500 font-normal ml-2">
              (optional)
            </span>
          )}
        </h3>
      </div>
      {question.description && (
        <p className="text-gray-600 text-sm mb-4 ml-11">{question.description}</p>
      )}

      <div className="ml-11">
        <div className="flex gap-4 justify-center">
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all min-w-[120px] justify-center ${
            answers[question.id] === true 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
          }`}>
            <input
              type="radio"
              name={question.id}
              value="true"
              checked={answers[question.id] === true}
              onChange={() => handleYesNoChange(question.id, true)}
              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <ThumbsUp className={`w-5 h-5 ${answers[question.id] === true ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${answers[question.id] === true ? 'text-green-800' : 'text-gray-700'}`}>
              Ja
            </span>
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all min-w-[120px] justify-center ${
            answers[question.id] === false 
              ? 'border-red-500 bg-red-50 shadow-md' 
              : 'border-gray-200 hover:border-red-400 hover:bg-red-50'
          }`}>
            <input
              type="radio"
              name={question.id}
              value="false"
              checked={answers[question.id] === false}
              onChange={() => handleYesNoChange(question.id, false)}
              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <ThumbsDown className={`w-5 h-5 ${answers[question.id] === false ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`font-medium ${answers[question.id] === false ? 'text-red-800' : 'text-gray-700'}`}>
              Nein
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Umfrage wird geladen...</h2>
          <p className="text-gray-600">Bitte warte einen Moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">{error}</span>
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
            Umfrage nicht gefunden oder nicht verfügbar.
          </span>
        </div>
      </div>
    );
  }

  // Waiting room (survey not started)
  if (survey.status === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="text-gray-600 text-center">{survey.description}</p>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Du bist im Warteraum
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Die Umfrage wurde noch nicht gestartet. Du bist erfolgreich beigetreten 
              und wirst automatisch weitergeleitet, sobald die Umfrage beginnt.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-blue-800 font-semibold">
                  Poll-ID: {pollId}
                </span>
              </div>
              <span className="text-blue-800 font-semibold">
                  Teilnehmer im Warteraum: 1
                </span>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              {/* Deutlich sichtbarer Spinner für Warteraum */}
              <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              <span className="text-yellow-800 font-medium">
                Warten auf Start durch den Moderator
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Survey finished
  if (survey.status === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Umfrage beendet</h2>
          <p className="text-gray-600">
            Diese Umfrage ist bereits beendet und nimmt keine weiteren Antworten mehr entgegen.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vielen Dank!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Deine Antworten wurden erfolgreich übermittelt.
          </p>
          <p className="mt-2 text-gray-500">Du kannst dieses Fenster jetzt schließen.</p>
        </div>
      </div>
    );
  }

  // Filter für alle unterstützten Fragetypen
  const supportedQuestions = survey.questions
    .filter(q => ['multiple_choice', 'text', 'single_choice', 'rating', 'yes_no'].includes(q.type))
    .sort((a, b) => a.order - b.order);

  const unsupportedCount = survey.questions.length - supportedQuestions.length;

  // Main survey form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-gray-600 text-center mb-4">{survey.description}</p>
          )}
          <div className="text-center">
            <p className="text-gray-600">
              {supportedQuestions.length} Frage{supportedQuestions.length !== 1 ? "n" : ""} • 
              {" "}{supportedQuestions.filter((q) => q.required).length} davon Pflichtfragen
            </p>
            {unsupportedCount > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ {unsupportedCount} Frage(n) werden in dieser Version noch nicht unterstützt
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {supportedQuestions.map((question, index) => {
            if (question.type === 'multiple_choice') {
              return renderMultipleChoiceQuestion(question, index);
            } else if (question.type === 'text') {
              return renderTextQuestion(question, index);
            } else if (question.type === 'single_choice') {
              return renderSingleChoiceQuestion(question, index);
            } else if (question.type === 'rating') {
              return renderRatingQuestion(question, index);
            } else if (question.type === 'yes_no') {
              return renderYesNoQuestion(question, index);
            }
            return null;
          })}

          {/* Submit Button */}
          <div className="flex flex-col items-center pt-6">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-4 w-full">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center gap-3 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird übermittelt...
                </>
              ) : (
                "Antworten abschicken"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollScreen;
