import React, { useState } from 'react';
import { CheckSquare, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  id: string;
  title: string;
  options: string[];
  required: boolean;
}

interface FreeTextQuestion {
  type: 'free-text';
  id: string;
  title: string;
  placeholder: string;
  required: boolean;
}

type Question = MultipleChoiceQuestion | FreeTextQuestion;

const PollScreen: React.FC = () => {
    const { id: pollId } = useParams<{ id: string }>();

    if(!pollId || pollId.length !== 4) {
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
      )
   }
   
       if(!pollId || pollId.length !== 4) {
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
         )
      }

    const pollNotFound = false;
    if(pollNotFound) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-5 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium">
              Fehler - Die Poll mit der ID {pollId} existiert nicht oder ist nicht mehr verfügbar.
            </span>
          </div>
        </div>
    )
  }



  //If poll not started, show waiting screen
  // Sample poll data
  const pollTitle = "Kundenzufriedenheit Q3 2024";
  const pollStarted = true; // This should come from API/state
  const waitingParticipants = 3; // This should come from API/state
  
  if (!pollStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
              {pollTitle}
            </h1>
            <p className="text-gray-600 text-center">
              Erstellt von Pascal vor 2 Minuten
            </p>
          </div>
        </div>

        {/* Waiting Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl p-8 text-center">
            {/* Waiting Animation */}
            <div className="w-14 h-14 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Du bist im Warteraum
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Die Poll wurde noch nicht vom Ersteller gestartet. 
              Du bist erfolgreich beigetreten und wirst automatisch weitergeleitet, 
              sobald die Poll beginnt.
            </p>
            
            {/* Participants Counter */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-blue-800 font-semibold">
                  {waitingParticipants} {waitingParticipants === 1 ? 'weiterer Teilnehmer' : 'weitere Teilnehmer'} bisher
                </span>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="text-sm text-gray-500">
              <p>💡 Tipp: Lasse diese Seite geöffnet - du wirst automatisch weitergeleitet!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample poll data - questions
  const questions: Question[] = [
    {
      type: 'multiple-choice',
      id: '1',
      title: 'Wie bewertest du unseren Service?',
      options: ['Sehr gut', 'Gut', 'Befriedigend', 'Schlecht'],
      required: true
    },
    {
      type: 'free-text',
      id: '2',
      title: 'Was können wir verbessern?',
      placeholder: 'Gib deine Antwort hier ein...',
      required: false
    },
    {
      type: 'multiple-choice',
      id: '3',
      title: 'Welches Feature nutzt du am häufigsten?',
      options: ['Dashboard', 'Reports', 'Analytics', 'Settings'],
      required: true
    },
    {
      type: 'free-text',
      id: '4',
      title: 'Weitere Kommentare',
      placeholder: 'Deine zusätzlichen Kommentare...',
      required: false
    }
  ];

  const handleMultipleChoiceChange = (questionId: string, option: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: option
    };
    setAnswers(newAnswers);
    
    // Update error message with new answers
    updateErrorMessage(newAnswers);
  };

  const handleFreeTextChange = (questionId: string, value: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    setAnswers(newAnswers);
    
    // Update error message with new answers
    updateErrorMessage(newAnswers);
  };

  const updateErrorMessage = (currentAnswers = answers) => {
    const requiredQuestions = questions.filter(q => q.required);
    const unansweredRequired = requiredQuestions.filter(q => {
      const answer = currentAnswers[q.id];
      return !answer || (typeof answer === 'string' && answer.trim() === '');
    });

    if (unansweredRequired.length > 0 && errorMessage) {
      // Only update if there was already an error message showing
      setErrorMessage(`Bitte beantworte alle Pflichtfragen. ${unansweredRequired.length} Frage(n) fehlen noch.`);
    } else if (unansweredRequired.length === 0) {
      // Clear error message if all required questions are answered
      setErrorMessage('');
    }
  };

  const validateForm = (): boolean => {
    const requiredQuestions = questions.filter(q => q.required);
    const unansweredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return !answer || (typeof answer === 'string' && answer.trim() === '');
    });

    if (unansweredRequired.length > 0) {
      setErrorMessage(`Bitte beantworte alle Pflichtfragen. ${unansweredRequired.length} Frage(n) fehlen noch.`);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const renderMultipleChoice = (question: MultipleChoiceQuestion) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {question.title}
            {!question.required && (
              <span className="text-sm text-gray-500 font-normal ml-2">(optional)</span>
            )}
          </h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => handleMultipleChoiceChange(question.id, option)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderFreeText = (question: FreeTextQuestion) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {question.title}
            {!question.required && (
              <span className="text-sm text-gray-500 font-normal ml-2">(optional)</span>
            )}
          </h3>
        </div>

        <textarea
          value={answers[question.id] || ''}
          onChange={(e) => handleFreeTextChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
        />
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vielen Dank!</h2>
          <p className="text-gray-600 leading-relaxed">
            Deine Antwort(en) wurden erfolgreich abgegeben und werden dem Umfrageersteller in Kürze mitgeteilt.
          </p>
          <p className='mt-2'>Du kannst dieses Fenster jetzt schließen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            {pollTitle}
          </h1>
          <p className="text-gray-600 text-center">
            {questions.length} Frage{questions.length !== 1 ? 'n' : ''} • {questions.filter(q => q.required).length} davon Pflichtfragen
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="h-px bg-gradient-to-r from-blue-200 to-transparent flex-1" />
              </div>
              
              {question.type === 'multiple-choice' 
                ? renderMultipleChoice(question)
                : renderFreeText(question)
              }
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex flex-col items-center pt-6">
            {/* Error Message - closer to button */}
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
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Wird übermittelt...
                </>
              ) : (
                'Antworten abgeben'
              )}
            </button>
          </div>
        </div>
      </div>

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
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default PollScreen;