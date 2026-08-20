import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNoteService, ExpansionError, ParseError } from "../note-service";

const {
  mockPrismaFindFirst,
  mockPrismaCreate,
  mockPrismaUpdate,
  mockGenerateContent,
  mockGetGenerativeModel,
} = vi.hoisted(() => ({
  mockPrismaFindFirst: vi.fn(),
  mockPrismaCreate: vi.fn(),
  mockPrismaUpdate: vi.fn(),
  mockGenerateContent: vi.fn(),
  mockGetGenerativeModel: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    note: {
      findFirst: mockPrismaFindFirst,
      create: mockPrismaCreate,
      update: mockPrismaUpdate,
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  createGeminiClient: vi.fn(),
  getSafetySettings: vi.fn().mockReturnValue([]),
  isSafetyBlock: vi.fn().mockReturnValue(false),
}));

describe("NoteService", () => {
  let service: ReturnType<typeof createNoteService>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetGenerativeModel.mockReturnValue({
      generateContent: mockGenerateContent,
    });
    service = createNoteService({
      genAI: { getGenerativeModel: mockGetGenerativeModel } as never,
      prisma: {
        note: {
          findFirst: mockPrismaFindFirst,
          create: mockPrismaCreate,
          update: mockPrismaUpdate,
        },
      } as never,
    });
  });

  it("returns cached note when it exists", async () => {
    const cached = {
      id: "1",
      topic: "photosynthesis",
      rawQuery: "how plants make food",
      title: "Photosynthesis",
      content: { intro: "Cached.", keyConcepts: [], howItWorks: "", example: "", summary: "", relatedTopics: [] },
      diagramUrl: null,
      createdAt: new Date(),
    };
    mockPrismaFindFirst.mockResolvedValue(cached);
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "Photosynthesis" },
    });

    const result = await service.generate("how plants make food");

    expect(result.id).toBe("1");
    expect(result.title).toBe("Photosynthesis");
    expect(mockPrismaCreate).not.toHaveBeenCalled();
  });

  it("generates new note on cache miss", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    mockGenerateContent
      .mockResolvedValueOnce({ response: { text: () => "Photosynthesis" } })
      .mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              title: "Test Note",
              intro: "An intro.",
              keyConcepts: ["A", "B"],
              howItWorks: "Works.",
              example: "Ex.",
              summary: "Sum.",
              relatedTopics: ["X", "Y"],
            }),
        },
      })
      .mockResolvedValueOnce({
        response: {
          text: () => "",
          images: [{ data: "b64", mimeType: "image/png" }],
        },
      });
    mockPrismaCreate.mockResolvedValue({
      id: "2",
      topic: "photosynthesis",
      rawQuery: "how plants make food",
      title: "Test Note",
      content: {},
      diagramUrl: null,
      createdAt: new Date(),
    });
    mockPrismaUpdate.mockResolvedValue({});

    const result = await service.generate("how plants make food");

    expect(result.id).toBe("2");
    expect(mockPrismaCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        topic: "photosynthesis",
        rawQuery: "how plants make food",
      }),
    });
  });

  it("throws ExpansionError when expansion fails", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    mockGenerateContent.mockRejectedValue(new Error("API error"));

    await expect(service.generate("test")).rejects.toThrow(ExpansionError);
  });

  it("throws ParseError when AI response has no JSON", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    mockGenerateContent
      .mockResolvedValueOnce({ response: { text: () => "expanded" } })
      .mockResolvedValueOnce({ response: { text: () => "no json here" } });

    await expect(service.generate("test")).rejects.toThrow(ParseError);
  });

  it("handles diagram generation failure gracefully", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    mockGenerateContent
      .mockResolvedValueOnce({ response: { text: () => "Topic" } })
      .mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              title: "T", intro: "I", keyConcepts: [],
              howItWorks: "W", example: "E", summary: "S", relatedTopics: [],
            }),
        },
      })
      .mockRejectedValue(new Error("Diagram failed"));
    mockPrismaCreate.mockResolvedValue({
      id: "3", topic: "topic", rawQuery: "t", title: "T",
      content: {}, diagramUrl: null, createdAt: new Date(),
    });

    const result = await service.generate("test");

    expect(result.diagramUrl).toBeNull();
    expect(mockPrismaUpdate).not.toHaveBeenCalled();
  });

  it("stores diagram URL after successful generation", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    mockGenerateContent
      .mockResolvedValueOnce({ response: { text: () => "Topic" } })
      .mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              title: "T", intro: "I", keyConcepts: [],
              howItWorks: "W", example: "E", summary: "S", relatedTopics: [],
            }),
        },
      })
      .mockResolvedValueOnce({
        response: {
          text: () => "",
          images: [{ data: "imgdata", mimeType: "image/png" }],
        },
      });
    mockPrismaCreate.mockResolvedValue({
      id: "4", topic: "topic", rawQuery: "t", title: "T",
      content: {}, diagramUrl: null, createdAt: new Date(),
    });
    mockPrismaUpdate.mockResolvedValue({});

    await service.generate("test");

    expect(mockPrismaUpdate).toHaveBeenCalledWith({
      where: { id: "4" },
      data: { diagramUrl: "data:image/png;base64,imgdata" },
    });
  });

  it("normalizes slug from expanded topic", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);
    mockGenerateContent
      .mockResolvedValueOnce({ response: { text: () => "Machine Learning" } })
      .mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              title: "ML", intro: "I", keyConcepts: [],
              howItWorks: "W", example: "E", summary: "S", relatedTopics: [],
            }),
        },
      })
      .mockResolvedValueOnce({
        response: { text: () => "", images: [{ data: "d", mimeType: "image/png" }] },
      });
    mockPrismaCreate.mockResolvedValue({
      id: "5", topic: "machine-learning", rawQuery: "teach computers",
      title: "ML", content: {}, diagramUrl: null, createdAt: new Date(),
    });
    mockPrismaUpdate.mockResolvedValue({});

    await service.generate("teach computers");

    expect(mockPrismaCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ topic: "machine-learning" }),
    });
  });
});
