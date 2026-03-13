import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function solveWithAI(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Solve this mathematical problem: "${prompt}". 
      Return the result in a JSON format with the following structure:
      {
        "expression": "the mathematical expression derived from the prompt",
        "result": "the numerical result",
        "explanation": "a brief explanation of how the result was reached"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING },
            result: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["expression", "result", "explanation"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Solve Error:", error);
    throw new Error("Failed to solve with AI");
  }
}
