import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoodTunes - AI-Powered Music for Every Mood",
    short_name: "MoodTunes",
    description:
      "Free AI-powered music discovery. MoodTunes detects 28 distinct emotions from your text and curates a Spotify playlist that matches your exact mood.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a1a",
    theme_color: "#0a0a1a",
    categories: ["music", "entertainment", "lifestyle"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      {
        src: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/android-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon/android-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
