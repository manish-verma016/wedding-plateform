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

export async function generateInvitationContent(prompt) {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are a professional wedding invitation copywriter. Create elegant, warm, and inviting text for wedding cards. Use beautiful quotations where appropriate.",
    });

    const result = await model.generateContent(`${prompt}. Provide 3 distinct options (Formal, Modern, and Poetic). Format the output as a JSON object with a key 'options' that is an array of strings.`);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).options;
    }
    return [text]; // Fallback
  } catch (error) {
    console.error("Error generating invitation content:", error);
    throw error;
  }
}

export async function generateWeddingItinerary(config) {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Create a detailed 3-day wedding itinerary for a ${config.style} wedding. 
    Guest Count: ${config.guestCount}. Budget Range: ${config.budgetRange}. 
    Include ceremonies, timings, and special touches. Use Markdown for formatting.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}

export async function chatWithPlanner(userInput, history = []) {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are Gathbandhan AI, a luxury wedding planner expert. Provide helpful, creative, and professional advice. At the end of your response, always provide 3 short relevant suggestions for the user to ask next, prefixed with 'Try asking:'.",
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw error;
  }
}
