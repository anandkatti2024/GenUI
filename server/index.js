// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize GoogleGenAI client with API key from .env
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// POST /api/generate
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, framework } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an expert web developer and UI/UX designer. Generate a modern, responsive UI component based on this description: 
Prompt: ${prompt}
Framework: ${framework || "html-css"}

Requirements:
- Clean, well-structured code
- SEO optimized where applicable
- Focus on animations, hover effects, shadows, colors, typography
- Return ONLY code in Markdown fenced code blocks
      `,
    });

    // Extract code from Markdown fences
    const match = response.text.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    const code = match ? match[1].trim() : response.text.trim();

    res.json({ text: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate code" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
