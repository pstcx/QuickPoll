import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusIcon, TrashIcon, CheckIcon, ArrowLeftIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const questionSchema = z.object({
  text: z.string().min(1, "Fragetext ist erforderlich"),
  type: z.enum(["multiple-choice", "free-text"]),
  options: z.array(z.string()).optional(),
});

const pollSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  questions: z.array(questionSchema).min(1, "Mindestens eine Frage ist erforderlich"),
});

type PollForm = z.infer<typeof pollSchema>;

export default function CreatePoll() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<PollForm>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: "",
      questions: [
        {
          text: "",
          type: "multiple-choice",
          options: ["", ""],
        },
      ],
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: PollForm) => {
      const response = await apiRequest("POST", "/api/polls", data);
      return response.json();
    },
    onSuccess: (poll) => {
      console.log("Poll created successfully:", poll);
      toast({
        title: "Umfrage erstellt!",
        description: "Ihre Umfrage wurde erfolgreich erstellt.",
      });
      setLocation(`/poll/${poll.id}/display`);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Umfrage.",
        variant: "destructive",
      });
      console.error("Create poll error:", error);
    },
  });

  const addQuestion = () => {
    const currentQuestions = form.getValues("questions");
    form.setValue("questions", [
      ...currentQuestions,
      {
        text: "",
        type: "multiple-choice",
        options: ["", ""],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const currentQuestions = form.getValues("questions");
    if (currentQuestions.length > 1) {
      form.setValue("questions", currentQuestions.filter((_, i) => i !== index));
    }
  };

  const addOption = (questionIndex: number) => {
    const currentQuestions = form.getValues("questions");
    const question = currentQuestions[questionIndex];
    if (question.options) {
      question.options.push("");
      form.setValue(`questions.${questionIndex}.options`, question.options);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = form.getValues("questions");
    const question = currentQuestions[questionIndex];
    if (question.options && question.options.length > 2) {
      question.options.splice(optionIndex, 1);
      form.setValue(`questions.${questionIndex}.options`, question.options);
    }
  };

  const onSubmit = (data: PollForm) => {
    createPollMutation.mutate(data);
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
            <h1 className="text-2xl font-bold text-gray-900">Neue Umfrage erstellen</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Poll Title */}
            <Card>
              <CardHeader>
                <CardTitle>Umfrage-Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Umfragetitel</FormLabel>
                      <FormControl>
                        <Input placeholder="Geben Sie den Titel Ihrer Umfrage ein" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Fragen</CardTitle>
                  <Button type="button" onClick={addQuestion} variant="outline">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Frage hinzufügen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.watch("questions").map((question, questionIndex) => (
                  <div key={questionIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Frage {questionIndex + 1}</h4>
                      {form.watch("questions").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fragetext</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Geben Sie Ihre Frage ein"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fragetyp</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wählen Sie den Fragetyp" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="multiple-choice">Multiple-Choice</SelectItem>
                                <SelectItem value="free-text">Freitext</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {question.type === "multiple-choice" && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Antwortoptionen
                          </Label>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input
                                  placeholder="Antwortoption eingeben"
                                  value={option}
                                  onChange={(e) => {
                                    const currentQuestions = form.getValues("questions");
                                    const currentQuestion = currentQuestions[questionIndex];
                                    if (currentQuestion.options) {
                                      currentQuestion.options[optionIndex] = e.target.value;
                                      form.setValue(`questions.${questionIndex}.options`, currentQuestion.options);
                                    }
                                  }}
                                />
                                {question.options && question.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(questionIndex, optionIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(questionIndex)}
                              className="text-primary hover:text-blue-700"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Option hinzufügen
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={createPollMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                {createPollMutation.isPending ? (
                  "Erstelle Umfrage..."
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Umfrage erstellen
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
