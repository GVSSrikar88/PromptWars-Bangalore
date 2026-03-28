import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateSystemPrompt, parseGeminiResponse, TriageResponse } from "@utils/intent";
import { google } from "googleapis";

// --- Gemini Client ---
function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

// --- Google Translate Client ---
const translate = google.translate("v2");
const translateAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/cloud-translation"],
});

// --- Google Photos Client ---
const photos = google.photoslibrary("v1");
const photosAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/photoslibrary.appendonly"],
});

// --- Helper: Translate Prompt ---
async function translatePrompt(prompt: string, targetLang = "en"): Promise<string> {
  const authClient = await translateAuth.getClient();
  const res = await translate.translations.list({
    auth: authClient,
    q: prompt,
    target: targetLang,
  });
  return res.data.translations?.[0]?.translatedText || prompt;
}

// --- Helper: Upload Image to Google Photos ---
async function uploadImageToPhotos(base64Image: string, fileName: string) {
  const authClient = await photosAuth.getClient();
  const uploadRes = await photos.mediaItems.batchCreate({
    auth: authClient,
    requestBody: {
      albumId: process.env.GOOGLE_PHOTOS_ALBUM_ID,
      newMediaItems: [
        {
          description: fileName,
          simpleMediaItem: {
            uploadToken: base64Image,
          },
        },
      ],
    },
  });
  return uploadRes.data;
}

// --- API Route ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { intent, prompt, imageBase64 } = body;

    // Step 1: Translate prompt to English
    const translatedPrompt = await translatePrompt(prompt, "en");

    // Step 2: Generate system prompt
    const systemPrompt = generateSystemPrompt(intent, translatedPrompt);

    // Step 3: Call Gemini
    const client = getGeminiClient();
    let resultText: string | null = null;

    try {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(systemPrompt);
      resultText = result.response.text();
    } catch {
      const fallbackModel = client.getGenerativeModel({ model: "gemini-pro" });
      const result = await fallbackModel.generateContent(systemPrompt);
      resultText = result.response.text();
    }

    // Step 4: Parse Gemini response
    const triage: TriageResponse = parseGeminiResponse(resultText);

    // Step 5: Upload image if provided
    let photoUploadResult = null;
    if (imageBase64) {
      photoUploadResult = await uploadImageToPhotos(imageBase64, "intent-upload");
    }

    return NextResponse.json({
      triage,
      translatedPrompt,
      photoUploadResult,
    });
  } catch (error: any) {
    console.error("Error in process-intent route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
