import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";

type QuestionType = "multiple" | "text";

interface Question {
  id: number;
  type: QuestionType;
  questionText: string;
  allowMultiple?: boolean;
  options?: string[];
  maxWords?: number;
}

export default function SurveyCreator() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now(),
      type,
      questionText: "",
      ...(type === "multiple"
        ? { options: ["", ""], allowMultiple: false }
        : { maxWords: 50 }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // const removeOption = (questionId: string, optionIndex: number) => {
  //   setQuestions((prev) =>
  //     prev.map((q) =>
  //       q.id === questionId
  //         ? {
  //             ...q,
  //             options: q.options?.filter((_, idx) => idx !== optionIndex),
  //           }
  //         : q
  //     )
  //   );
  // };

  const handleSubmit = () => {
    console.log("Umfrage erstellt:", { title, questions });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-[#093a80]">
        Neue Umfrage erstellen
      </h2>

      {/* Umfrage-Titel */}
      <input
        className="border border-gray-300 p-2 w-full mb-6 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
        placeholder="Titel der Umfrage"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Fragen-Liste */}
      {questions.map((q) => (
        <div
          key={q.id}
          className="border border-gray-200 p-4 mb-4 rounded-md bg-white shadow-sm"
        >
          <input
            className="border border-gray-300 p-2 w-full mb-2 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
            placeholder="Fragetext"
            value={q.questionText}
            onChange={(e) =>
              updateQuestion(q.id, { questionText: e.target.value })
            }
          />

          {q.type === "multiple" && (
            <>
              {q.options?.map((opt, i) => (
                <div key={i} className="relative group w-full mb-2">
                  <input
                    className="border border-gray-300 p-2 w-full rounded-md pr-10
               focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(q.options || [])];
                      newOpts[i] = e.target.value;
                      updateQuestion(q.id, { options: newOpts });
                    }}
                  />

                  {/* Mülltonnen-Icon on Hover */}
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 
               hover:text-red-500 hidden group-hover:block"
                    onClick={() => {
                      const newOpts =
                        q.options?.filter((_, idx) => idx !== i) || [];
                      updateQuestion(q.id, { options: newOpts });
                    }}
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                className="bg-[#093a80] text-white px-3 py-1 rounded-md mb-3 hover:bg-[#0b4a9f] transition"
                onClick={() =>
                  updateQuestion(q.id, { options: [...(q.options || []), ""] })
                }
              >
                + Option hinzufügen
              </button>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={q.allowMultiple || false}
                    onChange={(e) =>
                      updateQuestion(q.id, { allowMultiple: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#093a80]"
                  />
                  Mehrere Antworten erlauben
                </label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => removeQuestion(q.id)}
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </>
          )}

          {q.type === "text" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-0">
                  Maximale Wortanzahl:
                  <input
                    type="number"
                    className="border border-gray-300 p-1 ml-2 w-20 rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none"
                    value={q.maxWords || 0}
                    onChange={(e) =>
                      updateQuestion(q.id, { maxWords: Number(e.target.value) })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 ml-4"
                  onClick={() => removeQuestion(q.id)}
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Neue Fragen hinzufügen */}
      <div className="flex gap-4 mb-6">
        <button
          className="bg-[#093a80] text-white px-4 py-2 rounded-md hover:bg-[#0b4a9f] transition"
          onClick={() => addQuestion("multiple")}
        >
          + Multiple Choice
        </button>
        <button
          className="bg-gray-200 text-[#093a80] px-4 py-2 rounded-md hover:bg-gray-300 transition"
          onClick={() => addQuestion("text")}
        >
          + Freitext
        </button>
      </div>

      {/* Umfrage erstellen */}
      <button
        className="bg-[#093a80] text-white px-6 py-3 rounded-md w-full hover:bg-[#0b4a9f] transition"
        onClick={handleSubmit}
      >
        Umfrage erstellen
      </button>
    </div>
  );
}
