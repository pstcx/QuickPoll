import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { X, Users, QrCode } from "lucide-react";
import { getPublicSurvey } from "../lib/api";
import ConfirmDialog from "./Components/ConfirmDialog";

const JoinScreen = () => {
  // --- State ---------------------------------------------------------------
  const [pollIdInput, setPollIdInput] = useState("");
  const [pollIdInt, setPollIdInt] = useState<number | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  const navigate = useNavigate();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // --- Funktionen ----------------------------------------------------------

  const handlePollIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Nur Zahlen erlauben
    if (value.length <= 4) {
      setPollIdInput(value);
      
      if (value.length === 4) {
        const numericValue = parseInt(value, 10);
        setPollIdInt(numericValue);
        setValidationMessage("");
      } else {
        setPollIdInt(null);
        if (value.length > 0 && value.length < 4) {
          setValidationMessage("Poll-ID muss genau 4 Ziffern haben");
        } else {
          setValidationMessage("");
        }
      }
    }
  };

  const validateAndNavigateToPoll = async (pollId: number) => {
    try {
      // Poll-Daten vom Backend abrufen (öffentliche API für Teilnehmer)
      const survey = await getPublicSurvey(pollId.toString());
      
      // Status der Umfrage prüfen
      if (survey.status === 'finished') {
        setErrorDialog({
          isOpen: true,
          title: "Umfrage beendet",
          message: `Die Umfrage "${survey.title}" ist bereits beendet und nimmt keine weiteren Antworten mehr entgegen.`
        });
        return;
      }

      navigate(`/poll/${pollId}`);

    } catch (error) {
      console.error("Fehler beim Abrufen der Umfrage:", error);
      
      // Prüfen ob es ein 404-Fehler ist (Umfrage existiert nicht)
      if (error instanceof Error && error.message.includes('404')) {
        setErrorDialog({
          isOpen: true,
          title: "Umfrage nicht gefunden",
          message: `Es wurde keine Umfrage mit der ID ${pollId} gefunden. Bitte überprüfe die eingegebene Poll-ID.`
        });
      } else {
        setErrorDialog({
          isOpen: true,
          title: "Verbindungsfehler",
          message: "Es gab ein Problem beim Verbinden mit dem Server. Bitte versuche es später erneut."
        });
      }
    }
  };

  const handleJoinPoll = async () => {
    if (!pollIdInt) return;
    
    setIsLoading(true);
    setValidationMessage("");
    
    await validateAndNavigateToPoll(pollIdInt);
    
    setIsLoading(false);
  };

  const closeErrorDialog = () => {
    setErrorDialog({
      isOpen: false,
      title: "",
      message: ""
    });
  };

  const openQrScanner = () => {
    setShowQrScanner(true);
  };

  // QR-Scanner Funktionen
  useEffect(() => {
    if (showQrScanner) {
      // Kleine Verzögerung um sicherzustellen, dass das Modal gerendert ist
      setTimeout(() => {
        startQrScanner();
      }, 100);
    }
  }, [showQrScanner]);

  const startQrScanner = () => {
    console.log("Starte QR-Scanner...");
    
    try {
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.error("QR-Reader Element nicht gefunden");
        setScanError("Scanner konnte nicht initialisiert werden");
        return;
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      const scanner = new Html5QrcodeScanner("qr-reader", config, false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          console.log("QR-Code erfolgreich gescannt:", decodedText);
          onScanSuccess(decodedText);
          closeQrScanner();
        },
        (error) => {
          // Ignoriere kontinuierliche Scan-Fehler
          if (!error.includes("NotFoundException")) {
            console.warn("QR-Scan Fehler:", error);
          }
        }
      );

    } catch (error) {
      console.error("Fehler beim Starten des QR-Scanners:", error);
      setScanError("Kamera konnte nicht gestartet werden. Bitte überprüfe deine Browser-Berechtigungen.");
    }
  };

  const onScanSuccess = async (qrText: string) => {
    console.log("Verarbeite gescannten Text:", qrText);
    
    try {
      const url = new URL(qrText);
      
      if (url.hostname === 'localhost' || url.hostname.includes('vercel') || url.hostname.includes('quickpoll')) {
        const pollMatch = url.pathname.match(/\/poll\/(\d+)/);
        if (pollMatch) {
          const pollId = pollMatch[1];
          console.log("Poll-ID aus QR-Code extrahiert:", pollId);
          
          // Poll validieren bevor Navigation
          await validateAndNavigateToPoll(parseInt(pollId, 10));
          return;
        }
      }
      
      if (window.confirm(`QR-Code enthält eine externe URL: ${qrText} (Nicht von QuickPoll)\n\nMöchtest du diese öffnen?`)) {
        window.open(qrText, '_blank');
      }
      
    } catch (error) {
      if (/^\d{4}$/.test(qrText)) {
        console.log("Poll-ID direkt aus QR-Code:", qrText);
        // Poll validieren bevor Navigation
        await validateAndNavigateToPoll(parseInt(qrText, 10));
      } else {
        setScanError("QR-Code enthält keine gültige Poll-ID oder URL");
      }
    }
  };

  const closeQrScanner = () => {
    console.log("Schließe QR-Scanner...");
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        console.log("Scanner erfolgreich geschlossen");
      }).catch((error) => {
        console.error("Fehler beim Schließen des Scanners:", error);
      });
    }
    setShowQrScanner(false);
    setScanError(null);
  };

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  // --- Rückgabe der UI -----------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#093a80] mb-2">🗳️ Poll beitreten</h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Gib die Poll-ID ein oder scanne den QR-Code
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Poll ID Input */}
        <div className="mb-6">
          <label htmlFor="pollId" className="block text-sm font-medium text-[#093a80] mb-2">
            Poll-ID eingeben
          </label>
          <input
            id="pollId"
            type="text"
            value={pollIdInput}
            onChange={handlePollIdChange}
            placeholder="z.B. 1234"
            className="border border-gray-300 p-3 w-full rounded-md focus:border-[#093a80] focus:ring-1 focus:ring-[#093a80] outline-none text-lg text-center"
          />
          {validationMessage && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {validationMessage}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Join Button */}
          <button
            onClick={handleJoinPoll}
            disabled={!pollIdInt || isLoading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              !pollIdInt || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-400 to-teal-500 hover:scale-105 shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Lädt...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Poll beitreten
              </div>
            )}
          </button>

          {/* QR Scanner Button */}
          <button
            onClick={openQrScanner}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              QR-Code scannen
            </div>
          </button>
        </div>

        {/* Info Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Der Host wird dir die Poll-ID mitteilen oder einen QR-Code bereitstellen.
          </p>
        </div>
      </div>

      {/* QR-Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#093a80]">QR-Code scannen</h3>
              <button
                onClick={closeQrScanner}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Richte deine Kamera auf den QR-Code der Umfrage
              </p>
              
              <p className="text-sm text-[#093a80] mb-4">
                💡 Tipp: Erlaube den Kamera-Zugriff wenn du dazu aufgefordert wirst
              </p>
              
              {/* Scanner Container */}
              <div id="qr-reader" className="w-full min-h-[300px] bg-gray-100 rounded-lg"></div>
              
              {scanError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <strong>Fehler:</strong> {scanError}
                  <br />
                  <small className="text-red-600">
                    Versuche die Seite zu aktualisieren oder einen anderen Browser zu verwenden.
                  </small>
                </div>
              )}
              
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={closeQrScanner}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    setScanError(null);
                    if (scannerRef.current) {
                      scannerRef.current.clear().then(() => {
                        setTimeout(() => startQrScanner(), 100);
                      });
                    } else {
                      startQrScanner();
                    }
                  }}
                  className="px-4 py-2 bg-[#093a80] text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <ConfirmDialog
        isOpen={errorDialog.isOpen}
        title={errorDialog.title}
        message={errorDialog.message}
        confirmText="OK"
        onConfirm={closeErrorDialog}
        onCancel={closeErrorDialog}
        variant="warning"
      />
    </div>
  );
};

export default JoinScreen;