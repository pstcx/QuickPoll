import { useState } from "react";

const MultipleChoiceScreen = () => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleChangeOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const handleSubmit = () => {
    console.log("Umfrage erstellen mit: ", title, options);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Umfrage erstellen</h2>

      <input
        className="border p-1 w-full mb-4"
        placeholder="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {options.map((opt, index) => (
        <input
          key={index}
          className="border p-2 w-full mb-2"
          placeholder={`Option ${index + 1}`}
          value={opt}
          onChange={(e) => handleChangeOption(index, e.target.value)}
        />
      ))}
      <div className="flex gap-6 justify-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={handleAddOption}
        >
          Weitere Option
        </button>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          onClick={handleSubmit}
        >
          Umfrage erstellen
        </button>
      </div>
    </div>
  );
};

export default MultipleChoiceScreen;
