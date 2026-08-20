import { describe, it, expect } from "vitest";
import { isTopicAllowed, BLOCKED_KEYWORDS } from "../content-safety";

describe("content-safety", () => {
  describe("isTopicAllowed", () => {
    it("allows normal educational topics", () => {
      expect(isTopicAllowed("photosynthesis").blocked).toBe(false);
      expect(isTopicAllowed("machine learning").blocked).toBe(false);
      expect(isTopicAllowed("world war 2").blocked).toBe(false);
      expect(isTopicAllowed("javascript closures").blocked).toBe(false);
    });

    it("blocks topics with explicit content keywords", () => {
      expect(isTopicAllowed("how to make drugs").blocked).toBe(true);
      expect(isTopicAllowed("drug manufacturing").blocked).toBe(true);
      expect(isTopicAllowed("make meth").blocked).toBe(true);
    });

    it("blocks topics with violent content keywords", () => {
      expect(isTopicAllowed("how to kill someone").blocked).toBe(true);
      expect(isTopicAllowed("bomb making").blocked).toBe(true);
      expect(isTopicAllowed("weapon construction").blocked).toBe(true);
    });

    it("blocks topics with harmful content keywords", () => {
      expect(isTopicAllowed("suicide methods").blocked).toBe(true);
      expect(isTopicAllowed("self harm techniques").blocked).toBe(true);
      expect(isTopicAllowed("hacking credit cards").blocked).toBe(true);
    });

    it("is case insensitive", () => {
      expect(isTopicAllowed("DRUG manufacturing").blocked).toBe(true);
      expect(isTopicAllowed("Bomb Making").blocked).toBe(true);
    });

    it("returns blocked keyword for blocked topics", () => {
      const result = isTopicAllowed("drug manufacturing");
      expect(result.blocked).toBe(true);
      expect(result.keyword).toBeDefined();
    });

    it("returns null keyword for allowed topics", () => {
      const result = isTopicAllowed("photosynthesis");
      expect(result.blocked).toBe(false);
      expect(result.keyword).toBeNull();
    });
  });

  describe("BLOCKED_KEYWORDS", () => {
    it("contains essential blocked terms", () => {
      expect(BLOCKED_KEYWORDS).toContain("drug");
      expect(BLOCKED_KEYWORDS).toContain("kill");
      expect(BLOCKED_KEYWORDS).toContain("bomb");
      expect(BLOCKED_KEYWORDS).toContain("weapon");
      expect(BLOCKED_KEYWORDS).toContain("suicide");
      expect(BLOCKED_KEYWORDS).toContain("hack");
    });
  });
});
