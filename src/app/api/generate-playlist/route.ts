import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SpotifyTrack } from "@/types";
import { isRateLimited } from "@/utils/rateLimit";
import { getEnhancedMoodTracks, getMoodBasedTracks, getSpotifyAccessToken } from "@/utils/spotify";

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
    const mood: unknown = body.mood;

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const accessToken = await getSpotifyAccessToken();

    let tracks = await getEnhancedMoodTracks(mood, accessToken, 25);

    if (tracks.length < 15) {
      // biome-ignore lint/suspicious/noConsole: server-side diagnostic logging
      console.error("Using basic mood search fallback");
      const basicTracks = await getMoodBasedTracks(mood, accessToken, 25);
      // Deduplicate before slicing (bug fix)
      const seen = new Set(tracks.map((t) => t.id));
      const newTracks = basicTracks.filter((t) => !seen.has(t.id));
      tracks = [...tracks, ...newTracks].slice(0, 25);
    }

    if (tracks.length === 0) {
      return NextResponse.json(
        { error: `No tracks found for mood: ${mood}. Please try a different mood.` },
        { status: 404 },
      );
    }

    const formattedTracks: SpotifyTrack[] = tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists?.map((artist) => artist.name).join(", ") ?? "Unknown Artist",
      album: track.album?.name ?? "Unknown Album",
      image: track.album?.images?.[0]?.url ?? null,
      preview_url: track.preview_url ?? null,
      external_url: track.external_urls?.spotify ?? null,
      duration_ms: track.duration_ms ?? 0,
      popularity: track.popularity ?? 0,
    }));

    return NextResponse.json({
      success: true,
      playlist: {
        mood,
        tracks: formattedTracks,
        method: "search-only-recommendations",
        note: "Generated using only Spotify Search API with intelligent mood matching",
      },
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server-side error logging
    console.error("Playlist generation error:", error);
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
