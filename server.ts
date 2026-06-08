/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import { INITIAL_COLLEGES, INITIAL_WEEKLY_NOTES, INITIAL_VISIT_LOGS } from './src/data';

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is required to run AI features. Please configure it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Use /app as the base directory (Railway's working directory)
const APP_DIR = '/app';
const DB_DIR = path.join(APP_DIR, 'db-store');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist
function initializeLocalDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const defaultState = {
        colleges: INITIAL_COLLEGES,
        weeklyNotes: INITIAL_WEEKLY_NOTES,
        visitLogs: INITIAL_VISIT_LOGS,
        users: [
          {
            id: "admin_user",
            email: "admin@doctutorials.com",
            password: "doctutorials2026",
            name: "DocTutorials Admin",
            role: "Administrator"
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

function getDbState() {
  initializeLocalDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const state = JSON.parse(raw);
    if (!state.users) {
      state.users = [
        {
          id: "admin_user",
          email: "admin@doctutorials.com",
          password: "doctutorials2026",
          name: "DocTutorials Admin",
          role: "Administrator"
        }
      ];
      saveDbState(state);
    }
    return state;
  } catch (err) {
    console.error("Failed to read database, falling back to initial", err);
    return {
      colleges: INITIAL_COLLEGES,
      weeklyNotes: INITIAL_WEEKLY_NOTES,
      visitLogs: INITIAL_VISIT_LOGS,
      users: [
        {
          id: "admin_user",
          email: "admin@doctutorials.com",
          password: "doctutorials2026",
          name: "DocTutorials Admin",
          role: "Administrator"
        }
      ]
    };
  }
}

function saveDbState(state: any) {
  try {
    initializeLocalDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    // JSON body parsing
    app.use(express.json({ limit: '10mb' }));

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Prevent caching of API requests
    app.use('/api', (req, res, next) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      next();
    });

    // Initialize DB on server start
    initializeLocalDb();

    // Authentication API Endpoints
    app.post('/api/auth/login', (req, res) => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ success: false, error: 'Email and password are required' });
        }
        const state = getDbState();
        const user = state.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            token: `session-token-${user.id}-${Date.now()}`
          });
        } else {
          res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/auth/register', (req, res) => {
      try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
          return res.status(400).json({ success: false, error: 'Name, email and password are required' });
        }
        const state = getDbState();
        const exists = state.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          return res.status(400).json({ success: false, error: 'User with this email already exists' });
        }

        const newUser = {
          id: `u_${Date.now()}`,
          email: email.trim(),
          password: password,
          name: name.trim(),
          role: role || 'Member'
        };

        state.users.push(newUser);
        saveDbState(state);

        res.json({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          },
          token: `session-token-${newUser.id}-${Date.now()}`
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/auth/verify', (req, res) => {
      try {
        const { token } = req.body;
        if (!token || typeof token !== 'string' || !token.startsWith('session-token-')) {
          return res.status(401).json({ success: false, error: 'Invalid or missing token' });
        }
        
        const userId = token.split('-')[2];
        const state = getDbState();
        const user = state.users.find((u: any) => u.id === userId);
        
        if (user) {
          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          });
        } else {
          res.status(401).json({ success: false, error: 'Session expired or user deleted' });
        }
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Database API Endpoints
    app.get('/api/db', (req, res) => {
      try {
        const state = getDbState();
        res.json(state);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/colleges', (req, res) => {
      try {
        const state = getDbState();
        const newCol = req.body;
        const freshCol = {
          ...newCol,
          id: `c_${Date.now()}`,
          remarks: []
        };
        state.colleges = [freshCol, ...state.colleges];
        saveDbState(state);
        res.json(freshCol);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.delete('/api/colleges/:id', (req, res) => {
      try {
        const { id } = req.params;
        const state = getDbState();
        state.colleges = state.colleges.filter((c: any) => c.id !== id);
        saveDbState(state);
        res.json({ success: true, id });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/colleges/:id/won', (req, res) => {
      try {
        const { id } = req.params;
        const state = getDbState();
        let updatedCol: any = null;
        state.colleges = state.colleges.map((c: any) => {
          if (c.id === id) {
            updatedCol = {
              ...c,
              type: 'active',
              isLapsed: false,
              renewalDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
            return updatedCol;
          }
          return c;
        });
        saveDbState(state);
        if (updatedCol) {
          res.json(updatedCol);
        } else {
          res.status(404).json({ error: 'College not found' });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/colleges/:id/remarks', (req, res) => {
      try {
        const { id } = req.params;
        const { remarkText } = req.body;
        if (!remarkText || !remarkText.trim()) {
          return res.status(400).json({ error: 'Remark content required' });
        }
        const state = getDbState();
        let updatedCol: any = null;
        state.colleges = state.colleges.map((c: any) => {
          if (c.id === id) {
            updatedCol = {
              ...c,
              remarks: [remarkText.trim(), ...c.remarks]
            };
            return updatedCol;
          }
          return c;
        });
        saveDbState(state);
        if (updatedCol) {
          res.json(updatedCol);
        } else {
          res.status(404).json({ error: 'College not found' });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.put('/api/colleges/:id/v5', (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const state = getDbState();
        let updatedCol: any = null;
        state.colleges = state.colleges.map((c: any) => {
          if (c.id === id) {
            updatedCol = { ...c, ...updates };
            return updatedCol;
          }
          return c;
        });
        saveDbState(state);
        if (updatedCol) {
          res.json(updatedCol);
        } else {
          res.status(404).json({ error: 'College not found' });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.put('/api/colleges/:id/faculty', (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const state = getDbState();
        let updatedCol: any = null;
        state.colleges = state.colleges.map((c: any) => {
          if (c.id === id) {
            updatedCol = { ...c, ...updates };
            return updatedCol;
          }
          return c;
        });
        saveDbState(state);
        if (updatedCol) {
          res.json(updatedCol);
        } else {
          res.status(404).json({ error: 'College not found' });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.put('/api/colleges/:id/lms', (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const state = getDbState();
        let updatedCol: any = null;
        state.colleges = state.colleges.map((c: any) => {
          if (c.id === id) {
            updatedCol = { ...c, ...updates };
            return updatedCol;
          }
          return c;
        });
        saveDbState(state);
        if (updatedCol) {
          res.json(updatedCol);
        } else {
          res.status(404).json({ error: 'College not found' });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/weekly-notes', (req, res) => {
      try {
        const state = getDbState();
        const note = req.body;
        const today = new Date().toISOString().split('T')[0];
        const freshNote = {
          ...note,
          id: `n_${Date.now()}`,
          date: today
        };
        state.weeklyNotes = [freshNote, ...state.weeklyNotes];
        saveDbState(state);
        res.json(freshNote);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/weekly-notes/seed-misc', (req, res) => {
      try {
        const state = getDbState();
        const seededNotes = [
          {
            id: `seed_m1_${Date.now()}`,
            type: 'misc',
            content: 'Exploratory presentation delivered on new PG clinical modules across Central colleges.',
            date: new Date().toISOString().split('T')[0],
            year: 2026,
            week: 16
          },
          {
            id: `seed_m2_${Date.now()}`,
            type: 'misc',
            content: 'Academic boards approved regional LMS access standardization protocols.',
            date: new Date().toISOString().split('T')[0],
            year: 2026,
            week: 16
          }
        ];
        state.weeklyNotes = [...seededNotes, ...state.weeklyNotes];
        saveDbState(state);
        res.json(seededNotes);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/visit-logs', (req, res) => {
      try {
        const state = getDbState();
        const log = req.body;
        const freshLog = {
          ...log,
          id: `vl_${Date.now()}`
        };
        state.visitLogs = [freshLog, ...state.visitLogs];
        saveDbState(state);
        res.json(freshLog);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/db/clear', (req, res) => {
      try {
        const state = {
          colleges: [],
          weeklyNotes: [],
          visitLogs: []
        };
        saveDbState(state);
        res.json(state);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/db/reset', (req, res) => {
      try {
        const state = {
          colleges: INITIAL_COLLEGES,
          weeklyNotes: INITIAL_WEEKLY_NOTES,
          visitLogs: INITIAL_VISIT_LOGS
        };
        saveDbState(state);
        res.json(state);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // AI Mock Data Seeder Endpoint
    app.post('/api/seeder/generate', async (req, res) => {
      try {
        const { description, count = 5, fieldsHint } = req.body;

        if (!description) {
          return res.status(400).json({ error: 'Description is required to generate seeding data.' });
        }

        const client = getGeminiClient();
        
        const systemPrompt = `You are an expert Firebase and Firestore database content seeder. 
Generate realistic mock database records based on the user's instructions.
The output MUST be a strict JSON object containing a top-level "records" key, whose value is an array of objects.
Each object represents a single database document/record. 
Avoid generating nested fields unless explicitly asked, keeping document properties flat where appropriate.
Generate creative, diverse, and coherent names, emails, dates, numbers, or statuses. Use realistic mock data, not placeholders.
Your response MUST be valid JSON only. Do not wrap with markdown code blocks in your thoughts.`;

        const userMessage = `I want to generate a mockup collection representing: "${description}".
I need exactly ${count} documents/records.
${fieldsHint ? `Field constraints or preferences to adhere to: ${fieldsHint}` : 'Infer realistic and common fields based on the description.'}

Return the results as a strict JSON object: { "records": [ ... ] }`;

        const aiResponse = await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 1.0,
          },
        });

        const responseText = aiResponse.text;
        if (!responseText) {
          throw new Error('No content returned from Gemini.');
        }

        // Parse JSON from returned text
        const parsedData = JSON.parse(responseText.trim());
        res.json({ records: parsedData.records || [] });

      } catch (error: any) {
        console.error('AI Seeder Error:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'An error occurred during mock data generation.' 
        });
      }
    });

    // AI Schema Consultant Endpoint
    app.post('/api/schema/consult', async (req, res) => {
      try {
        const { collections, selectedCollection } = req.body;

        const client = getGeminiClient();

        const systemPrompt = `You are a Senior Security Architect specializing in Attribute-Based Access Control and Zero-Trust Firestore Security.
Your purpose is to critique a user's collection schemas and recommend production-ready Firestore Security Rules adhering to the Eight Pillars of Hardened Rules.
Provide:
1. An analytical summary of potential security risks with the current schema.
2. A complete and beautiful Firestore match rule block for the requested collection.
Explain cleanly in concise markdown. Ensure human-readable formatting.`;

        const collectionsSummary = Object.keys(collections || {})
          .map(name => {
            const sampleKeys = Object.keys(collections[name][Object.keys(collections[name])[0] || ''] || {});
            return `- Collection "${name}": Fields [${sampleKeys.join(', ')}]`;
          })
          .join('\n');

        const userMessage = `My current database has the following collections:\n${collectionsSummary}

Review and consult security rules specifically for the collection: "${selectedCollection}".
Explain how to validate fields, protect identity spoofing, and provide the exact match {...} block for my firestore.rules file using helper validation functions.`;

        const aiResponse = await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        res.json({ advice: aiResponse.text || 'No advise could be generated.' });

      } catch (error: any) {
        console.error('AI Consultant Error:', error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'An error occurred during schema consulting.' 
        });
      }
    });

    // Serve static assets
    const distPath = path.join(APP_DIR, 'dist');
    app.use(express.static(distPath));

    // SPA fallback - serve index.html for all other routes
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });

    // Global error handler
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Firebase Studio full-stack server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

