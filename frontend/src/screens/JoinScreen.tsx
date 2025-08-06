import { useState } from "react";

const JoinScreen = () => {
  // --- State ---------------------------------------------------------------
  const [pollIdInput, setPollIdInput] = useState("");
  const [pollIdInt, setPollIdInt] = useState<number | null>(null);

  // --- Funktionen ----------------------------------------------------------

  const pollBeitretenBtn = () => {
    const parsed = parseInt(pollIdInput, 10);

    if (isNaN(parsed)) {
      console.log("Ungültige Eingabe – keine Zahl");
      return;
    }

    setPollIdInt(parsed);
    console.log("Gespeicherter Poll-Code (Integer):", pollIdInt);
  };

  const qrCodeScannenBtn = () => {
    console.log("QR-Code-Scannen-Button geklickt");
  };

  // --- Rückgabe der UI -----------------------------------------------------
  return (
    <div>
      <div className="p-4">
        <h2 className="text-xl font-bold text-yellow-700">Umfrage beitreten</h2>
      </div>

      <div className="flex flex-col items-center box-border p-4 justify-start">
        <div className="text-[#555555] mb-4">
          <h4>Geben Sie die Poll-ID ein oder scannen Sie den QR-Code</h4>
        </div>

        <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[800px] h-auto flex flex-col gap-6 px-10 py-[50px] rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-900 text-center m-0">
            Umfrage beitreten
          </h3>

          <div className="w-full max-w-full flex flex-col gap-1">
            <label
              htmlFor="pollId"
              className="text-base text-gray-500 text-left m-0"
            >
              Poll-ID eingeben
            </label>

            <div className="flex gap-3">
              <input
                id="pollId"
                type="text"
                placeholder="123456"
                value={pollIdInput}
                onChange={(e) => setPollIdInput(e.target.value)}
                className="flex-1 border border-gray-300 text-base px-4 py-2 rounded-md border-solid focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] outline-none"
              />
              <button
                onClick={pollBeitretenBtn}
                className="bg-blue-600 text-white font-semibold text-sm px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Beitreten
              </button>
            </div>
          </div>

          {/* {error && <div className="text-red-500 mt-2">{error}</div>} */}

          <p className="text-gray-500 text-base text-center m-0">
            -------------------- oder --------------------
          </p>

          <button
            onClick={qrCodeScannenBtn}
            className="bg-emerald-600 text-white font-semibold text-sm px-5 py-2 rounded-md hover:bg-emerald-700 transition-colors w-[200px] self-center"
          >
            QR-Code scannen
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinScreen;
