import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, ArrowLeftIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PollParticipationProps {
  code: string;
}

export default function PollParticipation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const params = useParams();
  const code = params.code;

  const { data: poll, isLoading, error } = useQuery({
    queryKey: [`/api/polls/code/${code}`],
    enabled: !!code,
  });

  const submitResponseMutation = useMutation({
    mutationFn: async ({ questionId, answer, pollId }: { questionId: number; answer: string; pollId: number }) => {
      const response = await apiRequest("POST", `/api/polls/${pollId}/responses`, {
        questionId,
        answer,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Antwort abgegeben!",
        description: "Ihre Antwort wurde erfolgreich übermittelt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Fehler beim Übermitteln der Antwort.",
        variant: "destructive",
      });
      console.error("Submit response error:", error);
    },
  });

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const submitAllAnswers = async () => {
    if (!poll) return;

    const unansweredQuestions = poll.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Unvollständige Antworten",
        description: "Bitte beantworten Sie alle Fragen.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const question of poll.questions) {
        await submitResponseMutation.mutateAsync({
          questionId: question.id,
          answer: answers[question.id],
          pollId: poll.id,
        });
      }
      
      toast({
        title: "Alle Antworten abgegeben!",
        description: "Vielen Dank für Ihre Teilnahme.",
      });
      
      // Redirect to results or home
      setLocation("/");
    } catch (error) {
      console.error("Submit all answers error:", error);
    }
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
              <p className="text-gray-600 mb-6">Die angeforderte Umfrage konnte nicht gefunden werden oder ist nicht aktiv.</p>
              <Link href="/join">
                <Button>Zurück</Button>
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
            <Link href="/join">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">Bitte beantworten Sie die Fragen</p>
        </div>

        <div className="space-y-8">
          {poll.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle>
                  {index + 1}. {question.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {question.type === "multiple-choice" ? (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                        <Label htmlFor={`${question.id}-${optionIndex}`} className="text-lg cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Geben Sie Ihre Antwort hier ein..."
                    className="min-h-[100px] resize-none"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {/* Submit Button */}
          <div className="text-center">
            <Button
              onClick={submitAllAnswers}
              disabled={submitResponseMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              {submitResponseMutation.isPending ? (
                "Übermittle Antworten..."
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Antworten abgeben
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
