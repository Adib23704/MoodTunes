"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock, ExternalLink, Music } from "lucide-react";
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
                Detected Mood:{" "}
                {moodAnalysis.mood.charAt(0).toUpperCase() + moodAnalysis.mood.slice(1)}
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
              <div className="hidden sm:block text-center text-gray-400 text-sm w-8">
                {index + 1}
              </div>
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
              <div className="flex-grow min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{track.name}</h4>
                <p className="text-gray-600 text-sm truncate">{track.artist}</p>
                <p className="text-sm text-gray-500 truncate hidden md:block">{track.album}</p>
              </div>
              <div className="hidden sm:flex items-center text-gray-500 text-sm mr-4">
                <Clock className="w-4 h-4 mr-1.5" />
                {formatDuration(track.duration_ms)}
              </div>
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
