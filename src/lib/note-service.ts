import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createGeminiClient, getSafetySettings, isSafetyBlock } from "@/lib/gemini";
import { normalizeSlug } from "@/lib/slug";
import { NoteContent, NoteData } from "@/types/note";
import { parseJsonFromLLMText } from "@/lib/llm-response";

export class ExpansionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpansionError";
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export class SafetyBlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafetyBlockError";
  }
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
  "summary": "2-3 sentence wrap-up",
  "relatedTopics": ["topic 1", "topic 2", "topic 3", "topic 4"]
}

Tone: Simple, clear, student-friendly.
Length: ~500-800 words total across all sections.
relatedTopics: 3-5 topics for further learning (e.g., prerequisites, advanced topics, related fields).
Return ONLY the JSON object, no markdown fences or extra text.`;

const DIAGRAM_PROMPT = `Generate a clean, educational concept diagram for this topic.
Style: Simple flowchart or process diagram with clear labels.
Colors: Use a light background with contrasting colors for readability.
Layout: Horizontal or vertical flow, well-spaced elements.
Text: Include brief labels on each step or concept.
No decorative elements - focus on educational clarity.`;

interface NoteServiceDependencies {
  genAI: ReturnType<typeof createGeminiClient>;
  prisma: { note: typeof prisma.note };
}

export function createNoteService(deps: NoteServiceDependencies) {
  const { genAI, prisma: db } = deps;

  async function expandQuery(rawQuery: string): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: getSafetySettings(),
    });
    const result = await model.generateContent(`${EXPANSION_PROMPT}${rawQuery}`);
    const response = result.response;

    if (isSafetyBlock(response)) {
      throw new ExpansionError("Content blocked by safety filter");
    }

    const text = response.text().trim();
    if (!text) {
      throw new ExpansionError("Empty expansion response");
    }
    return text;
  }

  async function generateDiagram(topic: string): Promise<string | null> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-preview-image-generation",
        safetySettings: getSafetySettings(),
      });
      const result = await model.generateContent(
        `${DIAGRAM_PROMPT}\n\nTopic: ${topic}`
      );
      const response = result.response;

      if (isSafetyBlock(response)) {
        console.error("Diagram generation blocked by safety filter");
        return null;
      }

      const images = (response as unknown as { images?: Array<{ data: string; mimeType: string }> }).images;
      if (images && images.length > 0) {
        const image = images[0];
        return `data:${image.mimeType};base64,${image.data}`;
      }

      return null;
    } catch (error) {
      console.error("Diagram generation failed:", error);
      return null;
    }
  }

  async function generate(rawTopic: string): Promise<NoteData> {
    let expandedTopic: string;
    try {
      expandedTopic = await expandQuery(rawTopic.trim());
    } catch (error) {
      if (error instanceof ExpansionError) throw error;
      throw new ExpansionError("Failed to expand query");
    }

    const slug = normalizeSlug(expandedTopic);

    const existing = await db.note.findFirst({
      where: { topic: slug },
    });

    if (existing) {
      return {
        id: existing.id,
        topic: existing.topic,
        rawQuery: existing.rawQuery,
        title: existing.title,
        content: existing.content as unknown as NoteContent,
        diagramUrl: existing.diagramUrl,
        createdAt: existing.createdAt.toISOString(),
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: getSafetySettings(),
    });
    const result = await model.generateContent(`${NOTE_PROMPT}\n\nTopic: ${expandedTopic}`);
    const response = result.response;

    if (isSafetyBlock(response)) {
      throw new SafetyBlockError("Content blocked by safety filter");
    }

    const text = response.text();
    const parsed = parseJsonFromLLMText(text) as Record<string, unknown> | null;

    if (!parsed || typeof parsed !== "object") {
      throw new ParseError("Failed to parse AI response");
    }

    const content: NoteContent = {
      intro: (parsed.intro as string) ?? "",
      keyConcepts: (parsed.keyConcepts as string[]) ?? [],
      howItWorks: (parsed.howItWorks as string) ?? "",
      example: (parsed.example as string) ?? "",
      summary: (parsed.summary as string) ?? "",
      relatedTopics: (parsed.relatedTopics as string[]) ?? [],
    };

    const note = await db.note.create({
      data: {
        topic: slug,
        rawQuery: rawTopic.trim(),
        title: (parsed.title as string) ?? expandedTopic,
        content: content as unknown as Prisma.InputJsonValue,
      },
    });

    const diagramUrl = await generateDiagram(expandedTopic);

    if (diagramUrl) {
      await db.note.update({
        where: { id: note.id },
        data: { diagramUrl },
      });
    }

    return {
      id: note.id,
      topic: note.topic,
      rawQuery: note.rawQuery,
      title: note.title,
      content: note.content as unknown as NoteContent,
      diagramUrl: diagramUrl ?? note.diagramUrl,
      createdAt: note.createdAt.toISOString(),
    };
  }

  return { generate };
}
