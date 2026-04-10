"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { SmartPromptsProps } from "@/types";

const PROMPTS_BY_TIME: Record<string, string[]> = {
  morning: [
    "morning coffee mood",
    "fresh start energy",
    "waking up slowly",
    "sunrise calm",
    "ready to take on the day",
  ],
  afternoon: [
    "afternoon focus",
    "midday motivation",
    "lunch break vibes",
    "powering through",
    "need a pick-me-up",
  ],
  evening: [
    "evening wind-down",
    "golden hour feeling",
    "cooking dinner mood",
    "unwinding after work",
    "sunset reflections",
  ],
  night: [
    "late night thoughts",
    "can't sleep energy",
    "midnight drive",
    "winding down",
    "nocturnal vibes",
  ],
  latenight: [
    "still up at this hour",
    "quiet hours",
    "dawn is coming",
    "3am thoughts",
    "the world is asleep",
  ],
};

function getTimeWindow(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  if (hour >= 21 || hour < 2) return "night";
  return "latenight";
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function SmartPrompts({ onSelect, disabled }: SmartPromptsProps) {
  const prompts = useMemo(() => {
    const window = getTimeWindow();
    return pickRandom(PROMPTS_BY_TIME[window], 4);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {prompts.map((prompt, index) => (
        <motion.button
          key={prompt}
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          className="px-4 py-2 text-sm rounded-full glass glass-hover text-violet-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.02, 1],
          }}
          transition={{
            opacity: { delay: 0.5 + index * 0.08, duration: 0.4, ease: "easeInOut" },
            y: { delay: 0.5 + index * 0.08, duration: 0.4, ease: "easeInOut" },
            scale: {
              delay: 1 + index * 0.6,
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
}
