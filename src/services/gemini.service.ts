import { GenerateContentResult, GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (prompt: string, dynamicModel?: string, catchRetry = true): Promise<GenerateContentResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: dynamicModel || process.env.GEMINI_MODEL || "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    try {
        const result = await model.generateContent(prompt);
        return result;
    } catch (error: any) {
        console.error('Error from Gemini:', error);
        if (catchRetry && (error.status === 503 || error.status === 429)) {
            return await askGemini(prompt, "gemini-2.5-flash-lite", false);
        }
        throw new Error('Failed to get response from Gemini');
    }
};
