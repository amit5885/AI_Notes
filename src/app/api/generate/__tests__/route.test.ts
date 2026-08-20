import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerate, mockRateLimitCount, mockRateLimitCreate, mockRateLimitDeleteMany, mockRateLimitFindFirst } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
  mockRateLimitCount: vi.fn().mockResolvedValue(0),
  mockRateLimitCreate: vi.fn().mockResolvedValue({}),
  mockRateLimitDeleteMany: vi.fn().mockResolvedValue({}),
  mockRateLimitFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimit: {
      count: mockRateLimitCount,
      create: mockRateLimitCreate,
      deleteMany: mockRateLimitDeleteMany,
      findFirst: mockRateLimitFindFirst,
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  createGeminiClient: vi.fn().mockReturnValue({}),
  getSafetySettings: vi.fn().mockReturnValue([]),
  isSafetyBlock: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/note-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/note-service")>("@/lib/note-service");
  return {
    ...actual,
    createNoteService: vi.fn().mockReturnValue({
      generate: mockGenerate,
    }),
  };
});

import { POST } from "../route";
import { ExpansionError, ParseError } from "@/lib/note-service";

function createRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    mockRateLimitCount.mockResolvedValue(0);
    mockRateLimitCreate.mockResolvedValue({});
    mockRateLimitDeleteMany.mockResolvedValue({});
    mockRateLimitFindFirst.mockResolvedValue(undefined);
    mockGenerate.mockReset();
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

  it("returns 429 when rate limited", async () => {
    mockRateLimitCount.mockResolvedValue(20);
    mockRateLimitFindFirst.mockResolvedValue({
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    });

    const request = createRequest({ topic: "test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain("Rate limit");
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns 400 when topic is blocked", async () => {
    const request = createRequest({ topic: "drug manufacturing" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("can't be generated");
  });

  it("returns 200 with note on success", async () => {
    const note = {
      id: "1",
      topic: "photosynthesis",
      rawQuery: "how plants make food",
      title: "Photosynthesis",
      content: { intro: "Plants make food.", keyConcepts: [], howItWorks: "", example: "", summary: "", relatedTopics: [] },
      diagramUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    mockGenerate.mockResolvedValue(note);

    const request = createRequest({ topic: "how plants make food" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topic).toBe("photosynthesis");
    expect(mockGenerate).toHaveBeenCalledWith("how plants make food");
  });

  it("returns 500 when expansion fails", async () => {
    mockGenerate.mockRejectedValue(new ExpansionError("Failed to expand query"));

    const request = createRequest({ topic: "test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to expand query");
  });

  it("returns 500 when parse fails", async () => {
    mockGenerate.mockRejectedValue(new ParseError("Failed to parse AI response"));

    const request = createRequest({ topic: "test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to generate note");
  });

  it("returns 500 on unknown error", async () => {
    mockGenerate.mockRejectedValue(new Error("Something broke"));

    const request = createRequest({ topic: "test" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to generate note");
  });
});
