"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { RecentMoodsProps } from "@/types";

const STORAGE_KEY = "recentMoods";
const MAX_MOODS = 5;

export function saveRecentMood(text: string): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const moods: string[] = saved ? JSON.parse(saved) : [];
    const updated = [text, ...moods.filter((m) => m !== text)].slice(0, MAX_MOODS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

export default function RecentMoods({ onSelect, disabled }: RecentMoodsProps) {
  const [moods, setMoods] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMoods(JSON.parse(saved));
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (moods.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <span className="text-xs text-slate-400 self-center mr-1">Recent:</span>
      {moods.map((mood) => (
        <motion.button
          key={mood}
          onClick={() => onSelect(mood)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm rounded-full border border-white/6 text-slate-400 hover:text-violet-300 hover:border-violet-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mood.length > 30 ? `${mood.slice(0, 30)}...` : mood}
        </motion.button>
      ))}
    </div>
  );
}
