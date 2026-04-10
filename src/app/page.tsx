"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import MoodInput from "@/components/MoodInput";
import PlaylistDisplay from "@/components/PlaylistDisplay";
import type { GenerateResponse } from "@/types";

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

function mapToLegacyPlaylist(data: GenerateResponse) {
  return {
    mood: data.mood.summary.toLowerCase().split(" ")[0],
    tracks: data.playlist.tracks,
    method: data.playlist.method,
    note: data.mood.description,
  };
}

function mapToLegacyMoodAnalysis(data: GenerateResponse) {
  const topEmotion = data.emotions[0]?.label ?? "calm";
  return {
    mood: topEmotion,
    secondaryMood: data.emotions[1]?.label ?? null,
    confidence: data.emotions[0]?.score ?? 0.5,
    intensity: Math.round((data.emotions[0]?.score ?? 0.5) * 10),
    context: data.mood.description,
    musicStyles: data.playlist.queries.slice(0, 5),
    method: data.playlist.method,
  };
}

export default function Home() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<string>("default");

  useEffect(() => {
    if (result?.emotions[0]) {
      const topEmotion = result.emotions[0].label;
      const emotionToMood: Record<string, string> = {
        joy: "happy",
        sadness: "sad",
        anger: "angry",
        love: "romantic",
        fear: "calm",
        excitement: "energetic",
        nostalgia: "nostalgic",
        amusement: "party",
      };
      setCurrentMood(emotionToMood[topEmotion] ?? "default");
    }
  }, [result]);

  const handleMoodSubmit = async (moodText: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: moodText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Failed to generate playlist");
      }

      const data: GenerateResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const background = MOOD_BACKGROUNDS[currentMood] ?? MOOD_BACKGROUNDS.default;
  const legacyPlaylist = result ? mapToLegacyPlaylist(result) : null;
  const legacyMoodAnalysis = result ? mapToLegacyMoodAnalysis(result) : null;

  return (
    <div className={`min-h-screen bg-linear-to-br ${background} transition-all duration-1000`}>
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

          {legacyPlaylist && !isLoading && legacyMoodAnalysis && (
            <PlaylistDisplay playlist={legacyPlaylist} moodAnalysis={legacyMoodAnalysis} />
          )}

          {!result && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-600 mt-12"
            >
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
                <p className="text-xl mb-4">
                  Tell us how you&apos;re feeling and we&apos;ll create the perfect playlist for
                  you!
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
    </div>
  );
}
