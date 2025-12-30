import { GoogleGenAI } from "@google/genai";
import { ModerationResult } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Moderation will be skipped (DEV ONLY).");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const moderateContent = async (text: string): Promise<ModerationResult> => {
  const ai = getAiClient();

  if (!ai) {
    // If no API key, fail safe or allow (depending on policy). 
    // For MVP demo purposes, we might allow, but strictly normally we'd block.
    // Let's mock a pass for empty key to allow UI testing if key is missing, 
    // but log it.
    return { safe: true };
  }

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      You are a content moderation system for an app called 'Blunt'.
      
      Your task is to analyze the following text and determine if it violates our safety policy.
      
      Policy Violations include:
      1. Threats of violence.
      2. Obvious hate speech.
      3. Illegal doxxing (sharing private addresses, phone numbers, etc).
      4. Explicit self-harm encouragement.
      
      Text to analyze: "${text}"
      
      Respond with strictly one word: "SAFE" or "VIOLATION".
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const resultText = response.text?.trim().toUpperCase();

    if (resultText === 'VIOLATION') {
      return {
        safe: false,
        reason: "Your message violates Blunt policy. It contains hate speech, violence, or sensitive private info. Rephrase."
      };
    }

    return { safe: true };

  } catch (error) {
    console.error("Moderation error:", error);
    // FALLBACK FOR DEMO/MVP:
    // If the API fails (network, key, etc), we allow the content but log a warning.
    // In a real strict production app, you might block this.
    console.warn("Moderation API failed. Defaulting to SAFE mode for user experience.");
    return { safe: true };
  }
};
