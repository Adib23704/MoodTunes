# MoodTunes TypeScript Migration, Biome Setup & Improvements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert MoodTunes from JavaScript to TypeScript, replace ESLint with Biome, fix bugs, and apply architectural improvements.

**Architecture:** Big-bang migration of all ~10 source files to TypeScript in a single branch. Shared types in a central `types/index.ts`. Biome replaces ESLint for linting+formatting. Bug fixes and improvements applied during the conversion pass.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Biome 2, Tailwind CSS 4, Framer Motion 12, Hugging Face Inference SDK, Spotify Web API

**Spec:** `docs/superpowers/specs/2026-04-10-typescript-migration-design.md`

---

## File Structure

### New Files
- `tsconfig.json` — TypeScript compiler config (strict mode)
- `biome.json` — Biome linter/formatter config
- `src/app/types/index.ts` — shared type definitions
- `src/app/utils/rateLimit.ts` — in-memory rate limiter utility

### Modified Files (renamed .js -> .ts/.tsx + typed)
- `next.config.ts` (was `next.config.js`)
- `tailwind.config.ts` (was `tailwind.config.js`)
- `postcss.config.mjs` (was `postcss.config.js`)
- `src/app/layout.tsx` (was `layout.js`)
- `src/app/page.tsx` (was `page.js`)
- `src/app/components/Header.tsx` (was `Header.js`)
- `src/app/components/MoodInput.tsx` (was `MoodInput.js`)
- `src/app/components/PlaylistDisplay.tsx` (was `PlaylistDisplay.js`)
- `src/app/components/LoadingSpinner.tsx` (was `LoadingSpinner.js`)
- `src/app/api/analyze-mood/route.ts` (was `route.js`)
- `src/app/api/generate-playlist/route.ts` (was `route.js`)
- `src/app/utils/huggingFaceMoodAnalyzer.ts` (was `.js`)
- `src/app/utils/spotify.ts` (was `.js`)

### Deleted Files
- `src/app/utils/moodAnalyzer.js` — dead code
- `eslint.config.mjs` — replaced by Biome
- `jsconfig.json` — replaced by `tsconfig.json`

---

## Task 1: Install Dependencies & Config Files

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `biome.json`
- Delete: `eslint.config.mjs`
- Delete: `jsconfig.json`

- [ ] **Step 1: Remove old dependencies and dead code**

```bash
cd E:\Programming\MoodTunes
pnpm remove sentiment axios eslint @eslint/eslintrc eslint-config-next
```

- [ ] **Step 2: Install TypeScript and Biome dependencies**

```bash
pnpm add -D typescript @types/react @types/react-dom @types/node @biomejs/biome
```

- [ ] **Step 3: Delete ESLint config and jsconfig**

```bash
rm eslint.config.mjs jsconfig.json
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/app/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "files": {
    "ignore": ["node_modules", ".next", "public", "pnpm-lock.yaml"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExcessiveCognitiveComplexity": {
          "level": "warn",
          "options": {
            "maxAllowedComplexity": 25
          }
        }
      },
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "error"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn",
        "noParameterAssign": "off"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noConsoleLog": "warn"
      },
      "performance": {
        "noDelete": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  }
}
```

- [ ] **Step 6: Update `package.json` scripts**

Replace the `"scripts"` section in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

- [ ] **Step 7: Verify installation**

```bash
pnpm biome --version
pnpm tsc --version
```

Expected: Biome version printed, TypeScript version printed, no errors.

---

## Task 2: Create Shared Types

**Files:**
- Create: `src/app/types/index.ts`

- [ ] **Step 1: Create the types directory**

```bash
mkdir -p src/app/types
```

- [ ] **Step 2: Create `src/app/types/index.ts`**

```ts
// ── Mood System ──

export type PrimaryMood =
  | "happy"
  | "sad"
  | "energetic"
  | "calm"
  | "romantic"
  | "angry"
  | "nostalgic"
  | "party";

export type SecondaryMood = PrimaryMood | "anxious" | "excited" | "frustrated";

export type MoodType = PrimaryMood | SecondaryMood;

// ── HuggingFace Raw Types ──

export interface EmotionScore {
  label: string;
  score: number;
}

export interface SentimentScore {
  label: string;
  score: number;
}

// ── Mood Analysis ──

export type AnalysisMethod = "huggingface-emotion-analysis" | "fallback-enhanced-keywords";

export interface MoodAnalysis {
  mood: PrimaryMood;
  secondaryMood: SecondaryMood | null;
  confidence: number;
  intensity: number;
  context: string;
  musicStyles: string[];
  method: AnalysisMethod;
  rawEmotions?: EmotionScore[];
  rawSentiment?: SentimentScore[];
}

// ── Spotify ──

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string | null;
  preview_url: string | null;
  external_url: string | null;
  duration_ms: number;
  popularity: number;
}

export interface SpotifyRawTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  external_urls: { spotify: string };
  duration_ms: number;
  popularity: number;
}

export interface Playlist {
  mood: string;
  tracks: SpotifyTrack[];
  method: string;
  note: string;
}

// ── API Responses ──

export interface AnalyzeMoodResponse {
  success: true;
  analysis: {
    mood: PrimaryMood;
    secondaryMood: SecondaryMood | null;
    confidence: number;
    intensity: number;
    context: string;
    musicStyles: string[];
    method: AnalysisMethod;
    debug: {
      rawEmotions: EmotionScore[];
      rawSentiment: SentimentScore[];
    };
  };
}

export interface GeneratePlaylistResponse {
  success: true;
  playlist: Playlist;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

// ── Component Props ──

export interface MoodInputProps {
  onMoodSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

export interface PlaylistDisplayProps {
  playlist: Playlist;
  moodAnalysis: MoodAnalysis;
}

export interface LoadingSpinnerProps {
  message?: string;
}

// ── Internal Utilities ──

export interface MoodSearchStrategy {
  primaryQueries: string[];
  genreQueries: string[];
  artistQueries: string[];
  playlistQueries: string[];
}

export interface MoodKeywords {
  keywords: string[];
  phrases: string[];
  weight: number;
}

export interface MoodFilterKeywords {
  include: string[];
  exclude: string[];
}

export interface TokenCache {
  token: string;
  expiresAt: number;
}
```

