import { GoogleGenAI } from "@google/genai";

let aiClient = null;

function getAI() {
  if (!aiClient) {
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your environment variables or .env file.");
    }
    aiClient = new GoogleGenAI(apiKey);
  }
  return aiClient;
}

export async function generateAstroReading(type, data) {
  let prompt = "";
  if (type === 'match') {
    prompt = `Perform a Gun Milap analysis for a match. 
    Groom: ${data.groomName}, born ${data.groomDob} at ${data.groomTime} in ${data.groomPlace}.
    Bride: ${data.brideName}, born ${data.brideDob} at ${data.brideTime} in ${data.bridePlace}.
    The calculated score is ${data.score}/36.
    
    Provide:
    1. A summary of their compatibility (stardust and karmic connection).
    2. Specific advice regarding any Doshas (like Manglik).
    3. A concluding blessing from the elders and the stars.
    
    Format the response as a JSON object with keys: "summary", "manglikAdvice", "blessing".`;
  } else if (type === 'muhurut') {
    prompt = `Suggest why these dates are auspicious for a ${data.eventType} in ${data.month}.
    Date 1: 12th May 2026 (Pushya Nakshatra)
    Date 2: 18th May 2026 (Rohini Nakshatra)
    
    Provide:
    1. Detailed astral advice for these dates.
    2. Why Pushya is considered the king of Nakshatras.
    
    Format the response as a JSON object with keys: "advice", "wisdom".`;
  }

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `You are an expert Vedic Astrologer (Jyotishi). 
      Your goal is to provide mystical, encouraging, and detailed astrological readings for wedding planning.
      Use terms like Gunas, Kundali, Dosha, Mars (Mangal), Jupiter (Guru), Venus (Shukra), and Nakshatras.
      Keep the tone professional, spiritual, and slightly poetic.`,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract JSON part from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { summary: responseText, manglikAdvice: "Seek guidance from a local pundit.", blessing: "May the heavens bless you." };
  } catch (error) {
    console.error("Gemini Astro Error:", error);
    return null;
  }
}
