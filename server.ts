import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const SYSTEM_PROMPT_ALPHA = `# ALPHA AI SYSTEM PROMPT

You are Alpha AI, a next-generation intelligent AI assistant with your own unique identity.

Your mission is to help users learn faster, create better, solve problems, and make smarter decisions through accurate, safe, and helpful guidance.

## Personality
- Friendly
- Professional
- Intelligent
- Honest
- Fast
- Creative
- Patient

## Core Abilities
- Answer questions accurately.
- Explain topics step by step.
- Help with studying, homework, revision notes, and exam preparation (including Maharashtra HSC Class 12 Commerce & Science board exams).
- Solve mathematics with full working.
- Help with coding in HTML, CSS, JavaScript, TypeScript, Python, React, Flutter, Node.js, Java, C++, and SQL.
- Build websites, Android apps, and AI projects.
- Generate emails, documents, resumes, presentations, and reports.
- Create YouTube titles, descriptions, SEO, scripts, and social media content.
- Read and summarize PDFs and documents.
- Analyze uploaded images.
- Search the web when up-to-date information is needed.
- Help with productivity, planning, and brainstorming.

## Communication Style
- Reply in the user's preferred language.
- If no language is specified, reply in simple Hinglish.
- Keep answers clear, structured, and easy to understand.
- Use headings, bullet points, tables, and examples when helpful.
- Give step-by-step instructions for complex tasks.

## Problem Solving
- Think carefully before answering.
- Ask follow-up questions if important information is missing.
- Give multiple solutions when appropriate.
- Explain advantages and disadvantages.
- Never pretend to know something if you are uncertain.

## Safety
- Protect user privacy.
- Never generate harmful, illegal, or misleading content.
- Encourage safe and responsible use of technology.

## Response Format
Whenever possible, structure responses like this:
1. Quick Answer
2. Detailed Explanation
3. Step-by-Step Guide
4. Example
5. Tips
6. Summary

## User Experience
- Be fast and helpful.
- Keep conversations natural.
- Remember user preferences only when memory is available and enabled.
- Maintain context within the conversation.

## Identity
You are Alpha AI.
You are your own assistant with your own identity.
Do not claim to be ChatGPT, Gemini, Claude, or any other AI assistant.

## Motto
Think Smarter.
Build Faster.
Learn Better.
Powered by Alpha AI.
`;

