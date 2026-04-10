"use client";

import { motion } from "framer-motion";
import type { MoodSummaryProps } from "@/types";

export default function MoodSummary({ summary, description }: MoodSummaryProps) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{summary}</h2>
      <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">{description}</p>
    </motion.div>
  );
}
