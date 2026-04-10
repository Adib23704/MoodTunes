import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const SITE_URL = "https://moodtunes.adibdev.me";
const SITE_NAME = "MoodTunes";
const SITE_DESCRIPTION =
  "Free AI-powered music discovery. Type or speak how you feel - MoodTunes detects 28 distinct emotions and curates a Spotify playlist that matches your exact mood. No signup, no limits.";

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MoodTunes - AI-Powered Music for Every Mood",
    template: "%s | MoodTunes",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "music",
  classification: "Music Discovery",
  keywords: [
    "mood music",
    "AI playlist generator",
    "emotion-based music",
    "Spotify playlist generator",
    "AI music recommendation",
    "free music discovery",
    "music for mood",
    "emotion AI",
    "personalized playlist",
    "AI music app",
    "open source music app",
    "mood detection",
    "emotional analysis",
    "music curation AI",
    "Hugging Face music",
  ],
  authors: [{ name: "Adib", url: "https://adibdev.me" }],
  creator: "Adib",
  publisher: "Adib",
  formatDetection: { email: false, address: false, telephone: false },
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "MoodTunes - AI-Powered Music for Every Mood",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/cover-image.jpg",
        width: 1200,
        height: 630,
        alt: "MoodTunes logo with gradient headphones - AI-powered music discovery",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodTunes - AI-Powered Music for Every Mood",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/cover-image.jpg",
        alt: "MoodTunes - AI-powered music discovery",
      },
    ],
    creator: "@adib2374",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "MoodTunes",
    statusBarStyle: "black-translucent",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "MoodTunes - AI Music Discovery",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Music Discovery",
  operatingSystem: "Any (Web Browser)",
  browserRequirements: "Requires JavaScript. Modern browser recommended.",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Person",
    name: "Adib",
    url: "https://adibdev.me",
  },
  author: {
    "@type": "Person",
    name: "Adib",
    url: "https://adibdev.me",
  },
  publisher: {
    "@type": "Person",
    name: "Adib",
    url: "https://adibdev.me",
  },
  image: `${SITE_URL}/images/cover-image.jpg`,
  screenshot: `${SITE_URL}/images/cover-image.jpg`,
  featureList: [
    "AI-powered emotion analysis using 28 distinct emotion labels",
    "LLM-curated Spotify playlists with personalized descriptions",
    "Voice input via Web Speech API",
    "Time-aware mood prompts",
    "Radial emotion visualization chart",
    "Mood-reactive ambient background",
    "Free with no signup or limits",
    "Open source codebase",
    "Fully responsive design",
  ],
  keywords: "mood music, AI playlist, emotion analysis, Spotify, music discovery, free music app",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?mood={mood_query}`,
    "query-input": "required name=mood_query",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://api.spotify.com" />
        <link rel="preconnect" href="https://accounts.spotify.com" />
        <link rel="dns-prefetch" href="https://i.scdn.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
