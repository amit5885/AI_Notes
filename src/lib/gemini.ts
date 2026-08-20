import { GoogleGenerativeAI } from "@google/generative-ai";

export function createGeminiClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
}
