import type { EmotionScore, LlmMoodResult } from "@/types";

const EMOTION_TO_QUERIES: Record<string, string[]> = {
  joy: ["happy upbeat pop", "feel good songs", "cheerful music playlist"],
  sadness: ["sad emotional songs", "melancholy indie music", "heartbreak ballads"],
  anger: ["angry aggressive metal", "rage rock songs", "hardcore punk music"],
  love: ["romantic love songs", "slow dance ballads", "intimate acoustic"],
  fear: ["calming soothing music", "gentle ambient relaxation", "stress relief sounds"],
  surprise: ["exciting upbeat hits", "energetic dance music", "unexpected genre mix"],
  admiration: ["inspiring anthems", "uplifting orchestral", "motivational songs"],
  amusement: ["fun quirky songs", "feel good comedy music", "lighthearted pop"],
  optimism: ["hopeful uplifting music", "positive energy songs", "bright indie pop"],
  nostalgia: ["classic throwback hits", "vintage oldies music", "retro 80s 90s songs"],
  excitement: ["high energy dance", "pump up workout songs", "festival bangers"],
  gratitude: ["warm acoustic songs", "thankful peaceful music", "gentle folk"],
  desire: ["sensual r&b songs", "late night slow jams", "sultry soul music"],
  caring: ["soft gentle lullabies", "warm comforting songs", "tender acoustic"],
  curiosity: ["eclectic world music", "experimental indie", "unique genre fusion"],
  disappointment: ["bittersweet indie songs", "emotional alternative rock", "somber folk"],
  nervousness: ["calming piano ambient", "gentle meditation music", "soothing nature sounds"],
  grief: ["mourning classical pieces", "sorrowful string music", "gentle grieving songs"],
  pride: ["triumphant anthems", "empowering hip hop", "confident pop hits"],
  relief: ["peaceful chill music", "relaxing ambient sounds", "calm after storm songs"],
  confusion: ["dreamy shoegaze music", "atmospheric ambient", "ethereal soundscapes"],
  remorse: ["reflective acoustic songs", "regretful ballads", "contemplative piano"],
  embarrassment: ["lighthearted indie pop", "quirky feel good", "carefree summer songs"],
  disapproval: ["protest songs rebel music", "angry alternative", "defiant punk rock"],
  annoyance: ["aggressive electronic", "hard hitting beats", "intense industrial"],
  realization: ["introspective singer songwriter", "thoughtful folk rock", "awakening ambient"],
  neutral: ["popular hits mix", "trending songs today", "top charts music"],
};

const EMOTION_TO_SUMMARY: Record<string, string> = {
  joy: "Joyful & Upbeat",
  sadness: "Melancholy & Blue",
  anger: "Fierce & Intense",
  love: "Romantic & Tender",
  fear: "Seeking Calm",
  surprise: "Excited & Energized",
  admiration: "Inspired & Uplifted",
  amusement: "Fun & Lighthearted",
  optimism: "Hopeful & Bright",
  nostalgia: "Nostalgic & Wistful",
  excitement: "Electric & Pumped",
  gratitude: "Warm & Grateful",
  desire: "Yearning & Sensual",
  caring: "Soft & Gentle",
  curiosity: "Exploring & Open",
  disappointment: "Bittersweet & Somber",
  nervousness: "Restless & Uneasy",
  grief: "Heavy & Mourning",
  pride: "Triumphant & Bold",
  relief: "Peaceful & Relieved",
  confusion: "Dreamy & Lost",
  remorse: "Regretful & Reflective",
  embarrassment: "Awkward & Carefree",
  disapproval: "Defiant & Rebellious",
  annoyance: "Agitated & Edgy",
  realization: "Introspective & Awakened",
  neutral: "Balanced & Easy",
};

export function generateFallbackResult(emotions: EmotionScore[]): LlmMoodResult {
  const topEmotion = emotions[0]?.label ?? "neutral";
  const secondEmotion = emotions[1]?.label;

  const queries = [
    ...(EMOTION_TO_QUERIES[topEmotion] ?? EMOTION_TO_QUERIES.neutral),
    ...(secondEmotion ? (EMOTION_TO_QUERIES[secondEmotion] ?? []).slice(0, 2) : []),
  ];

  const summary = EMOTION_TO_SUMMARY[topEmotion] ?? "Mixed Feelings";
  const description = secondEmotion
    ? `A blend of ${topEmotion} and ${secondEmotion} - music to match your complex mood.`
    : `Music curated for your ${topEmotion} mood.`;

  return { summary, queries, description };
}

export function generateKeywordEmotions(text: string): EmotionScore[] {
  const keywords: Record<string, string[]> = {
    joy: ["happy", "joy", "excited", "cheerful", "great", "awesome", "fantastic", "wonderful"],
    sadness: ["sad", "depressed", "down", "blue", "melancholy", "heartbroken", "lonely", "upset"],
    anger: ["angry", "mad", "furious", "rage", "frustrated", "annoyed", "irritated", "livid"],
    love: ["love", "romantic", "intimate", "passionate", "tender", "affectionate", "adore"],
    nostalgia: ["nostalgic", "memories", "past", "remember", "miss", "throwback", "vintage"],
    excitement: ["excited", "thrilled", "pumped", "hyped", "stoked", "eager", "buzzing"],
    fear: ["anxious", "worried", "nervous", "stressed", "overwhelmed", "panic", "tense"],
    optimism: ["hopeful", "positive", "optimistic", "bright", "looking forward", "confident"],
    amusement: ["funny", "laugh", "fun", "silly", "playful", "amused", "entertaining"],
    gratitude: ["grateful", "thankful", "blessed", "appreciate", "fortunate"],
    caring: ["caring", "gentle", "soft", "warm", "comfort", "soothing", "peaceful"],
    curiosity: ["curious", "wondering", "exploring", "discover", "new", "adventure"],
    desire: ["desire", "want", "crave", "yearn", "longing", "wish"],
    pride: ["proud", "accomplished", "triumphant", "victorious", "empowered"],
    neutral: ["okay", "fine", "alright", "normal", "chill", "relaxed", "calm"],
  };

  const lowerText = text.toLowerCase();
  const scores: EmotionScore[] = [];

  for (const [emotion, words] of Object.entries(keywords)) {
    const matchCount = words.filter((w) => lowerText.includes(w)).length;
    if (matchCount > 0) {
      scores.push({ label: emotion, score: Math.min(matchCount * 0.25, 0.95) });
    }
  }

  if (scores.length === 0) {
    scores.push({ label: "neutral", score: 0.5 });
  }

  return scores.sort((a, b) => b.score - a.score);
}
