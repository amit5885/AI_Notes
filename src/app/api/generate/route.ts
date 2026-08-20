import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createGeminiClient } from "@/lib/gemini";

interface NoteContent {
  intro: string;
  keyConcepts: string[];
  howItWorks: string;
  example: string;
  summary: string;
}

const EXPANSION_PROMPT = `You are a topic normalizer. Rewrite the user's input into a single, clear academic topic.

Rules:
- Return ONLY the topic name, nothing else
- Use proper capitalization (e.g., "Photosynthesis", "Machine Learning")
- Be concise (1-5 words max)
- If the input is already a clear topic, return it as-is

Examples:
- "how plants make food" → "Photosynthesis"
- "teaching computers to learn" → "Machine Learning"
- "why is the sky blue" → "Rayleigh Scattering"
- "what is DNA" → "DNA"

Input: `;

const NOTE_PROMPT = `You are an educational assistant creating study notes.

Generate a note with these sections in valid JSON format:
{
  "title": "concise title",
  "intro": "1-2 sentence introduction",
  "keyConcepts": ["concept 1", "concept 2", "concept 3"],
  "howItWorks": "2-3 paragraphs explaining the process",
  "example": "real-world comparison or analogy",
  "summary": "2-3 sentence wrap-up"
}

Tone: Simple, clear, student-friendly.
Length: ~500-800 words total across all sections.
Return ONLY the JSON object, no markdown fences or extra text.`;

function normalizeTopic(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function expandQuery(genAI: ReturnType<typeof createGeminiClient>, rawQuery: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`${EXPANSION_PROMPT}${rawQuery}`);
  const response = result.response;
  const text = response.text().trim();

  if (!text) {
    throw new Error("Empty expansion response");
  }

  return text;
}

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

    const genAI = createGeminiClient();

    const expandedTopic = await expandQuery(genAI, topic.trim());
    const slug = normalizeTopic(expandedTopic);

    const existing = await prisma.note.findFirst({
      where: { topic: slug },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        topic: existing.topic,
        rawQuery: existing.rawQuery,
        title: existing.title,
        content: existing.content,
        diagramUrl: existing.diagramUrl,
        createdAt: existing.createdAt,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`${NOTE_PROMPT}\n\nTopic: ${expandedTopic}`);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string;
      intro?: string;
      keyConcepts?: string[];
      howItWorks?: string;
      example?: string;
      summary?: string;
    };

    const content: NoteContent = {
      intro: parsed.intro ?? "",
      keyConcepts: parsed.keyConcepts ?? [],
      howItWorks: parsed.howItWorks ?? "",
      example: parsed.example ?? "",
      summary: parsed.summary ?? "",
    };

    const note = await prisma.note.create({
      data: {
        topic: slug,
        rawQuery: topic.trim(),
        title: parsed.title ?? expandedTopic,
        content: content as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      id: note.id,
      topic: note.topic,
      rawQuery: note.rawQuery,
      title: note.title,
      content: note.content,
      diagramUrl: note.diagramUrl,
      createdAt: note.createdAt,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("expansion")) {
      return NextResponse.json(
        { error: "Failed to expand query" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate note" },
      { status: 500 }
    );
  }
}
