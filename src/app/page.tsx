"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import AmbientBackground from "@/components/AmbientBackground";
import EmotionChart from "@/components/EmotionChart";
import LoadingState from "@/components/LoadingState";
import MoodInput from "@/components/MoodInput";
import MoodSummary from "@/components/MoodSummary";
import TrackList from "@/components/TrackList";
import type { GenerateResponse } from "@/types";

export default function Home() {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const hasResults = result !== null;
  const showInputView = !hasResults && !isLoading;

  return (
    <div className="min-h-screen relative">
      <AmbientBackground emotions={result?.emotions ?? []} />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {showInputView && !error && (
            <motion.div
              key="input-view"
              className="min-h-screen flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <MoodInput onMoodSubmit={handleMoodSubmit} isLoading={isLoading} />
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading-view"
              className="min-h-screen flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div
              key="error-view"
              className="min-h-screen flex flex-col items-center justify-center px-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass rounded-2xl p-6 max-w-md text-center">
                <p className="text-red-400 font-medium mb-2">Something went wrong</p>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setResult(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm hover:bg-violet-500 transition-colors"
                >
                  Try again
                </button>
              </div>
            </motion.div>
          )}

          {hasResults && !isLoading && (
            <motion.div
              key="results-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="sticky top-0 z-20 bg-[#0a0a1a]/80 backdrop-blur-lg border-b border-white/5 py-3 px-4">
                <MoodInput onMoodSubmit={handleMoodSubmit} isLoading={isLoading} compact />
              </div>

              <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-[40%] flex flex-col items-center gap-6">
                    <EmotionChart emotions={result.emotions} />
                    <MoodSummary
                      summary={result.mood.summary}
                      description={result.mood.description}
                    />
                  </div>

                  <div className="lg:w-[60%]">
                    <div className="flex items-baseline justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Your Playlist</h3>
                      <span className="text-xs text-slate-500">
                        {result.playlist.tracks.length} tracks
                      </span>
                    </div>
                    <TrackList tracks={result.playlist.tracks} />
                  </div>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
