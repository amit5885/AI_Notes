import { prisma } from "./prisma";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
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

export const dbRateLimiter = new DatabaseRateLimiter(20, 60 * 60 * 1000);
