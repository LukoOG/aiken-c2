
import { GoogleGenAI, Type } from "@google/genai";
import { SourceLanguage, TranspilationResult } from "../types";
import { AIKEN_SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async transpile(sourceCode: string, language: SourceLanguage): Promise<TranspilationResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Transpile the following ${language} code into Aiken:\n\n${sourceCode}`,
        config: {
          systemInstruction: AIKEN_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aikenCode: { type: Type.STRING },
              explanation: { type: Type.STRING },
              errors: { type: Type.STRING }
            },
            required: ["aikenCode", "explanation"]
          },
          temperature: 0.2, // Low temperature for consistent code generation
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from model");
      
      return JSON.parse(text) as TranspilationResult;
    } catch (error) {
      console.error("Transpilation failed:", error);
      return {
        aikenCode: "",
        explanation: "",
        errors: error instanceof Error ? error.message : "An unknown error occurred during transpilation."
      };
    }
  }
}

export const geminiService = new GeminiService();
