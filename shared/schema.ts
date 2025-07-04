import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull().unique(),
  isActive: integer("is_active").notNull().default(0), // 0 = inactive, 1 = active
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'multiple-choice' or 'free-text'
  options: json("options").$type<string[]>().default([]),
  order: integer("order").notNull().default(0),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  pollId: integer("poll_id").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  createdAt: true,
});

export type InsertPoll = z.infer<typeof insertPollSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Poll = typeof polls.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Response = typeof responses.$inferSelect;

export type PollWithQuestions = Poll & {
  questions: Question[];
};

export type QuestionWithResponses = Question & {
  responses: Response[];
};

export type PollResults = {
  poll: Poll;
  questions: QuestionWithResponses[];
  participantCount: number;
};
