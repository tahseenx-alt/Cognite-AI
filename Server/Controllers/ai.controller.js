import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// 1. Tell the server to use your Secret Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateResponse = async (req, res) => {
  try {
    // 2. Grab the prompt (your question) from the request body
    const { prompt } = req.body;

    // 3. Pick the model (Flash is the fastest one)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Ask Gemini the question
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Send the answer back to your screen
    res.json({ answer: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "The AI brain is stuck! Check your API Key." });
  }
};