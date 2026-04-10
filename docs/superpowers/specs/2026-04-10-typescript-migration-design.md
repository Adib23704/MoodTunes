# MoodTunes: TypeScript Migration, Biome Setup & Improvements

**Date:** 2026-04-10
**Status:** Approved
**Approach:** Big-bang migration (all files converted in one pass)

---

## 1. TypeScript Conversion

### Strategy

- **Strictness:** Pragmatic strict (`strict: true` in tsconfig, occasional `as` assertions for complex third-party API shapes from Spotify/HuggingFace)
- **Approach:** Big-bang — rename all `.js` → `.ts`/`.tsx`, add types, delete dead code in one coherent pass

### File Renames

| Current | New |
|---------|-----|
| `next.config.js` | `next.config.ts` |
| `src/app/layout.js` | `src/app/layout.tsx` |
| `src/app/page.js` | `src/app/page.tsx` |
| `src/app/components/Header.js` | `src/app/components/Header.tsx` |
| `src/app/components/MoodInput.js` | `src/app/components/MoodInput.tsx` |
| `src/app/components/PlaylistDisplay.js` | `src/app/components/PlaylistDisplay.tsx` |
| `src/app/components/LoadingSpinner.js` | `src/app/components/LoadingSpinner.tsx` |
| `src/app/api/analyze-mood/route.js` | `src/app/api/analyze-mood/route.ts` |
| `src/app/api/generate-playlist/route.js` | `src/app/api/generate-playlist/route.ts` |
| `src/app/utils/huggingFaceMoodAnalyzer.js` | `src/app/utils/huggingFaceMoodAnalyzer.ts` |
| `src/app/utils/spotify.js` | `src/app/utils/spotify.ts` |

### Deleted Files

- `src/app/utils/moodAnalyzer.js` — dead code, never imported. The HuggingFace analyzer already has its own keyword-based fallback.

### New Files

- `src/app/types/index.ts` — shared type definitions

### Key Types

```ts
// Mood system
type PrimaryMood = "happy" | "sad" | "energetic" | "calm" | "romantic" | "angry" | "nostalgic" | "party";
type SecondaryMood = PrimaryMood | "anxious" | "excited" | "frustrated";
type MoodType = PrimaryMood | SecondaryMood;

// Mood analysis (returned from /api/analyze-mood)
interface MoodAnalysis {
  mood: PrimaryMood;
  secondaryMood: SecondaryMood | null;
  confidence: number;        // 0-1
  intensity: number;         // 1-10
  context: string;
  musicStyles: string[];
  method: "huggingface-emotion-analysis" | "fallback-enhanced-keywords";
  rawEmotions?: EmotionScore[];
  rawSentiment?: SentimentScore[];
}

interface EmotionScore {
  label: string;
  score: number;
}

interface SentimentScore {
  label: string;
  score: number;
}

// Spotify track (formatted, returned from /api/generate-playlist)
interface SpotifyTrack {
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

// Playlist (returned from /api/generate-playlist)
interface Playlist {
  mood: string;
  tracks: SpotifyTrack[];
  method: string;
  note: string;
}

// Component props
interface MoodInputProps {
  onMoodSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

interface PlaylistDisplayProps {
  playlist: Playlist;
  moodAnalysis: MoodAnalysis;
}

interface LoadingSpinnerProps {
  message?: string;
}

// API response wrappers
interface AnalyzeMoodResponse {
  success: boolean;
  analysis: MoodAnalysis;
}

interface GeneratePlaylistResponse {
  success: boolean;
  playlist: Playlist;
}

interface ApiErrorResponse {
  error: string;
  details?: string;
}
```

### TypeScript Config

- `strict: true`
- Target: ES2022
- Module: ESNext
- `@/*` path alias preserved (maps to `./src/app/*`)
- JSX: react-jsx (Next.js default)

---

## 2. Biome Configuration

### Remove

- `eslint.config.mjs`
- Dev dependencies: `@eslint/eslintrc`, `eslint`, `eslint-config-next`

### Add

- `@biomejs/biome` as dev dependency

### Scripts

```json
{
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write ."
}
```

### `biome.json` Config

**Formatter:**
- 2-space indent
- Double quotes (matches existing codebase)
- 100 char line width (generous for JSX)
- Trailing commas: all
- Semicolons: always

**Linter — enabled beyond defaults:**
- `complexity/noExcessiveCognitiveComplexity` — flag overly nested logic
- `suspicious/noExplicitAny` — warn (not error, pragmatic strict)
- `suspicious/noConsoleLog` — warn (keep console.error in API routes, flag stray console.log)
- `correctness/noUnusedImports` — error
- `correctness/noUnusedVariables` — error
- `style/useConst` — error
- `style/noNonNullAssertion` — warn
- `performance/noDelete` — error

