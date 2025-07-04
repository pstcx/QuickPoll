import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, DownloadIcon, UsersIcon } from "lucide-react";
import { Link } from "wouter";
import PollChart from "@/components/poll-chart";

interface PollResultsProps {
  id: string;
}

export default function PollResults() {
  const params = useParams();
  const id = params.id;
  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/polls/${id}/results`],
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });

  const { sendMessage } = useWebSocket();

  useEffect(() => {
    if (id) {
      // Join the poll room for real-time updates
      sendMessage({
        type: 'join_poll',
        pollId: parseInt(id),
      });
    }
  }, [id, sendMessage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Ergebnisse...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Ergebnisse nicht verfügbar</h1>
              <p className="text-gray-600 mb-6">Die Ergebnisse für diese Umfrage konnten nicht geladen werden.</p>
              <Link href="/">
                <Button>Zurück zur Startseite</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const exportResults = () => {
    // TODO: Implement export functionality
    console.log("Export results:", results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Ergebnisse in Echtzeit</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{results.poll.title}</h2>
          <div className="flex justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live-Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {results.participantCount} Teilnehmer
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {results.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle>
                  {index + 1}. {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.type === "multiple-choice" ? (
                  <div className="space-y-6">
                    {/* Chart */}
                    <div className="h-64">
                      <PollChart question={question} />
                    </div>

                    {/* Results Table */}
                    <div className="space-y-3">
                      {question.options?.map((option, optionIndex) => {
                        const count = question.responses.filter(r => r.answer === option).length;
                        const percentage = question.responses.length > 0 
                          ? Math.round((count / question.responses.length) * 100) 
                          : 0;
                        
                        const colors = [
                          'bg-primary',
                          'bg-secondary', 
                          'bg-yellow-500',
                          'bg-red-500',
                          'bg-purple-500',
                          'bg-pink-500',
                        ];
                        
                        return (
                          <div key={optionIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-4 h-4 ${colors[optionIndex % colors.length]} rounded-full`}></div>
                              <span className="font-medium">{option}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${colors[optionIndex % colors.length]} h-2 rounded-full transition-all`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-12 text-right">{count}</span>
                              <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {question.responses.map((response, responseIndex) => (
                      <div key={responseIndex} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{response.answer}</p>
                        <span className="text-sm text-gray-500 mt-2 block">
                          {response.createdAt ? new Date(response.createdAt).toLocaleString('de-DE') : 'vor wenigen Sekunden'}
                        </span>
                      </div>
                    ))}
                    {question.responses.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Noch keine Antworten vorhanden
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <Button variant="outline" onClick={exportResults}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Ergebnisse exportieren
          </Button>
          <Link href={`/poll/${id}/display`}>
            <Button variant="outline">
              Zurück zur Umfrage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
