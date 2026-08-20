import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    note: {
      groupBy: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("GET /api/trending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns trending topics from database", async () => {
    const mockTopics = [
      { topic: "photosynthesis", _count: { id: 5 } },
      { topic: "machine-learning", _count: { id: 3 } },
      { topic: "solar-system", _count: { id: 2 } },
    ];

    vi.mocked(prisma.note.groupBy).mockResolvedValue(mockTopics as never);

    const request = new Request("http://localhost:3000/api/trending");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topics).toHaveLength(3);
    expect(data.topics[0]).toBe("photosynthesis");
  });

  it("returns at most 5 topics", async () => {
    const mockTopics = [
      { topic: "topic-0", _count: { id: 10 } },
      { topic: "topic-1", _count: { id: 9 } },
      { topic: "topic-2", _count: { id: 8 } },
      { topic: "topic-3", _count: { id: 7 } },
      { topic: "topic-4", _count: { id: 6 } },
    ];

    vi.mocked(prisma.note.groupBy).mockResolvedValue(mockTopics as never);

    const request = new Request("http://localhost:3000/api/trending");
    const response = await GET(request);
    const data = await response.json();

    expect(data.topics).toHaveLength(5);
  });

  it("returns default topics when database is empty", async () => {
    vi.mocked(prisma.note.groupBy).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/trending");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topics).toHaveLength(5);
    expect(data.topics).toContain("photosynthesis");
  });

  it("handles database errors gracefully", async () => {
    vi.mocked(prisma.note.groupBy).mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost:3000/api/trending");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.topics).toHaveLength(5);
  });
});
