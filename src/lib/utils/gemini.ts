import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { DataSummary } from "./data-analyzer";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function fetchAIInsights(summary: DataSummary) {
  if (!GEMINI_API_KEY) {
    return {
      keyInsights: ["Gemini API Key is missing..."],
      risks: ["System running in demo mode."],
      recommendations: ["Configure your API environment variables."],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // const models = await genAI.listModels();
    // console.log(models);

    // Using 1.5 Flash is smart—it's fast and cheap (or free)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            keyInsights: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            risks: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            recommendations: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["keyInsights", "risks", "recommendations"],
        },
      },
    });

    const prompt = `
      You are a business data analyst.
Analyze the following summarized dataset and provide:

1. Key insights (3-5 points)
2. Risks or warnings (1-2 points)
3. Actionable recommendations (2-3 points)

Keep the explanation simple and business-friendly.
Avoid technical terms.

DATA:
${JSON.stringify(summary, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean the text just in case Gemini adds markdown formatting
    const cleanedText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return the same structure so the UI doesn't break
    return {
      keyInsights: ["Error connecting to AI."],
      risks: ["Check API Quota/Key."],
      recommendations: ["Retry in 60 seconds."],
    };
  }
}
