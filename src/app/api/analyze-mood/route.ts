import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { analyzeWithHuggingFace, sanitizeInput } from "@/utils/huggingFaceMoodAnalyzer";
import { isRateLimited } from "@/utils/rateLimit";

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
    const text: unknown = body.text;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const sanitized = sanitizeInput(text);

    if (sanitized.length > 1000) {
      return NextResponse.json(
        { error: "Text too long. Please limit to 1000 characters." },
        { status: 400 },
      );
    }

    const analysis = await analyzeWithHuggingFace(sanitized);

    return NextResponse.json({
      success: true,
      analysis: {
        mood: analysis.mood,
        secondaryMood: analysis.secondaryMood,
        confidence: analysis.confidence,
        intensity: analysis.intensity,
        context: analysis.context,
        musicStyles: analysis.musicStyles,
        method: analysis.method,
        debug: {
          rawEmotions: analysis.rawEmotions?.slice(0, 3) ?? [],
          rawSentiment: analysis.rawSentiment?.slice(0, 2) ?? [],
        },
      },
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server-side error logging
    console.error("Mood analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze mood",
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}
