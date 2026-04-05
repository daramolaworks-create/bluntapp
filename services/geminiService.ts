import { ModerationResult } from '../types';

// Moderation now runs server-side via the Edge Function
// This keeps the Gemini API key secure (never exposed in the browser)

const EDGE_FUNCTION_URL = import.meta.env.DEV
    ? 'http://localhost:8000'
    : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-blunt`;

export const moderateContent = async (text: string): Promise<ModerationResult> => {
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blunt: {
          content: text,
          recipientNumber: 'moderation-check',
          deliveryMode: 'MODERATE'
        }
      }),
    });

    const data = await response.json();

    if (data.success && data.safe === false) {
      return {
        safe: false,
        reason: data.reason || "Content violation detected."
      };
    }

    return { safe: true };

  } catch (error) {
    console.warn("[Moderation] Server-side moderation unavailable, defaulting to safe:", error);
    return { safe: true };
  }
};
