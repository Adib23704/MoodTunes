"use client";

import { motion } from "framer-motion";
import type { MoodSummaryProps } from "@/types";

export default function MoodSummary({ summary, description }: MoodSummaryProps) {
  return (
    <div className="text-center">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeInOut" }}
      >
        {summary}
      </motion.h2>
      <motion.p
        className="text-base text-slate-300 leading-relaxed max-w-sm mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
      >
        {description}
      </motion.p>
    </div>
  );
}
