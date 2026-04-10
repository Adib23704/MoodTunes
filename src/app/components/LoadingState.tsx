"use client";

import { motion } from "framer-motion";
import type { LoadingStateProps } from "@/types";

export default function LoadingState({ message = "Feeling your vibe..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      <div className="relative w-48 h-48">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-violet-500/20"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.4, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div
          className="absolute inset-[35%] rounded-full bg-violet-500/10"
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.p
        className="text-slate-300 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </div>
  );
}
