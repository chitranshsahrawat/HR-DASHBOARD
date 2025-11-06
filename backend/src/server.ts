
// NOTE: This is a sample backend file and is not executed in this frontend-only environment.
// It demonstrates the intended full-stack architecture.

import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Check for API key
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- API Endpoints ---

// Placeholder for employee data endpoints
app.get('/api/employees', (req: Request, res: Response) => {
  res.json({ message: 'Get all employees (placeholder)' });
});

app.post('/api/employees', (req: Request, res: Response) => {
  res.json({ message: 'Create new employee (placeholder)', data: req.body });
});

// Placeholder for project data endpoints
app.get('/api/projects', (req: Request, res: Response) => {
  res.json({ message: 'Get all projects (placeholder)' });
});

// Gemini API endpoint for the chat feature
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Example of a simple text generation call
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an HR assistant. The user is asking: "${prompt}". Provide a concise and helpful response based on typical HR knowledge.`,
    });

    res.json({ response: response.text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI model' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
