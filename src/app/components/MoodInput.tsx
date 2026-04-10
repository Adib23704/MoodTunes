"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Send } from "lucide-react";
import { useCallback, useState } from "react";
import RecentMoods, { saveRecentMood } from "@/components/RecentMoods";
import SmartPrompts from "@/components/SmartPrompts";
import type { MoodInputProps } from "@/types";

const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition })
      .webkitSpeechRecognition ??
    null
  );
};

interface MoodInputInternalProps extends MoodInputProps {
  compact?: boolean;
}

export default function MoodInput({
  onMoodSubmit,
  isLoading,
  compact = false,
}: MoodInputInternalProps) {
  const [moodText, setMoodText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(() => getSpeechRecognition() !== null);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (moodText.trim() && !isLoading) {
        saveRecentMood(moodText.trim());
        onMoodSubmit(moodText.trim());
      }
    },
    [moodText, isLoading, onMoodSubmit],
  );

  const handlePromptSelect = useCallback((text: string) => {
    setMoodText(text);
  }, []);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setMoodText(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }, []);

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="Try a different mood..."
            className="w-full px-5 py-3 pr-24 rounded-xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40 transition-colors text-sm"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
            {voiceSupported && (
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={isLoading || isListening}
                className="p-2 rounded-lg text-slate-400 hover:text-violet-400 transition-colors"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button
              type="submit"
              disabled={!moodText.trim() || isLoading}
              className="p-2 rounded-lg bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="brand-float text-5xl sm:text-6xl font-bold text-white tracking-tight mb-3">
          MoodTunes
        </h1>
        <motion.p
          className="text-slate-300 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
        >
          How are you feeling?
        </motion.p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="w-full"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeInOut" }}
      >
        <div className="relative">
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="Describe your mood..."
            className="w-full p-5 pr-14 rounded-2xl bg-white/5 border border-white/8 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40 transition-colors resize-none h-32 text-base leading-relaxed"
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            {voiceSupported && (
              <motion.button
                type="button"
                onClick={startVoiceInput}
                disabled={isLoading || isListening}
                className={`p-2.5 rounded-xl transition-colors ${
                  isListening
                    ? "bg-red-500/20 text-red-400"
                    : "text-slate-400 hover:text-violet-400"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}
            <motion.button
              type="submit"
              disabled={!moodText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-linear-to-r from-violet-600 to-pink-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-sm text-red-400"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Listening...
            </motion.span>
          </motion.div>
        )}
      </motion.form>

      <SmartPrompts onSelect={handlePromptSelect} disabled={isLoading} />
      <RecentMoods onSelect={handlePromptSelect} disabled={isLoading} />
    </div>
  );
}
