import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertPollSchema, insertQuestionSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketMessage {
  type: 'poll_update' | 'new_response' | 'poll_status_change';
  pollId: number;
  data?: any;
}

const pollConnections = new Map<number, Set<WebSocket>>();

function generatePollCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function broadcastToPoll(pollId: number, message: WebSocketMessage) {
  const connections = pollConnections.get(pollId);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let currentPollId: number | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_poll' && data.pollId) {
          // Leave previous poll if any
          if (currentPollId) {
            const connections = pollConnections.get(currentPollId);
            if (connections) {
              connections.delete(ws);
            }
          }

          // Join new poll
          currentPollId = data.pollId;
          if (!pollConnections.has(currentPollId)) {
            pollConnections.set(currentPollId, new Set());
          }
          pollConnections.get(currentPollId)!.add(ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (currentPollId) {
        const connections = pollConnections.get(currentPollId);
        if (connections) {
          connections.delete(ws);
        }
      }
    });
  });

  // Create poll
  app.post('/api/polls', async (req, res) => {
    try {
      const { title, questions } = req.body;
      
      if (!title || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'Title and questions are required' });
      }

      const code = generatePollCode();
      const pollData = insertPollSchema.parse({ title, code, isActive: 0 });
      const poll = await storage.createPoll(pollData);

      // Create questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionData = insertQuestionSchema.parse({
          pollId: poll.id,
          text: question.text,
          type: question.type,
          options: question.options || [],
          order: i,
        });
        await storage.createQuestion(questionData);
      }

      const pollWithQuestions = await storage.getPollWithQuestions(poll.id);
      res.json(pollWithQuestions);
    } catch (error) {
      console.error('Create poll error:', error);
      res.status(500).json({ error: 'Failed to create poll' });
    }
  });

  // Get poll by code
  app.get('/api/polls/code/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const poll = await storage.getPollByCode(code);
      
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      const pollWithQuestions = await storage.getPollWithQuestions(poll.id);
      res.json(pollWithQuestions);
    } catch (error) {
      console.error('Get poll error:', error);
      res.status(500).json({ error: 'Failed to get poll' });
    }
  });

  // Get poll by ID
  app.get('/api/polls/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pollWithQuestions = await storage.getPollWithQuestions(id);
      
      if (!pollWithQuestions) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      res.json(pollWithQuestions);
    } catch (error) {
      console.error('Get poll error:', error);
      res.status(500).json({ error: 'Failed to get poll' });
    }
  });

  // Start/Stop poll
  app.patch('/api/polls/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'number') {
        return res.status(400).json({ error: 'isActive must be a number' });
      }

      await storage.updatePollStatus(id, isActive);
      
      // Broadcast status change
      broadcastToPoll(id, {
        type: 'poll_status_change',
        pollId: id,
        data: { isActive },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Update poll status error:', error);
      res.status(500).json({ error: 'Failed to update poll status' });
    }
  });

  // Submit response
  app.post('/api/polls/:id/responses', async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      const { questionId, answer } = req.body;
      
      if (!questionId || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
      }

      const responseData = insertResponseSchema.parse({
        questionId,
        pollId,
        answer,
      });

      await storage.createResponse(responseData);

      // Broadcast new response
      broadcastToPoll(pollId, {
        type: 'new_response',
        pollId,
        data: { questionId, answer },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Submit response error:', error);
      res.status(500).json({ error: 'Failed to submit response' });
    }
  });

  // Get poll results
  app.get('/api/polls/:id/results', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const results = await storage.getPollResults(id);
      
      if (!results) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      res.json(results);
    } catch (error) {
      console.error('Get poll results error:', error);
      res.status(500).json({ error: 'Failed to get poll results' });
    }
  });

  return httpServer;
}
