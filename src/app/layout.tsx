import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoodTunes - AI-Powered Music for Every Mood",
  description:
    "Discover personalized music playlists based on your current mood using AI-powered emotion analysis and Spotify integration.",
  keywords:
    "mood music, AI playlist generator, Spotify integration, music recommendation, emotion analysis, personalized playlists",
  authors: [{ name: "Adib23704", url: "https://adibdev.me" }],
  creator: "Adib23704",
  publisher: "MoodTunes",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://moodtunes.adibdev.me"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "MoodTunes - AI-Powered Music for Every Mood",
    description:
      "Discover personalized music playlists based on your current mood using AI-powered emotion analysis and Spotify integration.",
    url: "https://moodtunes.adibdev.me",
    siteName: "MoodTunes",
    images: [
      {
        url: "/images/cover-image.jpg",
        width: 1200,
        height: 630,
        alt: "MoodTunes - AI-Powered Music for Every Mood",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodTunes - AI-Powered Music for Every Mood",
    description:
      "Discover personalized music playlists based on your current mood using AI-powered emotion analysis and Spotify integration.",
    images: ["/images/cover-image.jpg"],
    creator: "@adib2374",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MoodTunes" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/manifest.json" />

        <link rel="preconnect" href="https://api.spotify.com" />
        <link rel="preconnect" href="https://accounts.spotify.com" />
        <link rel="dns-prefetch" href="https://i.scdn.co" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MoodTunes",
              description:
                "AI-powered music discovery based on your emotional state.",
              url: "https://moodtunes.adibdev.me",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web Browser",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              creator: { "@type": "Person", name: "Adib", url: "https://adibdev.me" },
            }),
          }}
        />
      </head>
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
