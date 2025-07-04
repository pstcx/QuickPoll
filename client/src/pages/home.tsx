import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon, PlayIcon, UsersIcon, Vote } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Vote className="text-primary text-2xl mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">QuickPoll</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-900 hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/create" className="text-gray-900 hover:text-primary transition-colors">
                Umfrage erstellen
              </Link>
              <Link href="/join" className="text-gray-900 hover:text-primary transition-colors">
                Teilnehmen
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Digitales Umfragetool für die Hochschullehre
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Erstellen Sie einfach Umfragen, teilen Sie sie per QR-Code und erhalten Sie Antworten in Echtzeit.
              Komplett anonym und ohne Registrierung.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Create Poll Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <PlusIcon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Umfrage erstellen</h3>
                <p className="text-gray-600 mb-6">
                  Erstellen Sie eine neue Umfrage mit Multiple-Choice oder Freitext-Fragen
                </p>
                <Link href="/create">
                  <Button className="bg-primary hover:bg-blue-700">
                    Jetzt erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Start Poll Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <PlayIcon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Umfrage starten</h3>
                <p className="text-gray-600 mb-6">
                  Starten Sie eine bereits erstellte Umfrage und zeigen Sie den QR-Code an
                </p>
                <Link href="/create">
                  <Button className="bg-secondary hover:bg-green-700">
                    Umfrage starten
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Join Poll Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersIcon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Zur Umfrage beitreten</h3>
                <p className="text-gray-600 mb-6">
                  Nehmen Sie an einer Umfrage teil über QR-Code oder direkten Link
                </p>
                <Link href="/join">
                  <Button className="bg-accent hover:bg-orange-700">
                    Beitreten
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Vote className="text-primary text-xl mr-2" />
              <span className="text-lg font-semibold">QuickPoll</span>
            </div>
            <p className="text-gray-400 text-sm">Digitales Umfragetool für die Hochschullehre</p>
            <p className="text-gray-400 text-sm mt-2">Anonym • Schnell • Einfach</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
