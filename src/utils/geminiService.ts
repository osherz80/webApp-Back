import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRecommendationPrompt } from './prompts';

export const generateBookRecommendations = async (bookContext: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = getRecommendationPrompt(bookContext);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
        return JSON.parse(responseText);
    } catch (parseError) {
        console.error('Error parsing JSON from Gemini:', parseError);
        throw new Error('Failed to parse AI recommendations');
    }
};
