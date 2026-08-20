import { describe, it, expect, beforeEach, vi } from "vitest";
import { DatabaseRateLimiter } from "../rate-limiter";

const { mockPrismaRateLimitCreate, mockPrismaRateLimitCount, mockPrismaRateLimitDeleteMany, mockPrismaRateLimitFindFirst } = vi.hoisted(() => ({
  mockPrismaRateLimitCreate: vi.fn(),
  mockPrismaRateLimitCount: vi.fn(),
  mockPrismaRateLimitDeleteMany: vi.fn(),
  mockPrismaRateLimitFindFirst: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimit: {
      create: mockPrismaRateLimitCreate,
      count: mockPrismaRateLimitCount,
      deleteMany: mockPrismaRateLimitDeleteMany,
      findFirst: mockPrismaRateLimitFindFirst,
    },
  },
}));

describe("DatabaseRateLimiter", () => {
  let limiter: DatabaseRateLimiter;

  beforeEach(() => {
    vi.clearAllMocks();
    limiter = new DatabaseRateLimiter(20, 60 * 60 * 1000);
  });

  it("allows requests under the limit", async () => {
    mockPrismaRateLimitCount.mockResolvedValue(0);
    mockPrismaRateLimitCreate.mockResolvedValue({});

    const result = await limiter.check("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("blocks after exceeding limit", async () => {
    mockPrismaRateLimitCount.mockResolvedValue(20);
    mockPrismaRateLimitFindFirst.mockResolvedValue({
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    });

    const result = await limiter.check("192.168.1.1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different IPs independently", async () => {
    mockPrismaRateLimitCount
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(0);
    mockPrismaRateLimitCreate.mockResolvedValue({});
    mockPrismaRateLimitFindFirst.mockResolvedValue({
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    });

    const ip1Result = await limiter.check("192.168.1.1");
    expect(ip1Result.allowed).toBe(false);

    const ip2Result = await limiter.check("192.168.1.2");
    expect(ip2Result.allowed).toBe(true);
  });

  it("cleans up old entries", async () => {
    mockPrismaRateLimitCount.mockResolvedValue(0);
    mockPrismaRateLimitCreate.mockResolvedValue({});
    mockPrismaRateLimitDeleteMany.mockResolvedValue({ count: 5 });

    await limiter.check("192.168.1.1");

    expect(mockPrismaRateLimitDeleteMany).toHaveBeenCalled();
  });

  it("cleanupOldEntries removes entries older than window", async () => {
    mockPrismaRateLimitDeleteMany.mockResolvedValue({ count: 10 });

    await limiter.cleanupOldEntries();

    expect(mockPrismaRateLimitDeleteMany).toHaveBeenCalledWith({
      where: {
        timestamp: {
          lt: expect.any(Date),
        },
      },
    });
  });
});
