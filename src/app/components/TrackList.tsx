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
          className="flex items-center gap-3 p-3 rounded-xl glass-hover transition-colors group"
        >
          <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-white/5">
            {track.image ? (
              <Image
                src={track.image}
                alt={track.album}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </div>

          <div className="grow min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{track.name}</p>
            <p className="text-xs text-slate-500 truncate">{track.artist}</p>
          </div>

          <span className="text-xs text-slate-600 hidden sm:block tabular-nums">
            {formatDuration(track.duration_ms)}
          </span>

          {track.external_url && (
            <a
              href={track.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-600 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
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
