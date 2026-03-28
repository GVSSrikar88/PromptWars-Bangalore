import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSystemPrompt, parseGeminiResponse } from '@/utils/triage';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    // Use Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = generateSystemPrompt(text);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const parsedResource = parseGeminiResponse(responseText);

    return NextResponse.json(parsedResource);

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the intent into structured actions.' },
      { status: 500 }
    );
  }
}
