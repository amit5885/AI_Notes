import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrismaFindFirst } = vi.hoisted(() => ({
  mockPrismaFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    note: {
      findFirst: mockPrismaFindFirst,
    },
  },
}));

import { GET } from "../route";

function createRequest(url: string): Request {
  return new Request(url);
}

function createParams(topic: string) {
  return { params: Promise.resolve({ topic }) };
}

describe("GET /api/notes/[topic]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when note is not found", async () => {
    mockPrismaFindFirst.mockResolvedValue(null);

    const request = createRequest("http://localhost/api/notes/nonexistent");
    const response = await GET(request, createParams("nonexistent"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Note not found");
  });

  it("returns the note when found", async () => {
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
      createdAt: new Date("2024-01-15"),
    };

    mockPrismaFindFirst.mockResolvedValue(mockNote);

    const request = createRequest("http://localhost/api/notes/photosynthesis");
    const response = await GET(request, createParams("photosynthesis"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(data.title).toBe("Photosynthesis");
    expect(data.content.intro).toBe("Photosynthesis is how plants make food.");
    expect(mockPrismaFindFirst).toHaveBeenCalledWith({
      where: { topic: "photosynthesis" },
    });
  });

  it("returns 500 when database query fails", async () => {
    mockPrismaFindFirst.mockRejectedValue(new Error("DB connection failed"));

    const request = createRequest("http://localhost/api/notes/test");
    const response = await GET(request, createParams("test"));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to fetch note");
  });
});
