import { InferenceClient } from "@huggingface/inference";
import type { EmotionScore } from "@/types";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY ?? "");

const EMOTION_MODEL = "SamLowe/roberta-base-go_emotions";

export async function analyzeEmotions(text: string): Promise<EmotionScore[]> {
  const result = (await hf.textClassification({
    model: EMOTION_MODEL,
    inputs: text,
    provider: "hf-inference",
  })) as EmotionScore[];

  return result.sort((a, b) => b.score - a.score);
}
