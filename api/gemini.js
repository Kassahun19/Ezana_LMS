// api/gemini.js   ← this path works on ANY Vite/React project on Vercel
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gemini failed' });
  }
}

// This line is very important for Vercel
export const config = {
  api: {
    bodyParser: true,
  },
};
