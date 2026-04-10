import { InferenceClient } from "@huggingface/inference";
import type { EmotionScore, MoodAnalysis, MoodKeywords, PrimaryMood, SecondaryMood } from "@/types";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY ?? "");

const EMOTION_TO_MOOD: Record<string, SecondaryMood> = {
  joy: "happy",
  sadness: "sad",
  anger: "angry",
  fear: "anxious",
  surprise: "excited",
  disgust: "frustrated",
  neutral: "calm",
};

const MOOD_STYLES: Record<string, string[]> = {
  happy: ["pop", "upbeat", "dance", "feel-good", "cheerful"],
  sad: ["indie", "melancholy", "acoustic", "emotional", "blues"],
  energetic: ["rock", "electronic", "hip-hop", "pump-up", "high-energy"],
  calm: ["ambient", "classical", "chill", "peaceful", "relaxing"],
  romantic: ["r&b", "soul", "love songs", "intimate", "slow dance"],
  angry: ["metal", "punk", "aggressive", "hardcore", "rage"],
  nostalgic: ["classic rock", "oldies", "throwback", "vintage", "retro"],
  party: ["dance", "electronic", "club", "celebration", "festival"],
  anxious: ["calming", "soothing", "meditation", "stress-relief", "gentle"],
  excited: ["upbeat", "energetic", "celebration", "motivational", "dynamic"],
  frustrated: ["alternative", "grunge", "emotional release", "cathartic", "intense"],
};

export function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ");
}

