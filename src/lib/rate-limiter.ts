import { prisma } from "./prisma";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(ip: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.requests.get(ip) ?? [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);
    this.requests.set(ip, validTimestamps);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      retryAfter: 0,
    };
  }
}

export class DatabaseRateLimiter {
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async check(ip: string): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.windowMs);

    const count = await prisma.rateLimit.count({
      where: {
        ip,
        timestamp: {
          gt: windowStart,
        },
      },
    });

    if (count >= this.maxRequests) {
      const oldestEntry = await prisma.rateLimit.findFirst({
        where: { ip },
        orderBy: { timestamp: "asc" },
      });

      const retryAfter = oldestEntry
        ? Math.ceil((oldestEntry.timestamp.getTime() + this.windowMs - now.getTime()) / 1000)
        : 60;

      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    await prisma.rateLimit.create({
      data: { ip },
    });

    await this.cleanupOldEntries();

    return {
      allowed: true,
      remaining: this.maxRequests - count - 1,
      retryAfter: 0,
    };
  }

  async cleanupOldEntries(): Promise<void> {
    const cutoff = new Date(Date.now() - this.windowMs);
    await prisma.rateLimit.deleteMany({
      where: {
        timestamp: {
          lt: cutoff,
        },
      },
    });
  }
}

export const rateLimiter = new RateLimiter(20, 60 * 60 * 1000);
export const dbRateLimiter = new DatabaseRateLimiter(20, 60 * 60 * 1000);
