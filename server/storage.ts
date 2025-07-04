import { polls, questions, responses, type Poll, type Question, type Response, type InsertPoll, type InsertQuestion, type InsertResponse, type PollWithQuestions, type QuestionWithResponses, type PollResults } from "@shared/schema";

export interface IStorage {
  // Poll operations
  createPoll(poll: InsertPoll): Promise<Poll>;
  getPoll(id: number): Promise<Poll | undefined>;
  getPollByCode(code: string): Promise<Poll | undefined>;
  getPollWithQuestions(id: number): Promise<PollWithQuestions | undefined>;
  updatePollStatus(id: number, isActive: number): Promise<void>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByPollId(pollId: number): Promise<Question[]>;
  
  // Response operations
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesByQuestionId(questionId: number): Promise<Response[]>;
  getResponsesByPollId(pollId: number): Promise<Response[]>;
  
  // Results operations
  getPollResults(pollId: number): Promise<PollResults | undefined>;
}

export class MemStorage implements IStorage {
  private polls: Map<number, Poll>;
  private questions: Map<number, Question>;
  private responses: Map<number, Response>;
  private currentPollId: number;
  private currentQuestionId: number;
  private currentResponseId: number;

  constructor() {
    this.polls = new Map();
    this.questions = new Map();
    this.responses = new Map();
    this.currentPollId = 1;
    this.currentQuestionId = 1;
    this.currentResponseId = 1;
  }

  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const id = this.currentPollId++;
    const poll: Poll = {
      ...insertPoll,
      id,
      isActive: insertPoll.isActive ?? 0,
      createdAt: new Date(),
    };
    this.polls.set(id, poll);
    return poll;
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async getPollByCode(code: string): Promise<Poll | undefined> {
    return Array.from(this.polls.values()).find(poll => poll.code === code);
  }

  async getPollWithQuestions(id: number): Promise<PollWithQuestions | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;

    const pollQuestions = await this.getQuestionsByPollId(id);
    return {
      ...poll,
      questions: pollQuestions,
    };
  }

  async updatePollStatus(id: number, isActive: number): Promise<void> {
    const poll = this.polls.get(id);
    if (poll) {
      poll.isActive = isActive;
      this.polls.set(id, poll);
    }
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const question: Question = {
      ...insertQuestion,
      id,
      options: insertQuestion.options ?? null,
    };
    this.questions.set(id, question);
    return question;
  }

  async getQuestionsByPollId(pollId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.pollId === pollId)
      .sort((a, b) => a.order - b.order);
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = this.currentResponseId++;
    const response: Response = {
      ...insertResponse,
      id,
      createdAt: new Date(),
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponsesByQuestionId(questionId: number): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(response => response.questionId === questionId);
  }

  async getResponsesByPollId(pollId: number): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(response => response.pollId === pollId);
  }

  async getPollResults(pollId: number): Promise<PollResults | undefined> {
    const poll = this.polls.get(pollId);
    if (!poll) return undefined;

    const pollQuestions = await this.getQuestionsByPollId(pollId);
    const questionsWithResponses: QuestionWithResponses[] = [];

    for (const question of pollQuestions) {
      const questionResponses = await this.getResponsesByQuestionId(question.id);
      questionsWithResponses.push({
        ...question,
        responses: questionResponses,
      });
    }

    const totalResponses = await this.getResponsesByPollId(pollId);
    const participantCount = new Set(totalResponses.map(r => r.questionId)).size;

    return {
      poll,
      questions: questionsWithResponses,
      participantCount,
    };
  }
}

export const storage = new MemStorage();
