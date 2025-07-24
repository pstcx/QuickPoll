import React, { useState } from 'react';
import { Copy, Camera, Info, User, QrCode, Link, Hash, Play, Square, TrendingUp } from 'lucide-react';

interface SurveyDetails {
  title: string;
  directLink: string;
  pollId: string;
}

const ManageScreen: React.FC = () => {
  const [surveyDetails, setSurveyDetails] = useState<SurveyDetails>({
    title: 'Test Umfrage',
    directLink: 'https://testlink.com',
    pollId: '9876'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // Mock router functions for demo
  const id = 'demo-poll-id';
  const navigate = (path: string) => {
    console.log('Navigate to:', path);
  };

  // Beispiel-Teilnehmer
  const participants = [
    //{ id: 1, name: 'Testteilnehmer' }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyDetails.directLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStartSurvey = () => {
    if (!isLoading && participants.length > 0) {
      setIsLoading(true);
      setTimeout(() => {
        window.location.href = '/my-polls/' + surveyDetails.pollId + '/result';
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 scale-90 origin-top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                {surveyDetails.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-mono">
                  ID: {surveyDetails.pollId}
                </span>
                <p className="text-gray-600 flex items-center gap-2">
                  {isStarted ? (
                    <>
                      Live
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      • {participants.length} Teilnehmer
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Bereit zum Start - warten auf Teilnehmer...
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scale-90 origin-top">
        {/* Info Banner */}
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-blue-800 font-medium">
              Scanne den QR-Code oder nutze den direkten Link, um zur Umfrage zu gelangen.
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pb-7">
          <div className="grid lg:grid-cols-2 gap-7">
            {/* Left Column - QR Code Scanner */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  QR-Code scannen
                </h2>
              </div>
              
              {/* QR Code Area */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-7 mb-5 text-center border-2 border-dashed border-gray-200">
                <div className="w-56 h-56 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-200">
                  <Camera size={56} className="text-gray-400" />
                </div>
              </div>

              <p className="text-gray-600 text-center leading-relaxed">
                Scanne den QR-Code mit deinem Smartphone, um direkt zur Umfrage zu gelangen.
              </p>
            </div>

            {/* Right Column - Survey Details */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Link className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Umfrage-Details
                </h2>
              </div>

              <div className="space-y-5">
                {/* Survey Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Umfragetitel
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <span className="font-semibold text-gray-800">
                      {surveyDetails.title}
                    </span>
                  </div>
                </div>

                {/* Direct Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Direkter Link
                  </label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <input
                      type="text"
                      value={surveyDetails.directLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-2 border-l border-gray-300 transition-colors duration-200 ${
                        copySuccess 
                          ? 'bg-green-100 text-green-600' 
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {copySuccess && (
                    <p className="text-sm text-green-600 mt-1">Link kopiert!</p>
                  )}
                </div>

                {/* Poll ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Poll-ID
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <span className="font-mono text-gray-800">
                      {surveyDetails.pollId}
                    </span>
                  </div>
                </div>

                {/* Participants Status */}
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    {participants.length === 0 ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          Noch keine Teilnehmer...
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700 font-medium">
                          {participants.length} Teilnehmer wart{participants.length > 1 ? 'en' : 'et'}...
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={handleStartSurvey}
                  disabled={isLoading || participants.length === 0}
                  className={`w-full py-3 px-5 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                    isLoading || participants.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Lädt...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Poll starten
                    </>
                  )}
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