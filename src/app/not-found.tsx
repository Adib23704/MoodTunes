import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Head back to MoodTunes.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute pointer-events-none rounded-full blur-[120px]"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative text-center max-w-md">
        <p className="text-violet-400 text-sm font-medium mb-4 tracking-widest uppercase">
          404 - Lost in the playlist
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-300 text-base mb-8 leading-relaxed">
          This track isn't in our library. Let's get you back to discovering music that matches your
          mood.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
        >
          Back to MoodTunes
        </Link>
      </div>
    </div>
  );
}
