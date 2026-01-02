import { DataSummary } from './data-analyzer';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function fetchAIInsights(summary: DataSummary) {
  if (!GEMINI_API_KEY) {
    return {
      keyInsights: ["Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file to enable real AI insights."],
      risks: ["System running in demo/offline mode."],
      recommendations: ["Configure your API environment variables."]
    };
  }

  const prompt = `
You are a business data analyst.

Analyze the following summarized dataset and provide:
1. Key insights (3-5 points)
2. Risks or warnings (1-2 points)
3. Actionable recommendations (2-3 points)

Keep the explanation simple and business-friendly.
Avoid technical terms.

Return the result as a JSON object with the following structure:
{
  "keyInsights": ["string"],
  "risks": ["string"],
  "recommendations": ["string"]
}

DATA:
${JSON.stringify(summary, null, 2)}
`;

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.candidates[0].content.parts[0].text;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      keyInsights: ["Failed to generate insights from AI. Please try again later."],
      risks: ["AI service disruption."],
      recommendations: ["Contact support or check your internet connection."]
    };
  }
}
