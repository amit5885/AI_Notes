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

  it("returns cached note when available after expansion", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => "Photosynthesis",
      },
    });

    const cachedNote = {
      id: "cached-1",
      topic: "photosynthesis",
      rawQuery: "how plants make food",
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

    const request = createRequest({ topic: "how plants make food" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(data.content.intro).toBe("Cached intro.");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });

  it("expands query and generates note when not cached", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => "Photosynthesis",
        },
      })
      .mockResolvedValueOnce({
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
      rawQuery: "how plants make food",
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

    const request = createRequest({ topic: "how plants make food" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(data.rawQuery).toBe("how plants make food");
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(mockPrismaCreate).toHaveBeenCalledOnce();
  });

  it("normalizes expanded topic to slug format", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => "Machine Learning",
        },
      })
      .mockResolvedValueOnce({
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
      topic: "machine-learning",
      rawQuery: "teaching computers to learn",
      title: "Machine Learning",
      content: {},
      diagramUrl: null,
      createdAt: new Date(),
    };

    mockPrismaCreate.mockResolvedValue(mockNote);

    const request = createRequest({ topic: "teaching computers to learn" });
    const response = await POST(request);
    const data = await response.json();

    expect(data.topic).toBe("machine-learning");
    expect(data.rawQuery).toBe("teaching computers to learn");
    expect(mockPrismaCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          topic: "machine-learning",
          rawQuery: "teaching computers to learn",
        }),
      })
    );
  });

  it("returns 500 when query expansion fails", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "",
      },
    });

    const request = createRequest({ topic: "test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to expand query");
  });

  it("returns 500 when note generation response cannot be parsed", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => "Test Topic",
        },
      })
      .mockResolvedValueOnce({
        response: {
          text: () => "This is not valid JSON",
        },
      });

    const request = createRequest({ topic: "test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to parse AI response");
  });

  it("returns 500 when database write fails", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    mockGenerateContent
      .mockResolvedValueOnce({
        response: {
          text: () => "Test Topic",
        },
      })
      .mockResolvedValueOnce({
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
