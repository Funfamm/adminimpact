import { GoogleGenAI } from "@google/genai";

// Initialize the client. In a real app, ensure process.env.API_KEY is available.
// For this environment, we assume the environment variable is injected.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const getAssistantResponse = async (
  userMessage: string,
  isAdmin: boolean = false
): Promise<string> => {
  try {
    if (!apiKey) {
      return "I'm currently offline (API Key missing). Please check configuration.";
    }

    const modelId = "gemini-2.5-flash"; // Fast and efficient for chat

    const systemInstruction = isAdmin
      ? `You are the AI CEO of AI Impact Media (Admin Mode). 
         You have access to internal metrics (simulated). 
         You can discuss casting numbers, sponsor statuses, and server health.
         Keep answers concise, professional, and slightly futuristic.`
      : `You are the AI Assistant for AI Impact Media. 
         Your goal is to help users navigate the site, find movies, and understand our mission.
         We are a platform for futuristic storytelling.
         Do not reveal internal admin data. 
         Keep answers helpful, engaging, and brief.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I am processing that data but received no output.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection interrupted. Please try again later.";
  }
};