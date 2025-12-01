import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;
let dynamicApiKey: string | null = null;

export const setDynamicApiKey = (key: string) => {
  dynamicApiKey = key;
  genAI = null; // Reset instance to force recreation
  chatSession = null; // Reset session
};

const getAI = () => {
  if (!genAI) {
    const key = dynamicApiKey || process.env.API_KEY;
    if (!key) {
      throw new Error("API_KEY not found. Please set it in settings.");
    }
    genAI = new GoogleGenAI({ apiKey: key });
  }
  return genAI;
};

export const testConnection = async (key: string): Promise<boolean> => {
  try {
    const tempAI = new GoogleGenAI({ apiKey: key });
    // Use a lightweight call to verify the key
    await tempAI.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: "Test connection",
    });
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const initChat = async (): Promise<string> => {
  const ai = getAI();
  
  // Create a new chat session with the heavy system instruction
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview', // High intelligence model for complex RPG logic
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 1, // High creativity for "emergent personhood"
      topK: 64,
      topP: 0.95,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    },
  });

  try {
    const response = await chatSession.sendMessage({
      message: "시스템을 초기화하고 GM 페르소나 선택과 캐릭터 프리셋을 보여주세요."
    });
    return response.text || "시스템 초기화 오류";
  } catch (error) {
    console.error("Failed to init chat", error);
    throw error; // Re-throw to handle in UI
  }
};

export const sendMessage = async (userMessage: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const response = await chatSession.sendMessage({
      message: userMessage
    });
    return response.text || "응답 없음";
  } catch (error) {
    console.error("SendMessage Error", error);
    return "통신 오류가 발생했습니다. (Safety Filter Triggered or Network Error)";
  }
};