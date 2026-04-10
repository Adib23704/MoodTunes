"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Heart, Mic, MicOff, Moon, Send, Shuffle, Sparkles, Sun, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

const MOOD_PROMPT_POOL = [
  "I'm feeling on top of the world today!",
  "Give me some sunshine vibes!",
  "I want to dance like nobody's watching!",
  "Feeling absolutely fantastic right now!",
  "I need some feel-good energy!",
  "Today feels like a celebration!",
  "I'm radiating positive vibes!",
  "Give me music that matches my bright mood!",
  "Need something to match my mellow mood.",
  "I want to relax and unwind completely.",
  "Give me some chill vibes for studying.",
  "Need some peaceful piano music.",
  "I want to feel zen and centered.",
  "Looking for ambient sounds to calm my mind.",
  "I need music for meditation time.",
  "Give me something soothing for my soul.",
  "Give me some motivation for my workout!",
  "I want to rock out with high energy!",
  "I need pump-up music right now!",
  "Give me songs that make me feel powerful!",
  "I want to feel empowered and strong!",
  "Need some adrenaline-pumping beats!",
  "I want music that gets my blood flowing!",
  "Give me something to fuel my determination!",
  "Looking for love songs tonight.",
  "I'm in the mood for romance.",
  "Give me something for a candlelit dinner.",
  "I want music that touches my heart.",
  "Need some slow dance music.",
  "I'm feeling sentimental about love.",
  "Give me songs about deep connections.",
  "I want music for intimate moments.",
  "Feeling nostalgic for the 90s.",
  "I want to reminisce about old times.",
  "Give me some throwback classics.",
  "I'm in a reflective, contemplative mood.",
  "Need music that brings back memories.",
  "I want to travel back in time through music.",
  "Give me songs from my childhood.",
  "I'm feeling sentimental about the past.",
  "I want to party all night!",
  "Give me some club bangers!",
  "I need music for a house party!",
  "I want to feel the festival vibes!",
  "Give me something to get the crowd moving!",
  "I need dance floor anthems!",
  "I want music that makes everyone sing along!",
  "Give me beats that make me want to celebrate!",
  "Feeling a bit blue, need some comfort music.",
  "I want songs that understand my sadness.",
  "Give me music for when I'm feeling down.",
  "I need something cathartic and emotional.",
  "I want to embrace my melancholy mood.",
  "Give me songs for a rainy day.",
  "I need music that helps me process emotions.",
  "I want something beautifully sad.",
  "It's a rainy day, I want cozy tunes.",
  "I want music for a road trip adventure.",
  "Give me songs for a sunny day.",
  "I need background music while I cook.",
  "I want something for my morning coffee.",
  "Give me music for a late-night drive.",
  "I need tunes for cleaning the house.",
  "I want something for a lazy Sunday.",
  "Feeling adventurous, show me something different.",
  "Surprise me with something completely new!",
  "I want to discover music I've never heard.",
  "Give me something unexpected and unique.",
  "I'm open to any genre, surprise me!",
  "I want to explore new musical territories.",
  "Show me something that will blow my mind!",
  "I'm ready for a musical adventure!",
  "I need music to help me focus and concentrate.",
  "Give me background music for productivity.",
  "I want something that helps me get in the zone.",
  "I need music for deep work sessions.",
  "Give me something that boosts creativity.",
  "I want ambient music for brainstorming.",
  "I need tunes that help me stay motivated at work.",
  "Give me music that enhances my flow state.",
] as const;

interface QuickMoodButton {
  mood: string;
  icon: typeof Sun;
  color: string;
  text: string;
}

const QUICK_MOOD_BUTTONS: QuickMoodButton[] = [
  {
    mood: "happy",
    icon: Sun,
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    text: "Happy & Upbeat",
  },
  {
    mood: "calm",
    icon: Moon,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    text: "Calm & Peaceful",
  },
  {
    mood: "energetic",
    icon: Zap,
    color: "bg-red-100 text-red-700 hover:bg-red-200",
    text: "Energetic & Pumped",
  },
  {
    mood: "romantic",
    icon: Heart,
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    text: "Romantic & Loving",
  },
  {
    mood: "nostalgic",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    text: "Nostalgic & Reflective",
  },
  {
    mood: "party",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    text: "Party & Dance",
  },
];

