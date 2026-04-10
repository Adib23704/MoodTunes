export interface EmotionScore {
  label: string;
  score: number;
}

export interface LlmMoodResult {
  summary: string;
  queries: string[];
  description: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string | null;
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

export interface TokenCache {
  token: string;
  expiresAt: number;
}

export interface GenerateResponse {
  emotions: EmotionScore[];
  mood: {
    summary: string;
    description: string;
  };
  playlist: {
    tracks: SpotifyTrack[];
    queries: string[];
    method: "llm-generated" | "fallback-keyword";
  };
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

export interface MoodInputProps {
  onMoodSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

export interface EmotionChartProps {
  emotions: EmotionScore[];
}

export interface MoodSummaryProps {
  summary: string;
  description: string;
}

export interface TrackListProps {
  tracks: SpotifyTrack[];
}

export interface SmartPromptsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

export interface RecentMoodsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

export interface LoadingStateProps {
  message?: string;
}

export interface AmbientBackgroundProps {
  emotions: EmotionScore[];
}
