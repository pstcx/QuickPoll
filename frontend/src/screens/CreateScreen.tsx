import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid";
import { createSurvey, type CreateSurveyData } from "../lib/api";
import ConfirmDialog from "./Components/ConfirmDialog";

type QuestionType = "text" | "single_choice" | "multiple_choice" | "rating" | "yes_no";

interface Question {
  id: string;
  title: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  description: string;
}

export default function CreateScreen() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State für Error Dialog
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    message: ""
  });

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: "",
      type,
      options: type === "single_choice" || type === "multiple_choice" ? ["", ""] : [],
      required: false,
      description: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, { 
        options: [...question.options, ""] 
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
      const newOptions = question.options.filter((_, idx) => idx !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const showError = (message: string) => {
    setErrorDialog({
      isOpen: true,
      message: message
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog({
      isOpen: false,
      message: ""
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showError("Bitte geben Sie einen Titel für die Umfrage ein.");
      return;
    }

    if (questions.length === 0) {
      showError("Bitte fügen Sie mindestens eine Frage hinzu.");
      return;
    }

    // Validierung der Fragen
    for (const question of questions) {
      if (!question.title.trim()) {
        showError("Bitte geben Sie für alle Fragen einen Titel ein.");
        return;
      }

      if ((question.type === "single_choice" || question.type === "multiple_choice") && 
          question.options.some(opt => !opt.trim())) {
        showError("Bitte füllen Sie alle Antwortoptionen aus oder entfernen Sie leere Optionen.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const surveyData: CreateSurveyData = {
        title: title.trim(),
        description: description.trim() || undefined,
        is_active: true,
        questions: questions.map((q) => ({
          title: q.title.trim(),
          type: q.type,
          options: (q.type === "single_choice" || q.type === "multiple_choice") 
            ? q.options.filter(opt => opt.trim()) 
            : undefined,
          required: q.required,
          description: q.description.trim() || undefined,
        }))
      };

      const newSurvey = await createSurvey(surveyData);
      console.log("Umfrage erfolgreich erstellt:", newSurvey);
      
      // Zurück zum Dashboard navigieren
      navigate('/my-polls');
    } catch (error) {
      console.error("Fehler beim Erstellen der Umfrage:", error);
      showError("Fehler beim Erstellen der Umfrage. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case "text": return "Freitext";
      case "single_choice": return "Einfachauswahl";
      case "multiple_choice": return "Mehrfachauswahl";
      case "rating": return "Bewertung";
      case "yes_no": return "Ja/Nein";
      default: return type;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-[#093a80]">
        Neue Umfrage erstellen
      </h2>

      {/* Umfrage-Titel */}
      <input
        className="border border-gray-300 p-2 w-full mb-4 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
        placeholder="Titel der Umfrage"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Beschreibung */}
      <textarea
        className="border border-gray-300 p-2 w-full mb-6 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
        placeholder="Beschreibung der Umfrage (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Fragen-Liste */}
      {questions.map((q, index) => (
        <div
          key={q.id}
          className="border border-gray-200 p-4 mb-4 rounded-md bg-white shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#093a80]">
              Frage {index + 1} - {getQuestionTypeLabel(q.type)}
            </span>
            <button
              type="button"
              className="text-gray-400 hover:text-red-500"
              onClick={() => removeQuestion(q.id)}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <input
            className="border border-gray-300 p-2 w-full mb-2 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
            placeholder="Fragetext"
            value={q.title}
            onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
          />

          <input
            className="border border-gray-300 p-2 w-full mb-3 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none text-sm"
            placeholder="Beschreibung (optional)"
            value={q.description}
            onChange={(e) => updateQuestion(q.id, { description: e.target.value })}
          />

          {(q.type === "single_choice" || q.type === "multiple_choice") && (
            <>
              {q.options.map((opt, i) => (
                <div key={i} className="relative group w-full mb-2">
                  <input
                    className="border border-gray-300 p-2 w-full rounded-md pr-10 focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(q.id, i, e.target.value)}
                  />

                  {/* Mülltonnen-Icon on Hover */}
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 hidden group-hover:block"
                      onClick={() => removeOption(q.id, i)}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="bg-[#093a80] text-white px-3 py-1 rounded-md mb-3 hover:bg-[#0b4a9f] transition"
                onClick={() => addOption(q.id)}
              >
                + Option hinzufügen
              </button>
            </>
          )}

          {/* Pflichtfeld Checkbox */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id={`required-${q.id}`}
              checked={q.required}
              onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
              className="w-4 h-4 accent-[#093a80] mr-2"
            />
            <label htmlFor={`required-${q.id}`} className="text-sm text-gray-700">
              Pflichtfeld
            </label>
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">Noch keine Fragen hinzugefügt</p>
          <p className="text-sm">Wählen Sie unten einen Fragentyp aus, um zu beginnen.</p>
        </div>
      )}

      {/* Neue Fragen hinzufügen */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#093a80] mb-3">Frage hinzufügen</h3>
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-gray-200 text-[#093a80] px-4 py-2 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
            onClick={() => addQuestion("single_choice")}
          >
            <span>◉</span> Einfachauswahl
          </button>
          <button
            className="bg-gray-200 text-[#093a80] px-4 py-2 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
            onClick={() => addQuestion("multiple_choice")}
          >
            <span>☑️</span> Mehrfachauswahl
          </button>
          <button
            className="bg-gray-200 text-[#093a80] px-4 py-2 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
            onClick={() => addQuestion("text")}
          >
            <span>📝</span> Freitext
          </button>
          <button
            className="bg-gray-200 text-[#093a80] px-4 py-2 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
            onClick={() => addQuestion("rating")}
          >
            <span>⭐</span> Bewertung
          </button>
          <button
            className="bg-gray-200 text-[#093a80] px-4 py-2 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
            onClick={() => addQuestion("yes_no")}
          >
            <span>✅</span> Ja/Nein
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="bg-gray-200 text-[#093a80] px-6 py-3 rounded-md flex-1 hover:bg-gray-300 transition"
          onClick={() => navigate('/my-polls')}
          disabled={isSubmitting}
        >
          Abbrechen
        </button>
        <button
          className="bg-[#093a80] text-white px-6 py-3 rounded-md flex-1 hover:bg-[#0b4a9f] transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird erstellt..." : "Umfrage erstellen"}
        </button>
      </div>

      {/* Error Dialog */}
      <ConfirmDialog
        isOpen={errorDialog.isOpen}
        title="Fehler"
        message={errorDialog.message}
        confirmText="OK"
        onConfirm={closeErrorDialog}
        onCancel={closeErrorDialog}
        variant="warning"
      />
    </div>
  );
}
