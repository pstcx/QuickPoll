import { polls, questions, responses, type Poll, type Question, type Response, type InsertPoll, type InsertQuestion, type InsertResponse, type PollWithQuestions, type QuestionWithResponses, type PollResults } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const [poll] = await db
      .insert(polls)
      .values(insertPoll)
      .returning();
    return poll;
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll || undefined;
  }

  async getPollByCode(code: string): Promise<Poll | undefined> {
    const [poll] = await db.select().from(polls).where(eq(polls.code, code));
    return poll || undefined;
  }

  async getPollWithQuestions(id: number): Promise<PollWithQuestions | undefined> {
    const poll = await this.getPoll(id);
    if (!poll) return undefined;

    const pollQuestions = await this.getQuestionsByPollId(id);
    return {
      ...poll,
      questions: pollQuestions,
    };
  }

  async updatePollStatus(id: number, isActive: number): Promise<void> {
    await db
      .update(polls)
      .set({ isActive })
      .where(eq(polls.id, id));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async getQuestionsByPollId(pollId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.pollId, pollId))
      .orderBy(questions.order);
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponsesByQuestionId(questionId: number): Promise<Response[]> {
    return await db
      .select()
      .from(responses)
      .where(eq(responses.questionId, questionId));
  }

  async getResponsesByPollId(pollId: number): Promise<Response[]> {
    return await db
      .select()
      .from(responses)
      .where(eq(responses.pollId, pollId));
  }

  async getPollResults(pollId: number): Promise<PollResults | undefined> {
    const poll = await this.getPoll(pollId);
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

export const storage = new DatabaseStorage();
