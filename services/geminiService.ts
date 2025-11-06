import { GoogleGenAI } from "@google/genai";

// NOTE: In a production app, the API key should be handled by a backend server.
// For this project, we are initializing the client here, assuming the
// API key is available in the environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getHrInsights = async (prompt: string): Promise<string> => {
  try {
    // FIX: Replace mock API call with a real call to the Gemini API.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an HR assistant. Provide a concise and helpful response based on typical HR knowledge.",
        }
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const getMeetingSummary = async (transcription: string): Promise<string> => {
  if (!transcription.trim()) {
    return "No transcription was provided to summarize.";
  }
  
  try {
    const prompt = `Please provide a concise summary of the following meeting transcription. Structure the summary with these sections: Key Decisions, Action Items (with assigned owners if mentioned), and Main Discussion Points.\n\nTranscription:\n${transcription}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API for summarization:', error);
    return "Sorry, I couldn't summarize the meeting. Please try again.";
  }
};