---

## Task 3: Convert Next.js Config Files

**Files:**
- Delete: `next.config.js`
- Create: `next.config.ts`
- Delete: `tailwind.config.js`
- Create: `tailwind.config.ts`
- Delete: `postcss.config.js`
- Create: `postcss.config.mjs`

- [ ] **Step 1: Delete old config files**

```bash
cd E:\Programming\MoodTunes
rm next.config.js tailwind.config.js postcss.config.js
```

- [ ] **Step 2: Create `next.config.ts`**

Note: `generateEtags: false` removed (bug fix #6 — default `true` is correct for caching).

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "i.scdn.co",
      },
      {
        hostname: "mosaic.scdn.co",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  compress: true,
  poweredByHeader: false,
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/app/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 5: Verify configs parse correctly**

```bash
pnpm next build --dry-run 2>&1 | head -5
```

Expected: No config parse errors.

---

## Task 4: Create Rate Limiter Utility

**Files:**
- Create: `src/app/utils/rateLimit.ts`

- [ ] **Step 1: Create `src/app/utils/rateLimit.ts`**

```ts
interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;
const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes

// Periodic cleanup of stale entries
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    const valid = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      entry.timestamps = valid;
    }
  }
}

export function isRateLimited(ip: string): boolean {
  cleanup();

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, { timestamps: [now] });
    return false;
  }

  // Filter to only timestamps within the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  entry.timestamps.push(now);

  return entry.timestamps.length > MAX_REQUESTS;
}
```

---

## Task 5: Convert Utilities — `huggingFaceMoodAnalyzer.ts`

**Files:**
- Delete: `src/app/utils/huggingFaceMoodAnalyzer.js`
- Create: `src/app/utils/huggingFaceMoodAnalyzer.ts`
- Delete: `src/app/utils/moodAnalyzer.js` (dead code removal)

- [ ] **Step 1: Delete dead code**

```bash
rm src/app/utils/moodAnalyzer.js
```

- [ ] **Step 2: Delete the JS file and create `src/app/utils/huggingFaceMoodAnalyzer.ts`**

```bash
rm src/app/utils/huggingFaceMoodAnalyzer.js
```

Includes: TypeScript types, input sanitization (improvement #2).

```ts
import { InferenceClient } from "@huggingface/inference";
import type {
  AnalysisMethod,
  EmotionScore,
  MoodAnalysis,
  MoodKeywords,
  PrimaryMood,
  SecondaryMood,
} from "@/types";

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
    console.error("Hugging Face analysis failed:", error);
    return fallbackMoodAnalysis(sanitized);
  }
}

function getMusicStylesForMood(
  primaryMood: string,
  secondaryMood: string | null,
): string[] {
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

  const significantEmotions = allEmotions.filter(
    (e) => e.score > 0.15 && e !== topEmotion,
  );
  if (significantEmotions.length > 0) {
    const secondaryNames = significantEmotions.map((e) => e.label.toLowerCase()).join(", ");
    explanation += `. Also detected traces of ${secondaryNames}`;
  }

  return `${explanation}.`;
}

function fallbackMoodAnalysis(text: string): MoodAnalysis {
  console.error("Using fallback mood analysis");

  const advancedMoodKeywords: Record<string, MoodKeywords> = {
    happy: {
      keywords: ["happy", "joy", "excited", "cheerful", "upbeat", "positive", "great", "awesome", "fantastic", "wonderful", "thrilled", "elated", "euphoric", "delighted", "ecstatic"],
      phrases: ["feeling good", "on cloud nine", "over the moon", "walking on air", "bright side", "good vibes"],
      weight: 2,
    },
    sad: {
      keywords: ["sad", "depressed", "down", "blue", "melancholy", "heartbroken", "lonely", "upset", "disappointed", "grief", "sorrow", "miserable", "devastated"],
      phrases: ["feeling down", "heavy heart", "breaking apart", "tears in my eyes", "can't stop crying", "feel empty"],
      weight: 2,
    },
    energetic: {
      keywords: ["energetic", "pumped", "hyped", "active", "motivated", "powerful", "strong", "intense", "dynamic", "charged", "fired up", "amped"],
      phrases: ["ready to conquer", "full of energy", "pumped up", "ready to go", "bring it on", "let's do this"],
      weight: 2,
    },
    calm: {
      keywords: ["calm", "peaceful", "relaxed", "chill", "serene", "tranquil", "mellow", "zen", "quiet", "gentle", "soothing", "restful"],
      phrases: ["at peace", "feeling zen", "nice and calm", "totally relaxed", "inner peace"],
      weight: 2,
    },
    romantic: {
      keywords: ["romantic", "love", "intimate", "passionate", "tender", "affectionate", "sweet", "loving", "adore", "cherish"],
      phrases: ["in love", "romantic mood", "date night", "feeling romantic", "love is in the air"],
      weight: 2,
    },
    angry: {
      keywords: ["angry", "mad", "furious", "rage", "frustrated", "annoyed", "irritated", "pissed", "livid", "outraged", "enraged"],
      phrases: ["so angry", "can't stand", "fed up", "had enough", "boiling mad", "seeing red"],
      weight: 2,
    },
    anxious: {
      keywords: ["anxious", "worried", "nervous", "stressed", "overwhelmed", "panic", "tense", "restless", "uneasy", "concerned"],
      phrases: ["can't stop thinking", "butterflies in stomach", "on edge", "stressed out", "freaking out"],
      weight: 2,
    },
    nostalgic: {
      keywords: ["nostalgic", "memories", "past", "remember", "miss", "throwback", "vintage", "old times", "reminiscing"],
      phrases: ["good old days", "back in the day", "miss those times", "thinking about", "remember when"],
      weight: 2,
    },
    party: {
      keywords: ["party", "dance", "celebration", "fun", "wild", "crazy", "festive", "club", "nightlife", "celebrate"],
      phrases: ["party time", "let's celebrate", "ready to party", "dance all night", "good times"],
      weight: 2,
    },
    excited: {
      keywords: ["excited", "thrilled", "anticipating", "eager", "enthusiastic", "stoked", "psyched", "buzzing"],
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
```

---

## Task 6: Convert Utilities — `spotify.ts`

**Files:**
- Delete: `src/app/utils/spotify.js`
- Create: `src/app/utils/spotify.ts`

Includes: token caching (improvement #1), parallel queries (improvement #7), deterministic filtering (improvement #3).

- [ ] **Step 1: Delete JS file and create `src/app/utils/spotify.ts`**

```bash
rm src/app/utils/spotify.js
```

```ts
import type {
  MoodFilterKeywords,
  MoodSearchStrategy,
  PrimaryMood,
  SpotifyRawTrack,
  TokenCache,
} from "@/types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// ── Token Caching ──

let tokenCache: TokenCache | null = null;

export async function getSpotifyAccessToken(): Promise<string> {
  // Return cached token if still valid (5min buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 300_000) {
    return tokenCache.token;
  }

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

// ── Search Strategies ──

const MOOD_SEARCH_STRATEGIES: Record<string, MoodSearchStrategy> = {
  happy: {
    primaryQueries: [
      "happy songs 2024",
      "feel good music",
      "upbeat pop hits",
      "positive vibes playlist",
      "cheerful music",
    ],
    genreQueries: ["genre:pop happy", "genre:dance upbeat", "genre:funk feel good"],
    artistQueries: [
      'artist:"Pharrell Williams" Happy',
      'artist:"Bruno Mars" upbeat',
      'artist:"Dua Lipa" dance',
    ],
    playlistQueries: ['playlist:"Happy Hits"', 'playlist:"Good Vibes"', 'playlist:"Feel Good Pop"'],
  },
  sad: {
    primaryQueries: [
      "sad songs heartbreak",
      "emotional ballads",
      "melancholy music",
      "breakup songs",
      "crying songs",
    ],
    genreQueries: [
      "genre:indie sad",
      "genre:alternative emotional",
      "genre:singer-songwriter heartbreak",
    ],
    artistQueries: [
      'artist:"Billie Eilish" sad',
      'artist:"Adele" heartbreak',
      'artist:"Lewis Capaldi" emotional',
    ],
    playlistQueries: ['playlist:"Sad Songs"', 'playlist:"Heartbreak"', 'playlist:"Life Sucks"'],
  },
  energetic: {
    primaryQueries: [
      "workout music high energy",
      "pump up songs",
      "motivational music",
      "gym playlist",
      "power songs",
    ],
    genreQueries: [
      "genre:rock energetic",
      "genre:electronic high energy",
      "genre:hip-hop pump up",
    ],
    artistQueries: [
      'artist:"Eminem" motivational',
      'artist:"Imagine Dragons" energetic',
      'artist:"The Weeknd" workout',
    ],
    playlistQueries: ['playlist:"Beast Mode"', 'playlist:"Workout"', 'playlist:"Power Hour"'],
  },
  calm: {
    primaryQueries: [
      "relaxing music peaceful",
      "chill songs ambient",
      "meditation music",
      "peaceful piano",
      "calming sounds",
    ],
    genreQueries: ["genre:ambient peaceful", "genre:acoustic calm", "genre:classical relaxing"],
    artistQueries: [
      'artist:"Ludovico Einaudi" peaceful',
      'artist:"Olafur Arnalds" calm',
      'artist:"Max Richter" ambient',
    ],
    playlistQueries: [
      'playlist:"Chill Hits"',
      'playlist:"Peaceful Piano"',
      'playlist:"Ambient Chill"',
    ],
  },
  romantic: {
    primaryQueries: [
      "love songs romantic",
      "slow dance music",
      "romantic ballads",
      "date night playlist",
      "valentine songs",
    ],
    genreQueries: ["genre:r-n-b romantic", "genre:soul love songs", "genre:pop romantic"],
    artistQueries: [
      'artist:"John Legend" love',
      'artist:"Ed Sheeran" romantic',
      'artist:"Alicia Keys" love songs',
    ],
    playlistQueries: [
      'playlist:"Love Pop"',
      'playlist:"Romantic Ballads"',
      'playlist:"Date Night"',
    ],
  },
  angry: {
    primaryQueries: [
      "angry music aggressive",
      "rage songs metal",
      "hardcore music",
      "aggressive rap",
      "metal hits",
    ],
    genreQueries: ["genre:metal aggressive", "genre:punk angry", "genre:hard-rock rage"],
    artistQueries: [
      'artist:"Metallica" aggressive',
      'artist:"Rage Against The Machine" angry',
      'artist:"Slipknot" metal',
    ],
    playlistQueries: [
      'playlist:"Metal Essentials"',
      'playlist:"Rage Beats"',
      'playlist:"Heavy Metal"',
    ],
  },
  nostalgic: {
    primaryQueries: [
      "classic hits throwback",
      "oldies music vintage",
      "retro songs 80s 90s",
      "nostalgic music",
      "throwback hits",
    ],
    genreQueries: [
      "genre:classic-rock throwback",
      "genre:oldies vintage",
      "genre:folk nostalgic",
    ],
    artistQueries: [
      'artist:"Queen" classic',
      'artist:"The Beatles" oldies',
      'artist:"Fleetwood Mac" vintage',
    ],
    playlistQueries: ['playlist:"Throwback"', 'playlist:"Classic Rock"', 'playlist:"Oldies"'],
  },
  party: {
    primaryQueries: [
      "party music dance hits",
      "club bangers",
      "dance party playlist",
      "festival music",
      "celebration songs",
    ],
    genreQueries: ["genre:dance party", "genre:electronic club", "genre:pop party"],
    artistQueries: [
      'artist:"Calvin Harris" party',
      'artist:"David Guetta" dance',
      'artist:"Daft Punk" electronic',
    ],
    playlistQueries: [
      'playlist:"Party Hits"',
      'playlist:"Dance Party"',
      'playlist:"Club Bangers"',
    ],
  },
};

// ── Mood Filtering (Deterministic) ──

const MOOD_FILTER_KEYWORDS: Record<string, MoodFilterKeywords> = {
  happy: {
    include: ["happy", "joy", "good", "love", "dance", "party", "fun", "smile", "sunshine", "bright"],
    exclude: ["sad", "cry", "death", "dark", "lonely", "hurt", "pain", "break"],
  },
  sad: {
    include: ["sad", "cry", "hurt", "pain", "lonely", "miss", "gone", "lost", "break", "heart"],
    exclude: ["happy", "party", "dance", "celebration", "joy", "fun"],
  },
  energetic: {
    include: ["power", "strong", "energy", "pump", "beast", "fire", "rock", "metal", "hard"],
    exclude: ["slow", "calm", "peaceful", "quiet", "soft", "gentle"],
  },
  calm: {
    include: ["calm", "peace", "quiet", "soft", "gentle", "relax", "chill", "ambient", "piano"],
    exclude: ["loud", "aggressive", "hard", "metal", "rage", "angry"],
  },
  romantic: {
    include: ["love", "heart", "kiss", "romance", "beautiful", "forever", "together", "valentine"],
    exclude: ["angry", "hate", "rage", "aggressive", "metal", "hardcore"],
  },
  angry: {
    include: ["rage", "angry", "mad", "hate", "fight", "war", "aggressive", "metal", "hardcore"],
    exclude: ["love", "peace", "calm", "gentle", "soft", "romantic"],
  },
  nostalgic: {
    include: ["classic", "old", "vintage", "remember", "memory", "past", "throwback", "retro"],
    exclude: ["new", "modern", "future", "electronic", "digital"],
  },
  party: {
    include: ["party", "dance", "club", "celebration", "festival", "fun", "night", "weekend"],
    exclude: ["sad", "lonely", "quiet", "calm", "peaceful", "slow"],
  },
};

// ── Core Functions ──

export async function getMoodBasedTracks(
  mood: string,
  accessToken: string,
  limit = 25,
): Promise<SpotifyRawTrack[]> {
  const strategy = MOOD_SEARCH_STRATEGIES[mood] ?? MOOD_SEARCH_STRATEGIES.happy;

  // Parallel queries by category
  const [primaryResults, genreResults, artistResults, playlistResults] = await Promise.all([
    Promise.all(
      strategy.primaryQueries.slice(0, 2).map((q) => searchSpotifyTracks(q, accessToken, 8)),
    ),
    Promise.all(
      strategy.genreQueries.slice(0, 2).map((q) => searchSpotifyTracks(q, accessToken, 6)),
    ),
    Promise.all(
      strategy.artistQueries.slice(0, 2).map((q) => searchSpotifyTracks(q, accessToken, 5)),
    ),
    Promise.all(
      strategy.playlistQueries.slice(0, 1).map((q) => searchSpotifyTracks(q, accessToken, 6)),
    ),
  ]);

  const allTracks = [
    ...primaryResults.flat(),
    ...genreResults.flat(),
    ...artistResults.flat(),
    ...playlistResults.flat(),
  ];

  const uniqueTracks = removeDuplicateTracks(allTracks);
  const filteredTracks = applyMoodFiltering(uniqueTracks, mood);

  return filteredTracks.slice(0, limit);
}

export async function getEnhancedMoodTracks(
  mood: string,
  accessToken: string,
  limit = 25,
): Promise<SpotifyRawTrack[]> {
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1];

  // Parallel: recent year searches + classic search
  const [recentResults, classicTracks, regularTracks] = await Promise.all([
    Promise.all(
      recentYears.map((year) =>
        searchSpotifyTracks(`${mood} year:${year}`, accessToken, 10),
      ),
    ),
    searchSpotifyTracks(`${mood} year:2000-2020`, accessToken, 10),
    getMoodBasedTracks(mood, accessToken, 15),
  ]);

  const allTracks = [...recentResults.flat(), ...classicTracks, ...regularTracks];
  const uniqueTracks = removeDuplicateTracks(allTracks);
  const sortedTracks = uniqueTracks.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

  return sortedTracks.slice(0, limit);
}

async function searchSpotifyTracks(
  query: string,
  accessToken: string,
  limit: number,
): Promise<SpotifyRawTrack[]> {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(`Search failed for query "${query}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.tracks?.items ?? []) as SpotifyRawTrack[];
  } catch (error) {
    console.error(`Search error for query "${query}":`, error);
    return [];
  }
}

function removeDuplicateTracks(tracks: SpotifyRawTrack[]): SpotifyRawTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

function applyMoodFiltering(tracks: SpotifyRawTrack[], mood: string): SpotifyRawTrack[] {
  const keywords = MOOD_FILTER_KEYWORDS[mood] ?? MOOD_FILTER_KEYWORDS.happy;

  const scored = tracks.map((track) => {
    const searchText =
      `${track.name} ${track.artists.map((a) => a.name).join(" ")} ${track.album.name}`.toLowerCase();

    const hasExcluded = keywords.exclude.some((kw) => searchText.includes(kw));
    if (hasExcluded) return { track, score: -1 };

    const includeCount = keywords.include.filter((kw) => searchText.includes(kw)).length;
    return { track, score: includeCount };
  });

  return scored
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.track);
}
```

---

## Task 7: Convert API Routes

**Files:**
- Delete: `src/app/api/analyze-mood/route.js`
- Create: `src/app/api/analyze-mood/route.ts`
- Delete: `src/app/api/generate-playlist/route.js`
- Create: `src/app/api/generate-playlist/route.ts`

- [ ] **Step 1: Delete JS route files**

```bash
rm src/app/api/analyze-mood/route.js src/app/api/generate-playlist/route.js
```

- [ ] **Step 2: Create `src/app/api/analyze-mood/route.ts`**

Includes: input sanitization (improvement #2), rate limiting (improvement #4).

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { analyzeWithHuggingFace, sanitizeInput } from "@/utils/huggingFaceMoodAnalyzer";
import { isRateLimited } from "@/utils/rateLimit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const text: unknown = body.text;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const sanitized = sanitizeInput(text);

    if (sanitized.length > 1000) {
      return NextResponse.json(
        { error: "Text too long. Please limit to 1000 characters." },
        { status: 400 },
      );
    }

    const analysis = await analyzeWithHuggingFace(sanitized);

    return NextResponse.json({
      success: true,
      analysis: {
        mood: analysis.mood,
        secondaryMood: analysis.secondaryMood,
        confidence: analysis.confidence,
        intensity: analysis.intensity,
        context: analysis.context,
        musicStyles: analysis.musicStyles,
        method: analysis.method,
        debug: {
          rawEmotions: analysis.rawEmotions?.slice(0, 3) ?? [],
          rawSentiment: analysis.rawSentiment?.slice(0, 2) ?? [],
        },
      },
    });
  } catch (error) {
    console.error("Mood analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze mood",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Create `src/app/api/generate-playlist/route.ts`**

Includes: rate limiting, deduplication fix (bug #3), error details guard (bug #4).

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSpotifyAccessToken,
  getMoodBasedTracks,
  getEnhancedMoodTracks,
} from "@/utils/spotify";
import { isRateLimited } from "@/utils/rateLimit";
import type { SpotifyTrack } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const mood: unknown = body.mood;

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const accessToken = await getSpotifyAccessToken();

    let tracks = await getEnhancedMoodTracks(mood, accessToken, 25);

    if (tracks.length < 15) {
      console.error("Using basic mood search fallback");
      const basicTracks = await getMoodBasedTracks(mood, accessToken, 25);
      // Deduplicate before slicing (bug fix)
      const seen = new Set(tracks.map((t) => t.id));
      const newTracks = basicTracks.filter((t) => !seen.has(t.id));
      tracks = [...tracks, ...newTracks].slice(0, 25);
    }

    if (tracks.length === 0) {
      return NextResponse.json(
        { error: `No tracks found for mood: ${mood}. Please try a different mood.` },
        { status: 404 },
      );
    }

    const formattedTracks: SpotifyTrack[] = tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.map((artist) => artist.name).join(", ") ?? "Unknown Artist",
      album: track.album?.name ?? "Unknown Album",
      image: track.album?.images?.[0]?.url ?? null,
      preview_url: track.preview_url ?? null,
      external_url: track.external_urls?.spotify ?? null,
      duration_ms: track.duration_ms ?? 0,
      popularity: track.popularity ?? 0,
    }));

    return NextResponse.json({
      success: true,
      playlist: {
        mood,
        tracks: formattedTracks,
        method: "search-only-recommendations",
        note: "Generated using only Spotify Search API with intelligent mood matching",
      },
    });
  } catch (error) {
    console.error("Playlist generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate playlist. Please try again.",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
```

