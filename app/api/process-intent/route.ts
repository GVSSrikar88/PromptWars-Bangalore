import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSystemPrompt, parseGeminiResponse, TriageResponse } from '@/utils/triage';

// Initialize Gemini with safety check
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Payload missing "text" field.' }, { status: 400 });
    }

    if (!genAI) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    // Use a fast, efficient model (Gemini 1.5 Flash)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1, // Low temperature for high precision/consistency
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    const prompt = generateSystemPrompt(text);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the unstructured text into a validated TriageResponse
    const structuredData: TriageResponse = parseGeminiResponse(responseText);

    return NextResponse.json(structuredData);

  } catch (error: any) {
    console.error('[VitalBridge API Error]:', error);
    
    // Standardized error message for developer readability
    return NextResponse.json(
      { 
        error: 'Triage Failed', 
        message: error.message || 'Internal server error during intent processing.' 
      },
      { status: 500 }
    );
  }
}
