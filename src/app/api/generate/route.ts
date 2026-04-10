import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { GenerateResponse, SpotifyTrack } from "@/types";
import { analyzeEmotions } from "@/utils/emotionAnalyzer";
import { generateFallbackResult, generateKeywordEmotions } from "@/utils/fallback";
import { generateMoodAndQueries } from "@/utils/llm";
import { isRateLimited } from "@/utils/rateLimit";
import { getSpotifyAccessToken, searchTracksFromQueries } from "@/utils/spotify";

function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ");
}

function formatTrack(track: {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url: string | null;
  external_urls: { spotify: string };
  duration_ms: number;
  popularity: number;
}): SpotifyTrack {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists?.map((a) => a.name).join(", ") ?? "Unknown Artist",
    album: track.album?.name ?? "Unknown Album",
    image: track.album?.images?.[0]?.url ?? null,
    external_url: track.external_urls?.spotify ?? null,
    duration_ms: track.duration_ms ?? 0,
    popularity: track.popularity ?? 0,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const rawText: unknown = body.text;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const text = sanitizeInput(rawText);

    if (text.length > 1000) {
      return NextResponse.json(
        { error: "Text too long. Please limit to 1000 characters." },
        { status: 400 },
      );
    }

    let emotions = await analyzeEmotions(text).catch((error) => {
      console.error("Emotion analysis failed, using keyword fallback:", error);
      return generateKeywordEmotions(text);
    });

    if (emotions.length === 0) {
      emotions = generateKeywordEmotions(text);
    }

    const llmResult = await generateMoodAndQueries(text, emotions);
    const moodResult = llmResult ?? generateFallbackResult(emotions);
    const method = llmResult ? ("llm-generated" as const) : ("fallback-keyword" as const);

    const accessToken = await getSpotifyAccessToken();
    const rawTracks = await searchTracksFromQueries(moodResult.queries, accessToken, 25);

    if (rawTracks.length === 0) {
      return NextResponse.json(
        { error: "No tracks found. Please try describing your mood differently." },
        { status: 404 },
      );
    }

    const tracks = rawTracks.map(formatTrack);

    const response: GenerateResponse = {
      emotions: emotions.slice(0, 28),
      mood: {
        summary: moodResult.summary,
        description: moodResult.description,
      },
      playlist: {
        tracks,
        queries: moodResult.queries,
        method,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate playlist. Please try again.",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