---

## Task 8: Convert Layout

**Files:**
- Delete: `src/app/layout.js`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Delete JS file and create `src/app/layout.tsx`**

```bash
rm src/app/layout.js
```

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoodTunes - AI-Powered Music for Every Mood",
  description:
    "Discover personalized music playlists based on your current mood using AI-powered sentiment analysis and Spotify integration. Generate the perfect soundtrack for any feeling.",
  keywords:
    "mood music, AI playlist generator, Spotify integration, music recommendation, sentiment analysis, personalized playlists, mood-based music, music discovery, emotional music, AI music",
  authors: [{ name: "Adib23704", url: "https://adibdev.me" }],
  creator: "Adib23704",
  publisher: "MoodTunes",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://moodtunes.adibdev.me"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MoodTunes - AI-Powered Music for Every Mood",
    description:
      "Discover personalized music playlists based on your current mood using AI-powered sentiment analysis and Spotify integration. Generate the perfect soundtrack for any feeling.",
    url: "https://moodtunes.adibdev.me",
    siteName: "MoodTunes",
    images: [
      {
        url: "/images/cover-image.jpg",
        width: 1200,
        height: 630,
        alt: "MoodTunes - AI-Powered Music for Every Mood",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodTunes - AI-Powered Music for Every Mood",
    description:
      "Discover personalized music playlists based on your current mood using AI-powered sentiment analysis and Spotify integration. Generate the perfect soundtrack for any feeling.",
    images: ["/images/cover-image.jpg"],
    creator: "@adib2374",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MoodTunes" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <link rel="apple-touch-icon" sizes="57x57" href="/favicon/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/favicon/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicon/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/favicon/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/favicon/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/favicon/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/favicon/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-icon-180x180.png" />

        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />

        <link rel="manifest" href="/favicon/manifest.json" />

        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-TileImage" content="/favicon/ms-icon-144x144.png" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />

        <link rel="preconnect" href="https://api.spotify.com" />
        <link rel="preconnect" href="https://accounts.spotify.com" />
        <link rel="dns-prefetch" href="https://i.scdn.co" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MoodTunes",
              description:
                "Discover personalized music playlists based on your current mood using AI-powered sentiment analysis and Spotify integration.",
              url: "https://moodtunes.adibdev.me",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Person",
                name: "Adib",
                url: "https://adibdev.me",
              },
              featureList: [
                "AI-powered mood analysis",
                "Spotify integration",
                "Personalized playlists",
                "Voice input support",
                "Real-time music recommendations",
                "User-friendly interface",
                "Cross-platform compatibility",
                "Open-source codebase",
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

Note: removed the `google` verification placeholder (`'your-google-verification-code'`) since it's a dummy value.

---

## Task 9: Convert Page Component

**Files:**
- Delete: `src/app/page.js`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Delete JS file and create `src/app/page.tsx`**

```bash
rm src/app/page.js
```

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import MoodInput from "@/components/MoodInput";
import PlaylistDisplay from "@/components/PlaylistDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { MoodAnalysis, Playlist, PrimaryMood } from "@/types";

const MOOD_BACKGROUNDS: Record<string, string> = {
  happy: "from-yellow-200 via-orange-200 to-pink-200",
  sad: "from-blue-200 via-indigo-200 to-purple-200",
  energetic: "from-red-200 via-pink-200 to-orange-200",
  calm: "from-green-200 via-teal-200 to-blue-200",
  romantic: "from-pink-200 via-rose-200 to-red-200",
  angry: "from-red-300 via-gray-300 to-black",
  nostalgic: "from-amber-200 via-yellow-200 to-orange-200",
  party: "from-purple-200 via-pink-200 to-indigo-200",
  default: "from-purple-50 to-pink-50",
};

export default function Home() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<string>("default");

  useEffect(() => {
    if (moodAnalysis?.mood) {
      setCurrentMood(moodAnalysis.mood);
    }
  }, [moodAnalysis]);

  const handleMoodSubmit = async (moodText: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setPlaylist(null);
    setMoodAnalysis(null);

    try {
      const moodResponse = await fetch("/api/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: moodText }),
      });

      if (!moodResponse.ok) {
        throw new Error("Failed to analyze mood");
      }

      const moodData = await moodResponse.json();
      setMoodAnalysis(moodData.analysis);

      const playlistResponse = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: moodData.analysis.mood }),
      });

      if (!playlistResponse.ok) {
        throw new Error("Failed to generate playlist");
      }

      const playlistData = await playlistResponse.json();
      setPlaylist(playlistData.playlist);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const background = MOOD_BACKGROUNDS[currentMood] ?? MOOD_BACKGROUNDS.default;

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-br ${background} transition-all duration-1000`}
      animate={{
        background: "linear-gradient(to bottom right, var(--tw-gradient-stops))",
      }}
      transition={{ duration: 1 }}
    >
      <Header />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <MoodInput onMoodSubmit={handleMoodSubmit} isLoading={isLoading} />
        </motion.div>

        <div className="mt-12">
          {isLoading && (
            <LoadingSpinner message="Analyzing your mood and curating the perfect playlist..." />
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-2xl mx-auto"
            >
              <p className="font-medium">Oops! Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
            </motion.div>
          )}

          {playlist && !isLoading && moodAnalysis && (
            <PlaylistDisplay playlist={playlist} moodAnalysis={moodAnalysis} />
          )}

          {!playlist && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-600 mt-12"
            >
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-xl mb-4">
                  Tell us how you&apos;re feeling and we&apos;ll create the perfect playlist for
                  you! 🎵
                </p>
                <p className="text-sm opacity-75">
                  Try phrases like &quot;I&apos;m feeling happy&quot;, &quot;I need some calm
                  music&quot;, or &quot;I want to party!&quot;
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
```

