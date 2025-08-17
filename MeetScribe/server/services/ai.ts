import { GoogleGenAI } from "@google/genai";

// Using Google's Gemini AI for meeting summarization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateSummary(transcript: string, customPrompt: string): Promise<string> {
  try {
    const prompt = `${customPrompt}

Please process the following meeting transcript and generate a summary based on the instructions above:

${transcript}

Format the output as clean HTML that can be displayed in a web page. Use appropriate tags like <h3>, <h4>, <ul>, <li>, <p>, <strong> for structure and formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: "You are an expert meeting summarizer. Generate clear, well-structured summaries based on the provided instructions. Always format your response as clean HTML.",
        temperature: 0.3,
        maxOutputTokens: 2000,
      },
      contents: prompt,
    });

    const summary = response.text;
    if (!summary) {
      throw new Error("No summary generated from AI");
    }

    return summary;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const promptTemplates = {
  "Executive Summary Format": "Create an executive summary with key highlights, decisions made, and strategic implications. Format with clear sections and bullet points for easy executive review.",
  "Action Items Only": "Extract only action items, deadlines, and assigned responsibilities. List each item with the person responsible and due date clearly identified.",
  "Project Status Update": "Summarize project progress, milestones achieved, upcoming deliverables, and any blockers or risks identified. Focus on status and next steps.",
  "Key Decisions & Outcomes": "Focus on decisions made during the meeting, outcomes achieved, and next steps. Include any voting results or consensus reached."
};