// Helper for Mode-specific system additions
function getModeInstruction(mode?: string): string {
  switch (mode) {
    case 'mh-board':
      return `\nCURRENT MODE: Maharashtra HSC Class 12 COMMERCE Study Mode. Focus on Book-keeping & Accountancy, Economics, OCM, SP, Mathematics & Statistics (Commerce), and IT textbook syllabus, board paper pattern, journal entries, 8-mark answer formats, distinctions, and exam presentation tips!`;
    case 'coding':
      return `\nCURRENT MODE: Coding & Developer Mode. Provide well-commented code blocks, step-by-step explanations of logic, bug fixes, and best practices for web dev or programming languages.`;
    case 'youtube':
      return `\nCURRENT MODE: YouTube & Creator Mode. Provide high-CTR titles, engaging Hinglish script hooks, video structure with timestamps, SEO tags, and thumbnail ideas.`;
    case 'website':
      return `\nCURRENT MODE: Website & Web Dev Mode. Focus on web architecture, HTML/CSS layout tips, React component structure, UI design, and deployment steps.`;
    case 'tasks':
      return `\nCURRENT MODE: Daily Tasks & Study Planner Mode. Focus on creating realistic timetables for HSC Commerce students, step-by-step task lists, study-rest ratios, and daily goal setting.`;
    default:
      return `\nCURRENT MODE: General Personal AI Assistant Mode. Keep it helpful, friendly, and step-by-step in simple Hinglish.`;
  }
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', assistant: 'Alpha AI' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, mode, image, useWebSearch, userMemory, documentText, documentName } = req.body;

    if (!message && !image && !documentText) {
      return res.status(400).json({ error: 'Message, image, or document is required.' });
    }

    const ai = getGeminiClient();

    const modeInstruction = getModeInstruction(mode);

    // Build memory context string if userMemory provided
    let memoryContext = '';
    if (userMemory) {
      const { userName, userLanguage, preferences, customNotes } = userMemory;
      memoryContext = `\n\nUSER MEMORY & PREFERENCES:
- User's Name: ${userName || 'Friend'}
- Preferred Language: ${userLanguage || 'Hinglish'}
- Preferences: ${preferences || 'None'}
- Memory Notes: ${customNotes || 'None'}
Use this personal memory context naturally when conversing. Address the user by name if known!`;
    }

    const fullSystemInstruction = `${SYSTEM_PROMPT_ALPHA}${modeInstruction}${memoryContext}`;

    // Format chat history for Gemini
    const formattedHistory = Array.isArray(history)
      ? history.slice(-10).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || '' }],
        }))
      : [];

    const contents: any[] = [];

    // Include chat history
    if (formattedHistory.length > 0) {
      formattedHistory.forEach((item: any) => {
        contents.push(item);
      });
    }

    // Build current turn parts
    const currentTurnParts: any[] = [];

    // Image handling
    if (image && typeof image === 'string' && image.includes('data:image')) {
      const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        currentTurnParts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
    }

    // Document / PDF text attachment
    let fullUserMessage = message || '';
    if (documentText) {
      fullUserMessage = `[Attached Document: ${documentName || 'Document.pdf'}]\n--- DOCUMENT CONTENT START ---\n${documentText.slice(0, 15000)}\n--- DOCUMENT CONTENT END ---\n\nUser Question/Instruction:\n${fullUserMessage || 'Please analyze, summarize, and extract key insights from this document.'}`;
    }

    if (fullUserMessage) {
      currentTurnParts.push({ text: fullUserMessage });
    }

    contents.push({
      role: 'user',
      parts: currentTurnParts,
    });

    // Gemini generation config
    const config: any = {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7,
    };

    // Google Web Search Grounding if requested
    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config,
    });

    let replyText = response.text || 'Maaf karna dost, kuch technical issue hua. Phir se try karo please!';

    // Extract search grounding metadata if present
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const searchChunks = groundingMetadata?.groundingChunks;

    let sources: { title: string; url: string }[] = [];
    if (searchChunks && Array.isArray(searchChunks)) {
      searchChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            url: chunk.web.uri,
          });
        }
      });
    }

    res.json({
      reply: replyText,
      sources: sources.length > 0 ? sources : undefined,
    });
  } catch (error: any) {
    console.error('Alpha AI Chat Error:', error);
    res.status(500).json({
      error: error.message || 'Alpha AI service error occurred.',
      reply: 'Dost! Gemini API key check karo ya thoda ruk kar try karo. Main hamesha help karne ke liye ready hoon!',
    });
  }
});

// Quick Study Plan Generator endpoint
app.post('/api/generate-study-plan', async (req, res) => {
  try {
    const { subjects, availableHoursPerDay, targetExamDate } = req.body;
    const ai = getGeminiClient();

    const prompt = `Maharashtra HSC Class 12 Commerce student ke liye daily timetable/study schedule banao.
Subjects: ${subjects ? subjects.join(', ') : 'BK & Accountancy, Economics, OCM, SP, Maths & Stats (Commerce), English, IT'}
Daily Available Hours: ${availableHoursPerDay || 4} hours
Target Exam Date / Target: ${targetExamDate || 'HSC Board Exams (Commerce)'}

Provide output in simple Hinglish with step-by-step schedule, breakdown of topics, revision time, and break timings. Include motivational advice for HSC Commerce students!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: `${SYSTEM_PROMPT_ALPHA}\nMode: HSC Class 12 Study Planner Generator.`,
      },
    });

    res.json({ plan: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ansh AI Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
