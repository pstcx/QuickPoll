import ActionButton from "./Components/ActionButton";
import { useNavigate } from "react-router-dom";

const CreateScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-pink-700">Poll Erstellen</h2>
      <p>Hier kannst du eine neue Umfrage erstellen.</p>
      <div className="flex items-center justify-center py-10 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ActionButton
            icon="📝"
            label="Multiple Choice Poll"
            gradientFrom="from-green-400"
            gradientTo="to-teal-500"
            onClick={() => navigate("/create/multiple-choice")}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateScreen;