---

## Task 10: Convert Header Component

**Files:**
- Delete: `src/app/components/Header.js`
- Create: `src/app/components/Header.tsx`

- [ ] **Step 1: Delete JS file and create `src/app/components/Header.tsx`**

```bash
rm src/app/components/Header.js
```

```tsx
"use client";

import { Music, Headphones, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity },
          }}
        >
          <Music className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-20 right-20 w-16 h-16"
          animate={{
            rotate: -360,
            y: [0, -20, 0],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity },
          }}
        >
          <Headphones className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/3 w-12 h-12"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Heart className="w-full h-full" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Image src="/logo.png" alt="MoodTunes Logo" width={64} height={64} className="mr-4" />
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            MoodTunes
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl opacity-90 mb-4"
        >
          Discover music that matches your mood
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center gap-8 text-sm opacity-75"
        >
          <span>🎵 AI-Powered</span>
          <span>🎧 Spotify Integration</span>
          <span>❤️ Mood-Based</span>
        </motion.div>
      </div>
    </header>
  );
}
```

---

## Task 11: Convert MoodInput Component

**Files:**
- Delete: `src/app/components/MoodInput.js`
- Create: `src/app/components/MoodInput.tsx`

Includes: voice input graceful degradation (improvement #5), eslint-disable removal (improvement #8).

- [ ] **Step 1: Delete JS file and create `src/app/components/MoodInput.tsx`**

```bash
rm src/app/components/MoodInput.js
```

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Sparkles, Zap, Heart, Sun, Moon, Coffee, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MoodInputProps } from "@/types";

