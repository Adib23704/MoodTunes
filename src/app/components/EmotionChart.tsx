"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { EmotionChartProps } from "@/types";

const NUM_EMOTIONS = 8;
const MIN_BAR_RATIO = 0.12;

const EMOTION_COLORS: Record<string, string> = {
  joy: "#facc15",
  love: "#f472b6",
  sadness: "#60a5fa",
  anger: "#f87171",
  fear: "#a78bfa",
  surprise: "#fbbf24",
  admiration: "#f9a8d4",
  excitement: "#fb923c",
  nostalgia: "#d9aa64",
  optimism: "#a3e635",
  gratitude: "#86efac",
  caring: "#c4b5fd",
  desire: "#ec4899",
  amusement: "#fde047",
  curiosity: "#22d3ee",
  neutral: "#94a3b8",
  approval: "#a5b4fc",
  realization: "#67e8f9",
  annoyance: "#fb7185",
  disappointment: "#7dd3fc",
  disapproval: "#f87171",
  confusion: "#c084fc",
  embarrassment: "#fca5a5",
  grief: "#93c5fd",
  nervousness: "#d8b4fe",
  pride: "#fbbf24",
  relief: "#6ee7b7",
  remorse: "#a5b4fc",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getColor(label: string): string {
  return EMOTION_COLORS[label] ?? "#8b5cf6";
}

export default function EmotionChart({ emotions }: EmotionChartProps) {
  const topEmotions = useMemo(() => emotions.slice(0, NUM_EMOTIONS), [emotions]);
  const maxScore = useMemo(() => Math.max(...topEmotions.map((e) => e.score), 0.01), [topEmotions]);

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col gap-3">
        {topEmotions.map((emotion, i) => {
          const pct = Math.round(emotion.score * 100);
          const normalized = emotion.score / maxScore;
          const barWidth = MIN_BAR_RATIO + normalized * (1 - MIN_BAR_RATIO);
          const color = getColor(emotion.label);
          const isTop = i === 0;

          return (
            <motion.div
              key={emotion.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: "easeOut" }}
            >
              <span
                className={`w-24 text-right shrink-0 ${
                  isTop ? "text-sm font-semibold" : "text-sm"
                }`}
                style={{ color: isTop ? color : "#cbd5e1" }}
              >
                {capitalize(emotion.label)}
              </span>

              <div className="flex-1 h-8 rounded-full bg-white/3 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, ${color}33 0%, ${color} 100%)`,
                    boxShadow: isTop ? `0 0 20px ${color}40` : "none",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth * 100}%` }}
                  transition={{
                    delay: 0.2 + i * 0.06,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                >
                  {isTop && (
                    <div
                      className="absolute inset-0 shimmer-overlay"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                      }}
                    />
                  )}
                </motion.div>
              </div>

              <span
                className={`w-10 text-right tabular-nums ${
                  isTop ? "text-sm font-semibold" : "text-sm"
                }`}
                style={{ color: isTop ? color : "#94a3b8" }}
              >
                {pct}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
