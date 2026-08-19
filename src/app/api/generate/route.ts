import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

interface NoteContent {
  intro: string;
  keyConcepts: string[];
  howItWorks: string;
  example: string;
  summary: string;
}

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

    const slug = normalizeTopic(topic);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`${NOTE_PROMPT}\n\nTopic: ${topic}`);
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
        title: parsed.title ?? topic,
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
    return NextResponse.json(
      { error: "Failed to generate note" },
      { status: 500 }
    );
  }
}
