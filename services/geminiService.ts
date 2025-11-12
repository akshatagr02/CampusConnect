
import { GoogleGenAI, Type } from "@google/genai";

export const generateSkills = async (interests: string): Promise<string[]> => {
  // Per instructions, we assume API_KEY is present in the environment.
  // The SDK will throw an error if it's missing, which will be caught below,
  // providing more accurate feedback to the user than returning default skills.
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // A concise prompt for the model. The JSON structure is defined in the responseSchema.
    const prompt = `Based on the following interests, suggest 5 relevant professional skills: ${interests}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A professional skill"
              }
            }
          },
          required: ["skills"]
        }
      }
    });

    let jsonString = response.text.trim();
    
    // The model can sometimes wrap the JSON response in markdown backticks.
    // This cleaning step makes the parsing more robust.
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    const result = JSON.parse(jsonString);
    
    if (result.skills && Array.isArray(result.skills)) {
      return result.skills;
    }
    
    console.warn("AI response was valid JSON but did not match expected schema:", result);
    return [];
  } catch (error) {
    console.error("Error generating skills with Gemini:", error);
    // Provide a user-facing error message as a skill tag
    return ["AI suggestion failed. Please add skills manually."];
  }
};