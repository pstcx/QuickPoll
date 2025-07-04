import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, PlayIcon, EyeIcon, Calendar, Users } from "lucide-react";
import { type PollWithQuestions } from "@shared/schema";

export default function ManagePolls() {
  const { data: polls, isLoading, error } = useQuery<PollWithQuestions[]>({
    queryKey: ['/api/polls'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Umfragen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Fehler beim Laden</h1>
              <p className="text-gray-600 mb-6">Die Umfragen konnten nicht geladen werden.</p>
              <Link href="/">
                <Button>Zurück zur Startseite</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Meine Umfragen</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-600">Verwalten Sie Ihre erstellten Umfragen</p>
          </div>
          <Link href="/create">
            <Button className="bg-primary hover:bg-blue-700">
              Neue Umfrage erstellen
            </Button>
          </Link>
        </div>

        {!polls || polls.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Umfragen vorhanden</h3>
                <p className="text-gray-600 mb-6">Sie haben noch keine Umfragen erstellt.</p>
                <Link href="/create">
                  <Button className="bg-primary hover:bg-blue-700">
                    Erste Umfrage erstellen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{poll.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {poll.createdAt ? new Date(poll.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}
                        </span>
                      </div>
                    </div>
                    <Badge variant={poll.isActive ? "default" : "secondary"}>
                      {poll.isActive ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{poll.questions?.length || 0} Fragen</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Poll-Code:</p>
                      <p className="font-mono text-sm font-medium">{poll.code}</p>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/poll/${poll.id}/display`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Starten
                        </Button>
                      </Link>
                      <Link href={`/poll/${poll.id}/results`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Ergebnisse
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}