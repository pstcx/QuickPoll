import React from "react";
import "./App.css";
// import { useNavigate } from "react-router-dom"; // Entkommentieren, wenn Router eingerichtet

const JoinScreen = () => {
  /*
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  */

  /*
  // Zurück-Button Funktion
  const handleBack = () => {
    navigate(-1); // Oder navigate("/zielseite");
  };
  */

  /*
  // Poll-ID Validierung und Weiterleitung
  const handleJoinPoll = async () => {
    const pollId = (document.getElementById("pollId") as HTMLInputElement).value.trim();

    if (!pollId) {
      setError("Bitte Poll-ID eingeben");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // API-Call zur Überprüfung der Poll-ID
      const response = await fetch(`/api/polls/validate/${pollId}`);

      if (!response.ok) {
        throw new Error("Umfrage nicht gefunden");
      }

      const data = await response.json();

      // Weiterleitung zur Umfrageseite
      navigate(`/poll/${data.pollId}`, { 
        state: { pollData: data } // Optional: Daten mitnehmen
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Serverfehler");
    } finally {
      setIsLoading(false);
    }
  };
  */

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="navbar">
        <button
          className="return-button"
          // onClick={handleBack}
          // disabled={isLoading}
        >
          {/* {isLoading ? "..." : "Zurück"} */}
          Zurück
        </button>
        <h1 className="navbar-title">An Umfrage Teilnehmen</h1>
      </nav>

      <div className="content">
        <div className="content-title">
          <h4>Geben Sie die Poll-ID ein oder scannen Sie den QR-Code</h4>
        </div>

        <div className="content-card">
          <h3 className="card-title">Umfrage beitreten</h3>

          <div className="input-group">
            <label className="input-label" htmlFor="pollId">
              Poll-ID eingeben
            </label>
            <div className="input-row">
              <input
                id="pollId"
                type="text"
                placeholder="123456"
                className="input-field"
                // onKeyPress={(e) => e.key === "Enter" && handleJoinPoll()}
                // disabled={isLoading}
              />
              <button
                className="input-button"
                // onClick={handleJoinPoll}
                // disabled={isLoading}
              >
                {/* {isLoading ? "Wird überprüft..." : "Beitreten"} */}
                Beitreten
              </button>
            </div>
          </div>

          {/* Fehlermeldung */}
          {/* {error && <div className="text-red-500 mt-2">{error}</div>} */}

          <p className="card-text">
            -------------------- oder --------------------
          </p>

          <button
            className="main-button"
            // disabled={isLoading}
          >
            {/* {isLoading ? "Bitte warten..." : "QR-Code scannen"} */}
            QR-Code scannen
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinScreen;