export default function MoodInput({ onMoodSubmit, isLoading }: MoodInputProps) {
  const [moodText, setMoodText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const generateRandomSuggestions = useCallback(() => {
    const shuffled = [...MOOD_PROMPT_POOL].sort(() => 0.5 - Math.random());
    setCurrentSuggestions(shuffled.slice(0, 8));
    setShuffleKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("recentMoods");
    if (saved) {
      setRecentMoods(JSON.parse(saved));
    }
    generateRandomSuggestions();
    setVoiceSupported(getSpeechRecognition() !== null);
  }, [generateRandomSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodText.trim() && !isLoading) {
      const newRecentMoods = [
        moodText.trim(),
        ...recentMoods.filter((m) => m !== moodText.trim()),
      ].slice(0, 5);
      setRecentMoods(newRecentMoods);
      localStorage.setItem("recentMoods", JSON.stringify(newRecentMoods));
      onMoodSubmit(moodText.trim());
      setShowSuggestions(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setMoodText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.form
        onSubmit={handleSubmit}
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="How are you feeling today? Describe your mood in detail..."
            className="w-full p-6 pr-24 border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:outline-none resize-none h-40 text-lg bg-white/80 backdrop-blur-sm shadow-lg"
            disabled={isLoading}
          />
          <div className="absolute bottom-16 right-4 text-sm text-gray-400">
            {moodText.length}/500
          </div>
          <div className="absolute right-4 bottom-4 flex gap-2">
            <motion.button
              type="button"
              onClick={startVoiceInput}
              disabled={isLoading || isListening || !voiceSupported}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-lg"
                  : voiceSupported
                    ? "bg-white/80 hover:bg-gray-100 text-gray-600 shadow-md"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-md"
              }`}
              whileHover={voiceSupported ? { scale: 1.05 } : undefined}
              whileTap={voiceSupported ? { scale: 0.95 } : undefined}
              title={
                voiceSupported ? "Voice input" : "Voice input is not supported in your browser"
              }
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            <motion.button
              type="submit"
              disabled={!moodText.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center"
          >
            <div className="flex items-center justify-center gap-2 text-red-600">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
              <span>Listening... Speak now!</span>
            </div>
          </motion.div>
        )}
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Quick Mood Selection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_MOOD_BUTTONS.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <motion.button
                key={button.mood}
                onClick={() => setMoodText(`I'm feeling ${button.text.toLowerCase()}`)}
                className={`p-4 rounded-xl ${button.color} transition-all flex items-center gap-3 shadow-md hover:shadow-lg`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                disabled={isLoading}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{button.text}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {recentMoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Recent Moods</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {recentMoods.map((mood) => (
              <motion.button
                key={mood}
                onClick={() => setMoodText(mood)}
                className="px-4 py-2 bg-gray-100 hover:bg-purple-100 border border-gray-200 hover:border-purple-300 rounded-full transition-all text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {mood}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Need Inspiration?</h3>
              <motion.button
                onClick={generateRandomSuggestions}
                className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full transition-all"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                title="Get new suggestions"
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>
            </div>
            <motion.div
              key={shuffleKey}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentSuggestions.map((suggestion, suggestionIndex) => (
                <motion.button
                  key={suggestion}
                  onClick={() => setMoodText(suggestion)}
                  className="p-4 text-left bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-300 rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * suggestionIndex }}
                  disabled={isLoading}
                >
                  <span className="text-purple-600 mr-2">💭</span>
                  &quot;{suggestion}&quot;
                </motion.button>
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-xs text-gray-500 mt-4"
            >
              Click the shuffle button to get fresh inspiration! ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
