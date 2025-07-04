import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, QrCodeIcon } from "lucide-react";
import { Link } from "wouter";

export default function JoinPoll() {
  const [, setLocation] = useLocation();
  const [pollCode, setPollCode] = useState("");

  const joinPoll = () => {
    if (pollCode.trim()) {
      setLocation(`/poll/${pollCode.trim().toUpperCase()}/participate`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinPoll();
    }
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
            <h1 className="text-2xl font-bold text-gray-900">An Umfrage teilnehmen</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">Geben Sie die Poll-ID ein oder scannen Sie den QR-Code</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Umfrage beitreten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Poll-ID eingeben
              </Label>
              <div className="flex gap-2">
                <Input
                  value={pollCode}
                  onChange={(e) => setPollCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="ABC123"
                  className="text-center font-mono text-lg"
                />
                <Button onClick={joinPoll} className="bg-primary hover:bg-blue-700">
                  Beitreten
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center text-gray-400">
                <div className="w-16 h-px bg-gray-300"></div>
                <span className="px-4 text-sm">oder</span>
                <div className="w-16 h-px bg-gray-300"></div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={() => {}}>
                <QrCodeIcon className="h-4 w-4 mr-2" />
                QR-Code scannen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
