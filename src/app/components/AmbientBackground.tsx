"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { AmbientBackgroundProps } from "@/types";

const EMOTION_COLORS: Record<string, string> = {
  joy: "rgba(250, 204, 21, 0.15)",
  love: "rgba(244, 114, 182, 0.15)",
  sadness: "rgba(96, 165, 250, 0.15)",
  anger: "rgba(248, 113, 113, 0.15)",
  fear: "rgba(167, 139, 250, 0.12)",
  surprise: "rgba(251, 191, 36, 0.15)",
  admiration: "rgba(249, 168, 212, 0.12)",
  excitement: "rgba(251, 146, 60, 0.15)",
  nostalgia: "rgba(217, 170, 100, 0.12)",
  optimism: "rgba(163, 230, 53, 0.12)",
  gratitude: "rgba(134, 239, 172, 0.12)",
  caring: "rgba(196, 181, 253, 0.12)",
  desire: "rgba(236, 72, 153, 0.15)",
  amusement: "rgba(253, 224, 71, 0.12)",
  curiosity: "rgba(34, 211, 238, 0.12)",
  neutral: "rgba(139, 92, 246, 0.1)",
};

const DEFAULT_COLORS = [
  "rgba(139, 92, 246, 0.12)",
  "rgba(236, 72, 153, 0.1)",
  "rgba(99, 102, 241, 0.08)",
];

export default function AmbientBackground({ emotions }: AmbientBackgroundProps) {
  const colors = useMemo(() => {
    if (emotions.length === 0) return DEFAULT_COLORS;
    return emotions.slice(0, 3).map(
      (e) => EMOTION_COLORS[e.label] ?? "rgba(139, 92, 246, 0.1)",
    );
  }, [emotions]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: 500,
          height: 500,
          top: "10%",
          left: "15%",
          background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 15, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: 400,
          height: 400,
          bottom: "15%",
          right: "10%",
          background: `radial-gradient(circle, ${colors[1] ?? colors[0]} 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, -25, 20, 0],
          y: [0, 20, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: 300,
          height: 300,
          top: "50%",
          left: "60%",
          background: `radial-gradient(circle, ${colors[2] ?? colors[0]} 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -20, 25, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
