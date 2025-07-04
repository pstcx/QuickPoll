import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, PlayIcon, CopyIcon, DownloadIcon, Pause } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import QRCode from "@/components/qr-code";

interface PollDisplayProps {
  id: string;
}

export default function PollDisplay({ id }: PollDisplayProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pollStarted, setPollStarted] = useState(false);

  const { data: poll, isLoading, error } = useQuery({
    queryKey: [`/api/polls/${id}`],
    enabled: !!id,
  });

  const updatePollStatusMutation = useMutation({
    mutationFn: async (isActive: number) => {
      const response = await apiRequest("PATCH", `/api/polls/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: (_, isActive) => {
      if (isActive === 1) {
        setPollStarted(true);
        toast({
          title: "Umfrage gestartet!",
          description: "Teilnehmer können jetzt an der Umfrage teilnehmen.",
        });
      } else {
        setPollStarted(false);
        toast({
          title: "Umfrage beendet!",
          description: "Die Umfrage wurde erfolgreich beendet.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Umfrage.",
        variant: "destructive",
      });
      console.error("Update poll status error:", error);
    },
  });

  const startPoll = () => {
    updatePollStatusMutation.mutate(1);
  };

  const stopPoll = () => {
    updatePollStatusMutation.mutate(0);
  };

  const copyLink = () => {
    const pollUrl = `${window.location.origin}/poll/${poll.code}/participate`;
    navigator.clipboard.writeText(pollUrl);
    toast({
      title: "Link kopiert!",
      description: "Der Poll-Link wurde in die Zwischenablage kopiert.",
    });
  };

  const viewResults = () => {
    setLocation(`/poll/${id}/results`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Umfrage...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Umfrage nicht gefunden</h1>
              <p className="text-gray-600 mb-6">Die angeforderte Umfrage konnte nicht gefunden werden.</p>
              <Link href="/">
                <Button>Zurück zur Startseite</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pollUrl = `${window.location.origin}/poll/${poll.code}/participate`;

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
            <h1 className="text-2xl font-bold text-gray-900">Umfrage bereit!</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">Teilen Sie den QR-Code oder Link mit Ihren Teilnehmern</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">QR-Code scannen</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-6">
                <QRCode value={pollUrl} size={192} />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scannen Sie den QR-Code mit Ihrem Smartphone
              </p>
              <Button variant="outline" onClick={() => {}}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                QR-Code herunterladen
              </Button>
            </CardContent>
          </Card>

          {/* Poll Info */}
          <Card>
            <CardHeader>
              <CardTitle>Umfrage-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Umfragetitel
                </Label>
                <p className="text-lg font-medium">{poll.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Direkter Link
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={pollUrl}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Poll-ID
                </Label>
                <p className="text-lg font-mono bg-gray-100 px-4 py-2 rounded-lg">
                  {poll.code}
                </p>
              </div>
              
              <div className="pt-6 border-t border-gray-200 space-y-3">
                {!pollStarted ? (
                  <Button
                    onClick={startPoll}
                    disabled={updatePollStatusMutation.isPending}
                    className="w-full bg-secondary hover:bg-green-700"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Umfrage starten
                  </Button>
                ) : (
                  <Button
                    onClick={stopPoll}
                    disabled={updatePollStatusMutation.isPending}
                    variant="destructive"
                    className="w-full"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Umfrage beenden
                  </Button>
                )}
                
                <Button
                  onClick={viewResults}
                  variant="outline"
                  className="w-full"
                >
                  Ergebnisse anzeigen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
