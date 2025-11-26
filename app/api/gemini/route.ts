// app/api/gemini/route.ts
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30; // Allows longer Gemini calls on Vercel

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "No prompt" }), {
      status: 400,
    });
  }

  try {
    const result = await streamText({
      model: google("gemini-1.5-flash"), // Fast & free
      // model: google('gemini-1.5-pro'), // Use this later if you want smarter answers
      prompt,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