// Cross-browser SpeechRecognition
const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
      .webkitSpeechRecognition ??
    null
  );
};

const MOOD_PROMPT_POOL = [
  // Happy & Energetic
  "I'm feeling on top of the world today!",
  "Give me some sunshine vibes!",
  "I want to dance like nobody's watching!",
  "Feeling absolutely fantastic right now!",
  "I need some feel-good energy!",
  "Today feels like a celebration!",
  "I'm radiating positive vibes!",
  "Give me music that matches my bright mood!",

  // Calm & Peaceful
  "Need something to match my mellow mood.",
  "I want to relax and unwind completely.",
  "Give me some chill vibes for studying.",
  "Need some peaceful piano music.",
  "I want to feel zen and centered.",
  "Looking for ambient sounds to calm my mind.",
  "I need music for meditation time.",
  "Give me something soothing for my soul.",

  // Energetic & Motivational
  "Give me some motivation for my workout!",
  "I want to rock out with high energy!",
  "I need pump-up music right now!",
  "Give me songs that make me feel powerful!",
  "I want to feel empowered and strong!",
  "Need some adrenaline-pumping beats!",
  "I want music that gets my blood flowing!",
  "Give me something to fuel my determination!",

  // Romantic & Emotional
  "Looking for love songs tonight.",
  "I'm in the mood for romance.",
  "Give me something for a candlelit dinner.",
  "I want music that touches my heart.",
  "Need some slow dance music.",
  "I'm feeling sentimental about love.",
  "Give me songs about deep connections.",
  "I want music for intimate moments.",

  // Nostalgic & Reflective
  "Feeling nostalgic for the 90s.",
  "I want to reminisce about old times.",
  "Give me some throwback classics.",
  "I'm in a reflective, contemplative mood.",
  "Need music that brings back memories.",
  "I want to travel back in time through music.",
  "Give me songs from my childhood.",
  "I'm feeling sentimental about the past.",

  // Party & Social
  "I want to party all night!",
  "Give me some club bangers!",
  "I need music for a house party!",
  "I want to feel the festival vibes!",
  "Give me something to get the crowd moving!",
  "I need dance floor anthems!",
  "I want music that makes everyone sing along!",
  "Give me beats that make me want to celebrate!",

  // Sad & Emotional
  "Feeling a bit blue, need some comfort music.",
  "I want songs that understand my sadness.",
  "Give me music for when I'm feeling down.",
  "I need something cathartic and emotional.",
  "I want to embrace my melancholy mood.",
  "Give me songs for a rainy day.",
  "I need music that helps me process emotions.",
  "I want something beautifully sad.",

  // Situational & Contextual
  "It's a rainy day, I want cozy tunes.",
  "I want music for a road trip adventure.",
  "Give me songs for a sunny day.",
  "I need background music while I cook.",
  "I want something for my morning coffee.",
  "Give me music for a late-night drive.",
  "I need tunes for cleaning the house.",
  "I want something for a lazy Sunday.",

  // Adventurous & Experimental
  "Feeling adventurous, show me something different.",
  "Surprise me with something completely new!",
  "I want to discover music I've never heard.",
  "Give me something unexpected and unique.",
  "I'm open to any genre, surprise me!",
  "I want to explore new musical territories.",
  "Show me something that will blow my mind!",
  "I'm ready for a musical adventure!",

  // Work & Focus
  "I need music to help me focus and concentrate.",
  "Give me background music for productivity.",
  "I want something that helps me get in the zone.",
  "I need music for deep work sessions.",
  "Give me something that boosts creativity.",
  "I want ambient music for brainstorming.",
  "I need tunes that help me stay motivated at work.",
  "Give me music that enhances my flow state.",
] as const;

