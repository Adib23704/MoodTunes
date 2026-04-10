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
