import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerateContent, mockPrismaCreate, mockPrismaFindFirst } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockPrismaCreate: vi.fn(),
  mockPrismaFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    note: {
      create: mockPrismaCreate,
      findFirst: mockPrismaFindFirst,
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

import { POST } from "../route";

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when topic is missing", async () => {
    const request = createRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Topic is required");
  });

  it("returns 400 when topic is empty string", async () => {
    const request = createRequest({ topic: "   " });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Topic is required");
  });

  it("returns cached note when available", async () => {
    const cachedNote = {
      id: "cached-1",
      topic: "photosynthesis",
      rawQuery: "Photosynthesis",
      title: "Photosynthesis",
      content: {
        intro: "Cached intro.",
        keyConcepts: ["A"],
        howItWorks: "Cached how it works.",
        example: "Cached example.",
        summary: "Cached summary.",
      },
      diagramUrl: null,
      createdAt: new Date(),
    };

    mockPrismaFindFirst.mockResolvedValue(cachedNote);

    const request = createRequest({ topic: "Photosynthesis" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(data.content.intro).toBe("Cached intro.");
    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });

  it("generates a note and stores it in the database when not cached", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            title: "Photosynthesis",
            intro: "Photosynthesis is how plants make food.",
            keyConcepts: ["Chlorophyll", "Sunlight", "CO2"],
            howItWorks: "Plants use sunlight to convert CO2 into glucose.",
            example: "Like a solar panel converting light into energy.",
            summary: "Photosynthesis is essential for life on Earth.",
          }),
      },
    });

    const mockNote = {
      id: "test-id",
      topic: "photosynthesis",
      rawQuery: "Photosynthesis",
      title: "Photosynthesis",
      content: {
        intro: "Photosynthesis is how plants make food.",
        keyConcepts: ["Chlorophyll", "Sunlight", "CO2"],
        howItWorks: "Plants use sunlight to convert CO2 into glucose.",
        example: "Like a solar panel converting light into energy.",
        summary: "Photosynthesis is essential for life on Earth.",
      },
      diagramUrl: null,
      createdAt: new Date(),
    };

    mockPrismaCreate.mockResolvedValue(mockNote);

    const request = createRequest({ topic: "Photosynthesis" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(data.title).toBe("Photosynthesis");
    expect(data.content.intro).toBe("Photosynthesis is how plants make food.");
    expect(mockGenerateContent).toHaveBeenCalledOnce();
    expect(mockPrismaCreate).toHaveBeenCalledOnce();
  });

  it("normalizes topic to slug format", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            title: "Machine Learning",
            intro: "ML is a subset of AI.",
            keyConcepts: ["Neural Networks"],
            howItWorks: "Models learn from data.",
            example: "Like a child learning from examples.",
            summary: "ML powers many modern applications.",
          }),
      },
    });

    const mockNote = {
      id: "test-id-2",
      topic: "what-is-machine-learning",
      rawQuery: "What is Machine Learning?",
      title: "Machine Learning",
      content: {},
      diagramUrl: null,
      createdAt: new Date(),
    };

    mockPrismaCreate.mockResolvedValue(mockNote);

    const request = createRequest({ topic: "What is Machine Learning?" });
    const response = await POST(request);
    const data = await response.json();

    expect(data.topic).toBe("what-is-machine-learning");
    expect(mockPrismaCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          topic: "what-is-machine-learning",
          rawQuery: "What is Machine Learning?",
        }),
      })
    );
  });

  it("returns 500 when AI response cannot be parsed", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "This is not valid JSON",
      },
    });

    const request = createRequest({ topic: "Test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to parse AI response");
  });

  it("returns 500 when database write fails", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            title: "Test",
            intro: "Test intro",
            keyConcepts: ["A"],
            howItWorks: "Test how it works",
            example: "Test example",
            summary: "Test summary",
          }),
      },
    });

    mockPrismaCreate.mockRejectedValue(new Error("DB connection failed"));

    const request = createRequest({ topic: "Test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to generate note");
  });
});