**Linter — disabled:**
- `style/noParameterAssign` — off (common in reduce callbacks)

**Organize imports:** enabled, sorted

**Ignore:** `node_modules`, `.next`, `public`

---

## 3. Bug Fixes

### Bug 1: Corrupted Emoji (PlaylistDisplay)
- **Location:** `PlaylistDisplay.js:47` — nostalgic emoji is `�` (mojibake)
- **Fix:** Replace with proper emoji (e.g. `📻`)

### Bug 2: Unused `axios` Dependency
- **Location:** `package.json` — `axios` listed but never imported anywhere
- **Fix:** Remove from dependencies

### Bug 3: Duplicate Tracks in Fallback Path
- **Location:** `generate-playlist/route.js:19` — when fallback triggers, tracks from `getEnhancedMoodTracks` and `getMoodBasedTracks` are spread together without deduplication
- **Fix:** Deduplicate by track ID before slicing

### Bug 4: Error Details Leaked in Production
- **Location:** `generate-playlist/route.js:51` — `details: error.message` exposed in all environments
- **Fix:** Guard with `NODE_ENV === 'development'` check (matching analyze-mood route pattern)

---

## 4. Improvements

### Improvement 1: Spotify Token Caching
- **What:** Cache access token at module level with expiry timestamp
- **How:** Store `{ token, expiresAt }` in module variable. Return cached token if `Date.now() < expiresAt - 300_000` (5min buffer). Otherwise refresh.
- **Impact:** Eliminates unnecessary auth round-trip on every request

### Improvement 2: Input Sanitization
- **What:** Sanitize user text before sending to HuggingFace
- **How:** Trim whitespace, strip control characters (regex `[\x00-\x1F\x7F]`), collapse multiple spaces
- **Location:** `analyze-mood/route.ts` before calling `analyzeWithHuggingFace()`

### Improvement 3: Deterministic Mood Filtering
- **What:** Replace `Math.random() > 0.3` in `applyBasicMoodFiltering`
- **How:** Score-based system — tracks with include-keywords get +2, tracks with no keywords get 0, sort by score descending, return top N. No randomness.
- **Impact:** Consistent, reproducible playlist quality

### Improvement 4: Rate Limiting on API Routes
- **What:** Simple in-memory rate limiter (per-IP, sliding window)
- **How:** Map of `IP -> timestamp[]`, 20 requests per minute per IP. Clean up stale entries periodically.
- **Location:** Shared utility, applied in both API route handlers
- **Impact:** Prevents abuse without adding external dependencies

### Improvement 5: Voice Input Graceful Degradation
- **What:** Check for standard `SpeechRecognition` API in addition to webkit prefix
- **How:** `const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition`. If unavailable, show disabled mic button with tooltip instead of `alert()`
- **Impact:** Better UX on unsupported browsers

### Improvement 6: Fix ETag Config
- **What:** `next.config.js` has `generateEtags: false` which hurts caching
- **Fix:** Remove the line (default is `true`)

### Improvement 7: Parallelize Spotify Searches
- **What:** Sequential `for` loops in `getMoodBasedTracks` and `getEnhancedMoodTracks` await queries one at a time
- **How:** Use `Promise.all` to batch queries by category (all primary queries in parallel, all genre queries in parallel, etc.)
- **Impact:** Significantly faster playlist generation

### Improvement 8: Remove ESLint Suppressions
- **What:** Remove all `eslint-disable` comments (Biome doesn't use them)
- **Fix MoodInput:** The `react-hooks/exhaustive-deps` suppression — extract `generateRandomSuggestions` into a `useCallback` or move the initial call logic

### Improvement 9: Use Next.js Image for Album Art
- **What:** Replace raw `<img>` in PlaylistDisplay with `<Image>` from `next/image`
- **Impact:** Automatic optimization, lazy loading, proper sizing

---

## 5. Dependency Changes Summary

### Remove
- `sentiment` (unused after moodAnalyzer.js deletion)
- `axios` (never imported)
- `eslint`, `@eslint/eslintrc`, `eslint-config-next` (replaced by Biome)

### Add
- `@biomejs/biome` (dev)
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node` (dev)

---

## 6. Out of Scope

- No UI/UX redesign
- No new features
- No database or caching layer (beyond Spotify token)
- No testing setup (separate initiative)
- No CI/CD changes