interface QuickMoodButton {
  mood: string;
  icon: typeof Sun;
  color: string;
  text: string;
}

const QUICK_MOOD_BUTTONS: QuickMoodButton[] = [
  { mood: "happy", icon: Sun, color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200", text: "Happy & Upbeat" },
  { mood: "calm", icon: Moon, color: "bg-blue-100 text-blue-700 hover:bg-blue-200", text: "Calm & Peaceful" },
  { mood: "energetic", icon: Zap, color: "bg-red-100 text-red-700 hover:bg-red-200", text: "Energetic & Pumped" },
  { mood: "romantic", icon: Heart, color: "bg-pink-100 text-pink-700 hover:bg-pink-200", text: "Romantic & Loving" },
  { mood: "nostalgic", icon: Coffee, color: "bg-amber-100 text-amber-700 hover:bg-amber-200", text: "Nostalgic & Reflective" },
  { mood: "party", icon: Sparkles, color: "bg-purple-100 text-purple-700 hover:bg-purple-200", text: "Party & Dance" },
];

export default function MoodInput({ onMoodSubmit, isLoading }: MoodInputProps) {
  const [moodText, setMoodText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const generateRandomSuggestions = useCallback(() => {
    const shuffled = [...MOOD_PROMPT_POOL].sort(() => 0.5 - Math.random());
    setCurrentSuggestions(shuffled.slice(0, 8));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("recentMoods");
    if (saved) {
      setRecentMoods(JSON.parse(saved));
    }
    generateRandomSuggestions();
    setVoiceSupported(getSpeechRecognition() !== null);
  }, [generateRandomSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim() && !isLoading) {
      const newRecentMoods = [moodText.trim(), ...recentMoods.filter((m) => m !== moodText.trim())].slice(0, 5);
      setRecentMoods(newRecentMoods);
      localStorage.setItem("recentMoods", JSON.stringify(newRecentMoods));

      onMoodSubmit(moodText.trim());
      setShowSuggestions(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setMoodText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Main Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="How are you feeling today? Describe your mood in detail..."
            className="w-full p-6 pr-24 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:outline-none resize-none h-40 text-lg bg-white/80 backdrop-blur-sm shadow-lg"
            disabled={isLoading}
          />

          <div className="absolute bottom-16 right-4 text-sm text-gray-400">
            {moodText.length}/500
          </div>

          <div className="absolute right-4 bottom-4 flex gap-2">
            <motion.button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading || isListening || !voiceSupported}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-lg"
                  : voiceSupported
                    ? "bg-white/80 hover:bg-gray-100 text-gray-600 shadow-md"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-md"
              }`}
              whileHover={voiceSupported ? { scale: 1.05 } : undefined}
              whileTap={voiceSupported ? { scale: 0.95 } : undefined}
              title={voiceSupported ? "Voice input" : "Voice input is not supported in your browser"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>

            <motion.button
              type="submit"
              disabled={!moodText.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-600">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
              <span>Listening... Speak now!</span>
            </div>
          </motion.div>
        )}
      </motion.form>

      {/* Quick Mood Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Quick Mood Selection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_MOOD_BUTTONS.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <motion.button
                key={button.mood}
                onClick={() => setMoodText(`I'm feeling ${button.text.toLowerCase()}`)}
                className={`p-4 rounded-xl ${button.color} transition-all flex items-center gap-3 shadow-md hover:shadow-lg`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                disabled={isLoading}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{button.text}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Moods */}
      {recentMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Recent Moods</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {recentMoods.map((mood, index) => (
              <motion.button
                key={`${mood}-${index}`}
                onClick={() => setMoodText(mood)}
                className="px-4 py-2 bg-gray-100 hover:bg-purple-100 border border-gray-200 hover:border-purple-300 rounded-full transition-all text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {mood}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dynamic Mood Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-700 text-center">
                Need Inspiration?
              </h3>
              <motion.button
                onClick={generateRandomSuggestions}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full transition-all"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                title="Get new suggestions"
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="wait">
                {currentSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion}-${index}`}
                    onClick={() => setMoodText(suggestion)}
                    className="p-4 text-left bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-300 rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: 0.05 * index }}
                    disabled={isLoading}
                  >
                    <span className="text-purple-600 mr-2">💭</span>
                    &quot;{suggestion}&quot;
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-xs text-gray-500 mt-4"
            >
              Click the shuffle button to get fresh inspiration! ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## Task 12: Convert PlaylistDisplay Component

**Files:**
- Delete: `src/app/components/PlaylistDisplay.js`
- Create: `src/app/components/PlaylistDisplay.tsx`

Includes: nostalgic emoji fix (bug #1), `<img>` -> `<Image>` (improvement #9).

- [ ] **Step 1: Delete JS file and create `src/app/components/PlaylistDisplay.tsx`**

```bash
rm src/app/components/PlaylistDisplay.js
```

```tsx
"use client";

import { ExternalLink, Clock, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { PlaylistDisplayProps } from "@/types";

const MOOD_COLORS: Record<string, string> = {
  happy: "from-yellow-400 to-orange-500",
  sad: "from-blue-400 to-indigo-600",
  energetic: "from-red-500 to-pink-600",
  calm: "from-green-400 to-teal-500",
  romantic: "from-pink-400 to-rose-500",
  angry: "from-red-600 to-gray-800",
  nostalgic: "from-amber-400 to-orange-600",
  party: "from-purple-500 to-pink-600",
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  energetic: "⚡",
  calm: "🧘",
  romantic: "💕",
  angry: "😠",
  nostalgic: "📻",
  party: "🎉",
};

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function PlaylistDisplay({ playlist, moodAnalysis }: PlaylistDisplayProps) {
  if (!playlist) return null;

  const totalDuration = playlist.tracks.reduce((acc, track) => acc + (track.duration_ms ?? 0), 0);
  const moodColor = MOOD_COLORS[moodAnalysis.mood] ?? "from-gray-700 to-gray-900";
  const moodEmoji = MOOD_EMOJIS[moodAnalysis.mood] ?? "🎵";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto p-4 sm:p-6"
    >
      {/* Mood Analysis Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r ${moodColor} text-white p-4 sm:p-6 rounded-xl mb-6 relative overflow-hidden shadow-lg`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-grow">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
                {moodEmoji}
                Detected Mood: {moodAnalysis.mood.charAt(0).toUpperCase() + moodAnalysis.mood.slice(1)}
                {moodAnalysis.secondaryMood && (
                  <span className="text-md sm:text-lg opacity-75">
                    + {moodAnalysis.secondaryMood}
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                <p className="opacity-90 text-sm sm:text-lg">
                  Confidence: {Math.round(moodAnalysis.confidence * 100)}% • Intensity:{" "}
                  {moodAnalysis.intensity}/10
                </p>
                <p className="opacity-80 text-xs sm:text-sm">{moodAnalysis.context}</p>
                {moodAnalysis.musicStyles && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm opacity-75">Music Styles:</span>
                    {moodAnalysis.musicStyles.map((style) => (
                      <span key={style} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                        {style}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:block text-right flex-shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-6xl opacity-20 mb-2"
              >
                {moodEmoji}
              </motion.div>
              <div className="text-xs opacity-60">Powered by AI</div>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-4">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${moodAnalysis.confidence * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Playlist Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Your {playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)} Playlist
            </h2>
            <p className="text-gray-600">
              {playlist.tracks.length} tracks • {formatTime(totalDuration / 1000)} total
            </p>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <AnimatePresence>
          {playlist.tracks.map((track, index) => (
            <motion.div
              key={track.id ?? index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_4rem_1fr_auto_auto] items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group transition-colors"
            >
              {/* Track Number */}
              <div className="hidden sm:block text-center text-gray-400 text-sm w-8">
                {index + 1}
              </div>

              {/* Album Art */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                {track.image ? (
                  <Image
                    src={track.image}
                    alt={track.album}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-grow min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{track.name}</h4>
                <p className="text-gray-600 text-sm truncate">{track.artist}</p>
                <p className="text-sm text-gray-500 truncate hidden md:block">{track.album}</p>
              </div>

              {/* Duration */}
              <div className="hidden sm:flex items-center text-gray-500 text-sm mr-4">
                <Clock className="w-4 h-4 mr-1.5" />
                {formatDuration(track.duration_ms)}
              </div>

              {/* Actions */}
              <div className="flex items-center">
                {track.external_url && (
                  <motion.a
                    href={track.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Play on Spotify"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Playlist Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Playlist Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {playlist.tracks.length}
            </div>
            <div className="text-sm text-gray-600">Tracks</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {formatTime(totalDuration / 1000)}
            </div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-pink-600">
              {playlist.tracks.length > 0
                ? Math.round(
                    playlist.tracks.reduce((acc, track) => acc + (track.popularity ?? 0), 0) /
                      playlist.tracks.length,
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600">Avg Popularity</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

---

## Task 13: Convert LoadingSpinner Component

**Files:**
- Delete: `src/app/components/LoadingSpinner.js`
- Create: `src/app/components/LoadingSpinner.tsx`

- [ ] **Step 1: Delete JS file and create `src/app/components/LoadingSpinner.tsx`**

```bash
rm src/app/components/LoadingSpinner.js
```

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { LoadingSpinnerProps } from "@/types";

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Logo with Spinner */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-2 border-[3px] border-pink-200 border-b-pink-600 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-16 h-16 relative">
            <Image src="/logo.png" alt="MoodTunes Logo" fill className="object-contain" priority />
          </div>
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <motion.p
          className="text-xl font-semibold text-gray-700 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>

        <motion.div
          className="flex justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-600 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
```

---

## Task 14: Format, Lint & Build Verification

- [ ] **Step 1: Run Biome format on entire project**

```bash
cd E:\Programming\MoodTunes
pnpm biome check --write .
```

Expected: All files formatted, any remaining lint issues shown.

- [ ] **Step 2: Fix any Biome lint errors**

Address any errors surfaced by Step 1. Warnings are acceptable (e.g., `noExplicitAny`, `noConsoleLog`).

- [ ] **Step 3: Run TypeScript type check**

```bash
pnpm tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Run Next.js build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Smoke test locally**

```bash
pnpm dev
```

Open `http://localhost:3000`, verify:
1. Page loads without console errors
2. Quick mood buttons populate the textarea
3. Voice input button shows correct state (enabled/disabled based on browser)
4. Submitting a mood shows the loading spinner, then results

---

## Task 15: Clean Up Stale Files

- [ ] **Step 1: Verify no JS source files remain**

```bash
find src -name "*.js" -not -path "*/node_modules/*"
```

Expected: No results.

- [ ] **Step 2: Verify no eslint references remain**

```bash
grep -r "eslint" src/ --include="*.ts" --include="*.tsx"
```

Expected: No results.

- [ ] **Step 3: Verify moodAnalyzer.js is gone**

```bash
ls src/app/utils/moodAnalyzer.js 2>/dev/null && echo "STILL EXISTS" || echo "OK - removed"
```

Expected: `OK - removed`
