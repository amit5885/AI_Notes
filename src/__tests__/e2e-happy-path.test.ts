import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrismaFindFirst, mockPrismaCreate, mockGenerateContent } = vi.hoisted(() => ({
  mockPrismaFindFirst: vi.fn(),
  mockPrismaCreate: vi.fn(),
  mockGenerateContent: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    note: {
      findFirst: mockPrismaFindFirst,
      create: mockPrismaCreate,
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  createGeminiClient: vi.fn().mockReturnValue({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  }),
}));

import { GET } from "@/app/api/notes/[topic]/route";
import { POST } from "@/app/api/generate/route";

function createGetRequest(topic: string): Request {
  return new Request(`http://localhost/api/notes/${topic}`);
}

function createPostRequest(body: unknown): Request {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createParams(topic: string) {
  return { params: Promise.resolve({ topic }) };
}

describe("End-to-end happy path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serves cached note when available", async () => {
    const cachedNote = {
      id: "cached-1",
      topic: "photosynthesis",
      rawQuery: "Photosynthesis",
      title: "Photosynthesis",
      content: {
        intro: "Plants make food from sunlight.",
        keyConcepts: ["Chlorophyll", "Light", "CO2"],
        howItWorks: "Sunlight powers the reaction.",
        example: "Like a solar panel.",
        summary: "Essential for life.",
      },
      diagramUrl: null,
      createdAt: new Date(),
    };

    mockPrismaFindFirst.mockResolvedValue(cachedNote);

    const getRes = await GET(createGetRequest("photosynthesis"), createParams("photosynthesis"));
    const data = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("generates note when not cached", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    const getRes = await GET(createGetRequest("quantum-physics"), createParams("quantum-physics"));
    expect(getRes.status).toBe(404);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            title: "Quantum Physics",
            intro: "Quantum physics studies subatomic particles.",
            keyConcepts: ["Wave-particle duality", "Uncertainty principle"],
            howItWorks: "Particles exist in superposition until measured.",
            example: "Like Schrodinger's cat.",
            summary: "Fundamental to modern physics.",
          }),
      },
    });

    mockPrismaCreate.mockResolvedValue({
      id: "gen-1",
      topic: "quantum-physics",
      rawQuery: "Quantum Physics",
      title: "Quantum Physics",
      content: {},
      diagramUrl: null,
      createdAt: new Date(),
    });

    const postRes = await createPostRequest({ topic: "Quantum Physics" });
    const genRes = await POST(postRes);
    const genData = await genRes.json();

    expect(genRes.status).toBe(200);
    expect(genData.topic).toBe("quantum-physics");
    expect(mockPrismaCreate).toHaveBeenCalledOnce();
  });

  it("handles multiple topics in sequence", async () => {
    const topics = ["biology", "chemistry", "physics"];

    for (const topic of topics) {
      mockPrismaFindFirst.mockResolvedValue(null);
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              title: topic.charAt(0).toUpperCase() + topic.slice(1),
              intro: `Introduction to ${topic}.`,
              keyConcepts: [`${topic} concept 1`],
              howItWorks: `How ${topic} works.`,
              example: `Example of ${topic}.`,
              summary: `Summary of ${topic}.`,
            }),
        },
      });
      mockPrismaCreate.mockResolvedValue({
        id: `id-${topic}`,
        topic,
        rawQuery: topic,
        title: topic,
        content: {},
        diagramUrl: null,
        createdAt: new Date(),
      });

      const getRes = await GET(createGetRequest(topic), createParams(topic));
      expect(getRes.status).toBe(404);

      const postRes = await createPostRequest({ topic });
      const genRes = await POST(postRes);
      expect(genRes.status).toBe(200);
    }

    expect(mockPrismaCreate).toHaveBeenCalledTimes(3);
  });
});