export async function analyzeWithHuggingFace(text: string): Promise<MoodAnalysis> {
  const sanitized = sanitizeInput(text);

  try {
    const emotionResult = (await hf.textClassification({
      model: "j-hartmann/emotion-english-distilroberta-base",
      inputs: sanitized,
      provider: "hf-inference",
    })) as EmotionScore[];

    const sentimentResult = (await hf.textClassification({
      model: "distilbert-base-uncased-finetuned-sst-2-english",
      inputs: sanitized,
      provider: "hf-inference",
    })) as EmotionScore[];

    const topEmotion = emotionResult[0];
    const topSentiment = sentimentResult[0];

    const primaryMood = (EMOTION_TO_MOOD[topEmotion.label.toLowerCase()] ?? "calm") as PrimaryMood;

    let secondaryMood: SecondaryMood | null = null;
    if (emotionResult.length > 1 && emotionResult[1].score > 0.2) {
      secondaryMood = EMOTION_TO_MOOD[emotionResult[1].label.toLowerCase()] ?? null;
    }

    const intensity = Math.round(topEmotion.score * 10);
    const musicStyles = getMusicStylesForMood(primaryMood, secondaryMood);
    const context = generateContextExplanation(topEmotion, topSentiment, emotionResult);

    return {
      mood: primaryMood,
      secondaryMood,
      intensity,
      confidence: topEmotion.score,
      context,
      musicStyles,
      rawEmotions: emotionResult,
      rawSentiment: sentimentResult,
      method: "huggingface-emotion-analysis",
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server-side error logging
    console.error("Hugging Face analysis failed:", error);
    return fallbackMoodAnalysis(sanitized);
  }
}

function getMusicStylesForMood(primaryMood: string, secondaryMood: string | null): string[] {
  let styles = MOOD_STYLES[primaryMood] ?? ["general", "popular"];

  if (secondaryMood && MOOD_STYLES[secondaryMood]) {
    styles = [...styles, ...MOOD_STYLES[secondaryMood].slice(0, 2)];
  }

  return [...new Set(styles)].slice(0, 5);
}

function generateContextExplanation(
  topEmotion: EmotionScore,
  topSentiment: EmotionScore,
  allEmotions: EmotionScore[],
): string {
  const emotionName = topEmotion.label.toLowerCase();
  const confidence = Math.round(topEmotion.score * 100);
  const sentimentName = topSentiment.label.toLowerCase();

  let explanation = `Detected ${emotionName} with ${confidence}% confidence`;

  if (sentimentName !== "neutral") {
    explanation += `, with ${sentimentName} sentiment`;
  }

  const significantEmotions = allEmotions.filter((e) => e.score > 0.15 && e !== topEmotion);
  if (significantEmotions.length > 0) {
    const secondaryNames = significantEmotions.map((e) => e.label.toLowerCase()).join(", ");
    explanation += `. Also detected traces of ${secondaryNames}`;
  }

  return `${explanation}.`;
}

function fallbackMoodAnalysis(text: string): MoodAnalysis {
  // biome-ignore lint/suspicious/noConsole: server-side diagnostic logging
  console.error("Using fallback mood analysis");

  const advancedMoodKeywords: Record<string, MoodKeywords> = {
    happy: {
      keywords: [
        "happy",
        "joy",
        "excited",
        "cheerful",
        "upbeat",
        "positive",
        "great",
        "awesome",
        "fantastic",
        "wonderful",
        "thrilled",
        "elated",
        "euphoric",
        "delighted",
        "ecstatic",
      ],
      phrases: [
        "feeling good",
        "on cloud nine",
        "over the moon",
        "walking on air",
        "bright side",
        "good vibes",
      ],
      weight: 2,
    },
    sad: {
      keywords: [
        "sad",
        "depressed",
        "down",
        "blue",
        "melancholy",
        "heartbroken",
        "lonely",
        "upset",
        "disappointed",
        "grief",
        "sorrow",
        "miserable",
        "devastated",
      ],
      phrases: [
        "feeling down",
        "heavy heart",
        "breaking apart",
        "tears in my eyes",
        "can't stop crying",
        "feel empty",
      ],
      weight: 2,
    },
    energetic: {
      keywords: [
        "energetic",
        "pumped",
        "hyped",
        "active",
        "motivated",
        "powerful",
        "strong",
        "intense",
        "dynamic",
        "charged",
        "fired up",
        "amped",
      ],
      phrases: [
        "ready to conquer",
        "full of energy",
        "pumped up",
        "ready to go",
        "bring it on",
        "let's do this",
      ],
      weight: 2,
    },
    calm: {
      keywords: [
        "calm",
        "peaceful",
        "relaxed",
        "chill",
        "serene",
        "tranquil",
        "mellow",
        "zen",
        "quiet",
        "gentle",
        "soothing",
        "restful",
      ],
      phrases: ["at peace", "feeling zen", "nice and calm", "totally relaxed", "inner peace"],
      weight: 2,
    },
    romantic: {
      keywords: [
        "romantic",
        "love",
        "intimate",
        "passionate",
        "tender",
        "affectionate",
        "sweet",
        "loving",
        "adore",
        "cherish",
      ],
      phrases: ["in love", "romantic mood", "date night", "feeling romantic", "love is in the air"],
      weight: 2,
    },
    angry: {
      keywords: [
        "angry",
        "mad",
        "furious",
        "rage",
        "frustrated",
        "annoyed",
        "irritated",
        "pissed",
        "livid",
        "outraged",
        "enraged",
      ],
      phrases: ["so angry", "can't stand", "fed up", "had enough", "boiling mad", "seeing red"],
      weight: 2,
    },
    anxious: {
      keywords: [
        "anxious",
        "worried",
        "nervous",
        "stressed",
        "overwhelmed",
        "panic",
        "tense",
        "restless",
        "uneasy",
        "concerned",
      ],
      phrases: [
        "can't stop thinking",
        "butterflies in stomach",
        "on edge",
        "stressed out",
        "freaking out",
      ],
      weight: 2,
    },
    nostalgic: {
      keywords: [
        "nostalgic",
        "memories",
        "past",
        "remember",
        "miss",
        "throwback",
        "vintage",
        "old times",
        "reminiscing",
      ],
      phrases: [
        "good old days",
        "back in the day",
        "miss those times",
        "thinking about",
        "remember when",
      ],
      weight: 2,
    },
    party: {
      keywords: [
        "party",
        "dance",
        "celebration",
        "fun",
        "wild",
        "crazy",
        "festive",
        "club",
        "nightlife",
        "celebrate",
      ],
      phrases: ["party time", "let's celebrate", "ready to party", "dance all night", "good times"],
      weight: 2,
    },
    excited: {
      keywords: [
        "excited",
        "thrilled",
        "anticipating",
        "eager",
        "enthusiastic",
        "stoked",
        "psyched",
        "buzzing",
      ],
      phrases: ["so excited", "can't wait", "really looking forward", "super stoked"],
      weight: 2,
    },
  };

  let detectedMood: PrimaryMood = "calm";
  let maxScore = 0;
  let matchedKeywords: string[] = [];

  const lowerText = text.toLowerCase();

  for (const [mood, patterns] of Object.entries(advancedMoodKeywords)) {
    let score = 0;
    const currentMatches: string[] = [];

    for (const keyword of patterns.keywords) {
      if (lowerText.includes(keyword)) {
        score += patterns.weight;
        currentMatches.push(keyword);
      }
    }

    for (const phrase of patterns.phrases) {
      if (lowerText.includes(phrase)) {
        score += patterns.weight + 1;
        currentMatches.push(phrase);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood as PrimaryMood;
      matchedKeywords = currentMatches;
    }
  }

  const confidence = maxScore > 0 ? Math.min(maxScore * 0.15, 0.85) : 0.3;

  return {
    mood: detectedMood,
    secondaryMood: null,
    intensity: Math.min(maxScore + 3, 10),
    confidence,
    context: `Detected using keyword matching. Found: ${matchedKeywords.join(", ") || "general mood indicators"}`,
    musicStyles: getMusicStylesForMood(detectedMood, null),
    method: "fallback-enhanced-keywords",
  };
}
