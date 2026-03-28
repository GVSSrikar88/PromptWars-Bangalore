import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSystemPrompt, parseGeminiResponse, TriageResponse } from '@/utils/triage';

// Initialize Gemini with safety check
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Attempt to generate content with a list of fallback models.
 */
async function generateWithFallback(prompt: string): Promise<{ text: string; modelUsed: string }> {
  if (!genAI) throw new Error("Google Generative AI not initialized.");

  // Priority order of models to try
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.0-pro'
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[VitalBridge] Attempting triage with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      if (responseText) {
        return { text: responseText, modelUsed: modelName };
      }
    } catch (err: any) {
      console.warn(`[VitalBridge] Model ${modelName} failed: ${err.message}`);
      lastError = err;
      continue; // Try the next model
    }
  }

  throw lastError || new Error("All fallback models failed to respond.");
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Payload missing "text" field.' }, { status: 400 });
    }

    if (!genAI) {
      return NextResponse.json({ 
        error: 'Key Mission Failure', 
        message: 'GEMINI_API_KEY is not configured in .env.local' 
      }, { status: 500 });
    }

    const prompt = generateSystemPrompt(text);
    
    // Execute fallback logic
    const { text: responseText, modelUsed } = await generateWithFallback(prompt);
    
    // Parse the unstructured text into a validated TriageResponse
    const structuredData: TriageResponse = parseGeminiResponse(responseText);

    // Attach which model was used for debug/transparency
    return NextResponse.json({
      ...structuredData,
      debug_metadata: { model_version: modelUsed }
    });

  } catch (error: any) {
    console.error('[VitalBridge High Priority Error]:', error);
    
    return NextResponse.json(
      { 
        error: 'Triage Engine Failure', 
        message: 'The AI Triage system is currently under heavy load or misconfigured. Please try again soon.',
        technical_detail: error.message
      },
      { status: 500 }
    );
  }
}
