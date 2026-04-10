import type { MoodFilterKeywords, MoodSearchStrategy, SpotifyRawTrack, TokenCache } from "@/types";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// ── Token Caching ──

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

// ── Search Strategies ──

const MOOD_SEARCH_STRATEGIES: Record<string, MoodSearchStrategy> = {
  happy: {
    primaryQueries: [
      "happy songs 2024",
      "feel good music",
      "upbeat pop hits",
      "positive vibes playlist",
      "cheerful music",
    ],
    genreQueries: ["genre:pop happy", "genre:dance upbeat", "genre:funk feel good"],
    artistQueries: [
      'artist:"Pharrell Williams" Happy',
      'artist:"Bruno Mars" upbeat',
      'artist:"Dua Lipa" dance',
    ],
    playlistQueries: ['playlist:"Happy Hits"', 'playlist:"Good Vibes"', 'playlist:"Feel Good Pop"'],
  },
  sad: {
    primaryQueries: [
      "sad songs heartbreak",
      "emotional ballads",
      "melancholy music",
      "breakup songs",
      "crying songs",
    ],
    genreQueries: [
      "genre:indie sad",
      "genre:alternative emotional",
      "genre:singer-songwriter heartbreak",
    ],
    artistQueries: [
      'artist:"Billie Eilish" sad',
      'artist:"Adele" heartbreak',
      'artist:"Lewis Capaldi" emotional',
    ],
    playlistQueries: ['playlist:"Sad Songs"', 'playlist:"Heartbreak"', 'playlist:"Life Sucks"'],
  },
  energetic: {
    primaryQueries: [
      "workout music high energy",
      "pump up songs",
      "motivational music",
      "gym playlist",
      "power songs",
    ],
    genreQueries: ["genre:rock energetic", "genre:electronic high energy", "genre:hip-hop pump up"],
    artistQueries: [
      'artist:"Eminem" motivational',
      'artist:"Imagine Dragons" energetic',
      'artist:"The Weeknd" workout',
    ],
    playlistQueries: ['playlist:"Beast Mode"', 'playlist:"Workout"', 'playlist:"Power Hour"'],
  },
  calm: {
    primaryQueries: [
      "relaxing music peaceful",
      "chill songs ambient",
      "meditation music",
      "peaceful piano",
      "calming sounds",
    ],
    genreQueries: ["genre:ambient peaceful", "genre:acoustic calm", "genre:classical relaxing"],
    artistQueries: [
      'artist:"Ludovico Einaudi" peaceful',
      'artist:"Olafur Arnalds" calm',
      'artist:"Max Richter" ambient',
    ],
    playlistQueries: [
      'playlist:"Chill Hits"',
      'playlist:"Peaceful Piano"',
      'playlist:"Ambient Chill"',
    ],
  },
  romantic: {
    primaryQueries: [
      "love songs romantic",
      "slow dance music",
      "romantic ballads",
      "date night playlist",
      "valentine songs",
    ],
    genreQueries: ["genre:r-n-b romantic", "genre:soul love songs", "genre:pop romantic"],
    artistQueries: [
      'artist:"John Legend" love',
      'artist:"Ed Sheeran" romantic',
      'artist:"Alicia Keys" love songs',
    ],
    playlistQueries: [
      'playlist:"Love Pop"',
      'playlist:"Romantic Ballads"',
      'playlist:"Date Night"',
    ],
  },
  angry: {
    primaryQueries: [
      "angry music aggressive",
      "rage songs metal",
      "hardcore music",
      "aggressive rap",
      "metal hits",
    ],
    genreQueries: ["genre:metal aggressive", "genre:punk angry", "genre:hard-rock rage"],
    artistQueries: [
      'artist:"Metallica" aggressive',
      'artist:"Rage Against The Machine" angry',
      'artist:"Slipknot" metal',
    ],
    playlistQueries: [
      'playlist:"Metal Essentials"',
      'playlist:"Rage Beats"',
      'playlist:"Heavy Metal"',
    ],
  },
  nostalgic: {
    primaryQueries: [
      "classic hits throwback",
      "oldies music vintage",
      "retro songs 80s 90s",
      "nostalgic music",
      "throwback hits",
    ],
    genreQueries: ["genre:classic-rock throwback", "genre:oldies vintage", "genre:folk nostalgic"],
    artistQueries: [
      'artist:"Queen" classic',
      'artist:"The Beatles" oldies',
      'artist:"Fleetwood Mac" vintage',
    ],
    playlistQueries: ['playlist:"Throwback"', 'playlist:"Classic Rock"', 'playlist:"Oldies"'],
  },
  party: {
    primaryQueries: [
      "party music dance hits",
      "club bangers",
      "dance party playlist",
      "festival music",
      "celebration songs",
    ],
    genreQueries: ["genre:dance party", "genre:electronic club", "genre:pop party"],
    artistQueries: [
      'artist:"Calvin Harris" party',
      'artist:"David Guetta" dance',
      'artist:"Daft Punk" electronic',
    ],
    playlistQueries: ['playlist:"Party Hits"', 'playlist:"Dance Party"', 'playlist:"Club Bangers"'],
  },
};

// ── Mood Filtering (Deterministic) ──

