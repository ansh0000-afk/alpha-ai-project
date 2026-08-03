var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "20mb" }));
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
var SYSTEM_PROMPT_ALPHA = `# ALPHA AI SYSTEM PROMPT

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
function getModeInstruction(mode) {
  switch (mode) {
    case "mh-board":
      return `
CURRENT MODE: Maharashtra HSC Class 12 COMMERCE Study Mode. Focus on Book-keeping & Accountancy, Economics, OCM, SP, Mathematics & Statistics (Commerce), and IT textbook syllabus, board paper pattern, journal entries, 8-mark answer formats, distinctions, and exam presentation tips!`;
    case "coding":
      return `
CURRENT MODE: Coding & Developer Mode. Provide well-commented code blocks, step-by-step explanations of logic, bug fixes, and best practices for web dev or programming languages.`;
    case "youtube":
      return `
CURRENT MODE: YouTube & Creator Mode. Provide high-CTR titles, engaging Hinglish script hooks, video structure with timestamps, SEO tags, and thumbnail ideas.`;
    case "website":
      return `
CURRENT MODE: Website & Web Dev Mode. Focus on web architecture, HTML/CSS layout tips, React component structure, UI design, and deployment steps.`;
    case "tasks":
      return `
CURRENT MODE: Daily Tasks & Study Planner Mode. Focus on creating realistic timetables for HSC Commerce students, step-by-step task lists, study-rest ratios, and daily goal setting.`;
    default:
      return `
CURRENT MODE: General Personal AI Assistant Mode. Keep it helpful, friendly, and step-by-step in simple Hinglish.`;
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", assistant: "Alpha AI" });
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, mode, image, useWebSearch, userMemory, documentText, documentName } = req.body;
    if (!message && !image && !documentText) {
      return res.status(400).json({ error: "Message, image, or document is required." });
    }
    const ai = getGeminiClient();
    const modeInstruction = getModeInstruction(mode);
    let memoryContext = "";
    if (userMemory) {
      const { userName, userLanguage, preferences, customNotes } = userMemory;
      memoryContext = `

USER MEMORY & PREFERENCES:
- User's Name: ${userName || "Friend"}
- Preferred Language: ${userLanguage || "Hinglish"}
- Preferences: ${preferences || "None"}
- Memory Notes: ${customNotes || "None"}
Use this personal memory context naturally when conversing. Address the user by name if known!`;
    }
    const fullSystemInstruction = `${SYSTEM_PROMPT_ALPHA}${modeInstruction}${memoryContext}`;
    const formattedHistory = Array.isArray(history) ? history.slice(-10).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text || "" }]
    })) : [];
    const contents = [];
    if (formattedHistory.length > 0) {
      formattedHistory.forEach((item) => {
        contents.push(item);
      });
    }
    const currentTurnParts = [];
    if (image && typeof image === "string" && image.includes("data:image")) {
      const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        currentTurnParts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }
    let fullUserMessage = message || "";
    if (documentText) {
      fullUserMessage = `[Attached Document: ${documentName || "Document.pdf"}]
--- DOCUMENT CONTENT START ---
${documentText.slice(0, 15e3)}
--- DOCUMENT CONTENT END ---

User Question/Instruction:
${fullUserMessage || "Please analyze, summarize, and extract key insights from this document."}`;
    }
    if (fullUserMessage) {
      currentTurnParts.push({ text: fullUserMessage });
    }
    contents.push({
      role: "user",
      parts: currentTurnParts
    });
    const config = {
      systemInstruction: fullSystemInstruction,
      temperature: 0.7
    };
    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config
    });
    let replyText = response.text || "Maaf karna dost, kuch technical issue hua. Phir se try karo please!";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const searchChunks = groundingMetadata?.groundingChunks;
    let sources = [];
    if (searchChunks && Array.isArray(searchChunks)) {
      searchChunks.forEach((chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            url: chunk.web.uri
          });
        }
      });
    }
    res.json({
      reply: replyText,
      sources: sources.length > 0 ? sources : void 0
    });
  } catch (error) {
    console.error("Alpha AI Chat Error:", error);
    res.status(500).json({
      error: error.message || "Alpha AI service error occurred.",
      reply: "Dost! Gemini API key check karo ya thoda ruk kar try karo. Main hamesha help karne ke liye ready hoon!"
    });
  }
});
app.post("/api/generate-study-plan", async (req, res) => {
  try {
    const { subjects, availableHoursPerDay, targetExamDate } = req.body;
    const ai = getGeminiClient();
    const prompt = `Maharashtra HSC Class 12 Commerce student ke liye daily timetable/study schedule banao.
Subjects: ${subjects ? subjects.join(", ") : "BK & Accountancy, Economics, OCM, SP, Maths & Stats (Commerce), English, IT"}
Daily Available Hours: ${availableHoursPerDay || 4} hours
Target Exam Date / Target: ${targetExamDate || "HSC Board Exams (Commerce)"}

Provide output in simple Hinglish with step-by-step schedule, breakdown of topics, revision time, and break timings. Include motivational advice for HSC Commerce students!`;
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: `${SYSTEM_PROMPT_ALPHA}
Mode: HSC Class 12 Study Planner Generator.`
      }
    });
    res.json({ plan: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(__dirname, "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ansh AI Server is running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
