import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RateLimiter } from "../rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(20, 60 * 60 * 1000);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const result = limiter.check("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it("tracks multiple requests from same IP", () => {
    for (let i = 0; i < 19; i++) {
      limiter.check("192.168.1.1");
    }

    const result = limiter.check("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks after exceeding limit", () => {
    for (let i = 0; i < 20; i++) {
      limiter.check("192.168.1.1");
    }

    const result = limiter.check("192.168.1.1");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("tracks different IPs independently", () => {
    for (let i = 0; i < 20; i++) {
      limiter.check("192.168.1.1");
    }

    const ip1Result = limiter.check("192.168.1.1");
    expect(ip1Result.allowed).toBe(false);

    const ip2Result = limiter.check("192.168.1.2");
    expect(ip2Result.allowed).toBe(true);
  });

  it("resets after window expires", () => {
    for (let i = 0; i < 20; i++) {
      limiter.check("192.168.1.1");
    }

    const blocked = limiter.check("192.168.1.1");
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(60 * 60 * 1000);

    const allowed = limiter.check("192.168.1.1");
    expect(allowed.allowed).toBe(true);
  });
});