const MOOD_FILTER_KEYWORDS: Record<string, MoodFilterKeywords> = {
  happy: {
    include: [
      "happy",
      "joy",
      "good",
      "love",
      "dance",
      "party",
      "fun",
      "smile",
      "sunshine",
      "bright",
    ],
    exclude: ["sad", "cry", "death", "dark", "lonely", "hurt", "pain", "break"],
  },
  sad: {
    include: ["sad", "cry", "hurt", "pain", "lonely", "miss", "gone", "lost", "break", "heart"],
    exclude: ["happy", "party", "dance", "celebration", "joy", "fun"],
  },
  energetic: {
    include: ["power", "strong", "energy", "pump", "beast", "fire", "rock", "metal", "hard"],
    exclude: ["slow", "calm", "peaceful", "quiet", "soft", "gentle"],
  },
  calm: {
    include: ["calm", "peace", "quiet", "soft", "gentle", "relax", "chill", "ambient", "piano"],
    exclude: ["loud", "aggressive", "hard", "metal", "rage", "angry"],
  },
  romantic: {
    include: ["love", "heart", "kiss", "romance", "beautiful", "forever", "together", "valentine"],
    exclude: ["angry", "hate", "rage", "aggressive", "metal", "hardcore"],
  },
  angry: {
    include: ["rage", "angry", "mad", "hate", "fight", "war", "aggressive", "metal", "hardcore"],
    exclude: ["love", "peace", "calm", "gentle", "soft", "romantic"],
  },
  nostalgic: {
    include: ["classic", "old", "vintage", "remember", "memory", "past", "throwback", "retro"],
    exclude: ["new", "modern", "future", "electronic", "digital"],
  },
  party: {
    include: ["party", "dance", "club", "celebration", "festival", "fun", "night", "weekend"],
    exclude: ["sad", "lonely", "quiet", "calm", "peaceful", "slow"],
  },
};

// ── Core Functions ──

export async function getMoodBasedTracks(
  mood: string,
  accessToken: string,
  limit = 25,
): Promise<SpotifyRawTrack[]> {
  const strategy = MOOD_SEARCH_STRATEGIES[mood] ?? MOOD_SEARCH_STRATEGIES.happy;

  const [primaryResults, genreResults, artistResults, playlistResults] = await Promise.all([
    Promise.all(
      strategy.primaryQueries.slice(0, 2).map((q) => searchSpotifyTracks(q, accessToken, 8)),
    ),
    Promise.all(
      strategy.genreQueries.slice(0, 2).map((q) => searchSpotifyTracks(q, accessToken, 6)),
    ),
    Promise.all(
      strategy.artistQueries.slice(0, 2).map((q) => searchSpotifyTracks(q, accessToken, 5)),
    ),
    Promise.all(
      strategy.playlistQueries.slice(0, 1).map((q) => searchSpotifyTracks(q, accessToken, 6)),
    ),
  ]);

  const allTracks = [
    ...primaryResults.flat(),
    ...genreResults.flat(),
    ...artistResults.flat(),
    ...playlistResults.flat(),
  ];

  const uniqueTracks = removeDuplicateTracks(allTracks);
  const filteredTracks = applyMoodFiltering(uniqueTracks, mood);

  return filteredTracks.slice(0, limit);
}

export async function getEnhancedMoodTracks(
  mood: string,
  accessToken: string,
  limit = 25,
): Promise<SpotifyRawTrack[]> {
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1];

  const [recentResults, classicTracks, regularTracks] = await Promise.all([
    Promise.all(
      recentYears.map((year) => searchSpotifyTracks(`${mood} year:${year}`, accessToken, 10)),
    ),
    searchSpotifyTracks(`${mood} year:2000-2020`, accessToken, 10),
    getMoodBasedTracks(mood, accessToken, 15),
  ]);

  const allTracks = [...recentResults.flat(), ...classicTracks, ...regularTracks];
  const uniqueTracks = removeDuplicateTracks(allTracks);
  const sortedTracks = uniqueTracks.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

  return sortedTracks.slice(0, limit);
}

async function searchSpotifyTracks(
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
      // biome-ignore lint/suspicious/noConsole: server-side error logging
      console.error(`Search failed for query "${query}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.tracks?.items ?? []) as SpotifyRawTrack[];
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server-side error logging
    console.error(`Search error for query "${query}":`, error);
    return [];
  }
}

function removeDuplicateTracks(tracks: SpotifyRawTrack[]): SpotifyRawTrack[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

function applyMoodFiltering(tracks: SpotifyRawTrack[], mood: string): SpotifyRawTrack[] {
  const keywords = MOOD_FILTER_KEYWORDS[mood] ?? MOOD_FILTER_KEYWORDS.happy;

  const scored = tracks.map((track) => {
    const searchText =
      `${track.name} ${track.artists.map((a) => a.name).join(" ")} ${track.album.name}`.toLowerCase();

    const hasExcluded = keywords.exclude.some((kw) => searchText.includes(kw));
    if (hasExcluded) return { track, score: -1 };

    const includeCount = keywords.include.filter((kw) => searchText.includes(kw)).length;
    return { track, score: includeCount };
  });

  return scored
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.track);
}
