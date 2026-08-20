import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_TOPICS = [
  "photosynthesis",
  "machine-learning",
  "solar-system",
  "binary-search",
  "climate-change",
];

export async function GET(_request: Request) {
  try {
    const topics = await prisma.note.groupBy({
      by: ["topic"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    if (topics.length === 0) {
      return NextResponse.json({ topics: DEFAULT_TOPICS });
    }

    return NextResponse.json({ topics: topics.map((t) => t.topic) });
  } catch {
    return NextResponse.json({ topics: DEFAULT_TOPICS });
  }
}
