import type { SpotifyRawTrack, TokenCache } from "@/types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let tokenCache: TokenCache | null = null;

export async function getSpotifyAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 300_000) {
    return tokenCache.token;
  }

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.token;
}

export async function searchTracksFromQueries(
  queries: string[],
  accessToken: string,
  limit = 25,
): Promise<SpotifyRawTrack[]> {
  const results = await Promise.all(
    queries.map((q) => searchSpotifyTracks(q, accessToken, 8)),
  );

  const allTracks = results.flat();
  const uniqueTracks = removeDuplicateTracks(allTracks);
  const sorted = uniqueTracks.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

  return sorted.slice(0, limit);
}

export async function searchSpotifyTracks(
  query: string,
  accessToken: string,
  limit: number,
): Promise<SpotifyRawTrack[]> {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(`Search failed for query "${query}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.tracks?.items ?? []) as SpotifyRawTrack[];
  } catch (error) {
    console.error(`Search error for query "${query}":`, error);
    return [];
  }
}

export function removeDuplicateTracks(tracks: SpotifyRawTrack[]): SpotifyRawTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}
