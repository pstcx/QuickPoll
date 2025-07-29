import { useNavigate } from "react-router-dom";
import ActionButton from "./Components/Buttons";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    //</div><div className="min-h-screen bg-[url('homescreen_img.jpeg')] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4">
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4">
      {/* Logo oder App-Name */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700">🗳️ QuickPoll</h1>
        <p className="mt-2 text-gray-600 text-lg max-w-md mx-auto">
          Erstelle unkompliziert Umfragen, teile sie mit anderen und sieh dir
          die Ergebnisse in Echtzeit an.
          Simply simple.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-6">
        <ActionButton
          icon="➕"
          label="Poll erstellen"
          gradientFrom="from-green-400"
          gradientTo="to-teal-500"
          onClick={() => navigate("/create")}
        />
        <ActionButton
          icon="🗳️"
          label="Poll beitreten"
          gradientFrom="from-yellow-400"
          gradientTo="to-orange-500"
          onClick={() => navigate("/join")}
        />
        <ActionButton
          icon="📋"
          label="Meine Polls"
          gradientFrom="from-blue-400"
          gradientTo="to-indigo-500"
          onClick={() => navigate("/my-polls")}
        />
      </div>

    </div>
  );
};

export default HomeScreen;
