"use client";

import { motion } from "framer-motion";
import { ExternalLink, Music } from "lucide-react";
import Image from "next/image";
import type { TrackListProps } from "@/types";

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TrackList({ tracks }: TrackListProps) {
  return (
    <div className="flex flex-col gap-1">
      {tracks.map((track, index) => (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + index * 0.03 }}
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 p-3 rounded-xl glass-hover transition-colors group relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(139,92,246,0.08) 0%, rgba(236,72,153,0.04) 100%)",
            }}
          />

          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-0.75 rounded-r-full bg-linear-to-b from-violet-500 to-pink-500 group-hover:h-3/5 transition-all duration-300 ease-out" />

          <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-white/5 z-10">
            {track.image ? (
              <Image
                src={track.image}
                alt={track.album}
                width={44}
                height={44}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div className="absolute inset-0 rounded-lg ring-1 ring-violet-500/0 group-hover:ring-violet-500/40 transition-all duration-300" />
          </div>

          <div className="grow min-w-0 z-10">
            <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate transition-colors duration-300">
              {track.name}
            </p>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 truncate transition-colors duration-300">
              {track.artist}
            </p>
          </div>

          <span className="text-xs text-slate-500 group-hover:text-slate-300 hidden sm:block tabular-nums transition-colors duration-300 z-10">
            {formatDuration(track.duration_ms)}
          </span>

          {track.external_url && (
            <a
              href={track.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-green-400 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0 z-10"
              title="Open in Spotify"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </motion.div>
      ))}
    </div>
  );
}
