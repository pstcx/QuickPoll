import React, { useState } from 'react';
import { Copy, Camera, Info, User } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface SurveyDetails {
  title: string;
  directLink: string;
  pollId: string;
}

const ManageScreen: React.FC = () => {
  const [surveyDetails, setSurveyDetails] = useState<SurveyDetails>({
    title: 'UMFRAGETITEL',
    directLink: 'https://testlink.com',
    pollId: '9RU73T'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Beispiel-Teilnehmer
  const participants = [
    
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyDetails.directLink);
  };

  const handleStartSurvey = () => {
    if (!isStarted && !isLoading && participants.length > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsStarted(true);
        navigate(`/my-polls/${id}/result`);
      }, 1000);
    } else if (isStarted) {
      setIsStarted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="scale-[0.9] origin-top max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-200 bg-blue-50">
            <Info size={22} className="text-blue-700" />
            <span className="text-sm font-medium text-blue-700">
              Scanne den QR-Code oder nutze den direkten Link, um zur Umfrage zu gelangen.
            </span>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - QR Code Scanner */}
          <div className="flex-1 bg-white rounded p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              QR-Code scannen
            </h2>
            
            {/* QR Code Area */}
            <div className="bg-gray-100 rounded p-8 mb-6 text-center">
              <div className="w-64 h-64 mx-auto bg-gray-200 rounded flex items-center justify-center">
                <Camera size={64} className="text-gray-400" />
              </div>
            </div>

            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Scanne den QR-Code mit deinem Smartphone, um direkt zur Umfrage zu gelangen.
            </p>
          </div>

          {/* Right Column - Survey Details */}
          <div className="flex-1 bg-white rounded p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Umfrage-Details
            </h2>

            <div className="space-y-4">
              {/* Survey Title */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Umfragetitel
                </label>
                <div className="font-bold text-gray-800">
                  {surveyDetails.title}
                </div>
              </div>

              {/* Direct Link */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Direkter Link
                </label>
                <div className="flex border border-gray-300 rounded">
                  <input
                    type="text"
                    value={surveyDetails.directLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 border-l border-gray-300 hover:bg-gray-100"
                  >
                    <Copy size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Poll ID */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Poll-ID
                </label>
                <input
                  type="text"
                  value={surveyDetails.pollId}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                {/* Teilnehmeranzahl mit Ladespinner */}
                <div className="mb-6 flex items-center gap-3 justify-center">
                  <svg className="animate-spin h-5 w-5 text-blue-700" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  <span className="text-md font-semibold">
                    {participants.length > 0 ? <>{participants.length} Teilnehmer wart{participants.length > 1 ? 'en' : 'et'}...</> : <>Noch keine Teilnehmer...</>}
                  </span>
                </div>
                <button 
                  onClick={handleStartSurvey}
                  disabled={isLoading || participants.length === 0}
                  className={`w-full py-3 px-4 rounded font-medium shadow transition
                    ${
                      isLoading || participants.length === 0
                        ? 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                        : isStarted
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-700 text-white hover:bg-gray-800'
                    }`}
                >
                  {isLoading
                    ? 'Lädt...'
                    : isStarted
                      ? 'Umfrage stoppen'
                      : 'Umfrage starten'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageScreen;