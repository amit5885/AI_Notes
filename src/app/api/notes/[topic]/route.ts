import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topic: string }> }
) {
  try {
    const { topic } = await params;

    const note = await prisma.note.findFirst({
      where: { topic },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

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
    console.error("Fetch note error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}
