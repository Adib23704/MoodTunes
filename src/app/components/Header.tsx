"use client";

import { motion } from "framer-motion";
import { Headphones, Heart, Music } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-linear-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-10 left-10 w-20 h-20"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity },
          }}
        >
          <Music className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-20 right-20 w-16 h-16"
          animate={{
            rotate: -360,
            y: [0, -20, 0],
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 3, repeat: Infinity },
          }}
        >
          <Headphones className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/3 w-12 h-12"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Heart className="w-full h-full" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Image
              src="/logo.png"
              alt="MoodTunes Logo"
              width={64}
              height={64}
              className="mr-4"
              loading="eager"
            />
          </motion.div>
          <h1 className="text-5xl font-bold bg-linear-to-r from-white to-purple-200 bg-clip-text text-transparent">
            MoodTunes
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl opacity-90 mb-4"
        >
          Discover music that matches your mood
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center gap-8 text-sm opacity-75"
        >
          <span>🎵 AI-Powered</span>
          <span>🎧 Spotify Integration</span>
          <span>❤️ Mood-Based</span>
        </motion.div>
      </div>
    </header>
  );
}
