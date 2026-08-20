import { NextResponse } from "next/server";
import { createGeminiClient } from "@/lib/gemini";
import { dbRateLimiter } from "@/lib/rate-limiter";
import { isTopicAllowed } from "@/lib/content-safety";
import { prisma } from "@/lib/prisma";
import { createNoteService, ExpansionError, ParseError } from "@/lib/note-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = body as { topic?: string };

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    const rateLimitResult = await dbRateLimiter.check(ip);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    const safetyCheck = isTopicAllowed(topic.trim());
    if (safetyCheck.blocked) {
      return NextResponse.json(
        { error: "This topic can't be generated. Try something else." },
        { status: 400 }
      );
    }

    const genAI = createGeminiClient();
    const service = createNoteService({ genAI, prisma });
    const note = await service.generate(topic.trim());

    return NextResponse.json(note);
  } catch (error) {
    console.error("Generation error:", error);

    if (error instanceof ExpansionError) {
      return NextResponse.json(
        { error: "Failed to expand query" },
        { status: 500 }
      );
    }

    if (error instanceof ParseError) {
      return NextResponse.json(
        { error: "Failed to generate note" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate note" },
      { status: 500 }
    );
  }
}
