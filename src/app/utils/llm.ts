import { InferenceClient } from "@huggingface/inference";
import type { EmotionScore, LlmMoodResult } from "@/types";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY ?? "");

const LLM_MODELS = [
  "Qwen/Qwen2.5-7B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

function buildPrompt(userText: string, emotions: EmotionScore[]): string {
  const topEmotions = emotions
    .slice(0, 8)
    .map((e) => `${e.label}: ${(e.score * 100).toFixed(1)}%`)
    .join(", ");

  return `You are a music curator AI. Given a user's mood description and their detected emotions, respond with ONLY valid JSON (no markdown, no explanation).

User's mood: "${userText}"
Detected emotions: ${topEmotions}

Respond with this exact JSON structure:
{"summary": "2-4 word mood label like Nostalgic & Bittersweet", "queries": ["5-8 Spotify search queries that find music matching this exact mood, be specific and creative like golden hour indie folk or melancholy piano ambient"], "description": "One sentence describing the playlist vibe"}`;
}

function parseResponse(text: string): LlmMoodResult | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.queries) ||
      typeof parsed.description !== "string" ||
      parsed.queries.length === 0
    ) {
      return null;
    }

    return {
      summary: parsed.summary.slice(0, 50),
      queries: parsed.queries.slice(0, 8).map((q: unknown) => String(q).slice(0, 100)),
      description: parsed.description.slice(0, 200),
    };
  } catch {
    return null;
  }
}

export async function generateMoodAndQueries(
  userText: string,
  emotions: EmotionScore[],
): Promise<LlmMoodResult | null> {
  const prompt = buildPrompt(userText, emotions);

  for (const model of LLM_MODELS) {
    try {
      let fullResponse = "";

      const stream = hf.chatCompletionStream({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) fullResponse += delta;
      }

      const result = parseResponse(fullResponse);
      if (result) return result;

      console.error(`LLM ${model} returned unparseable response`);
    } catch (error) {
      console.error(`LLM ${model} failed:`, error);
    }
  }

  return null;
}
