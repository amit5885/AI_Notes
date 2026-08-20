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

    it("does not false positive on educational topics containing blocked substrings", () => {
      expect(isTopicAllowed("pharmacology").blocked).toBe(false);
      expect(isTopicAllowed("hackathon").blocked).toBe(false);
      expect(isTopicAllowed("hacker culture").blocked).toBe(false);
      expect(isTopicAllowed("nuclear weapons history").blocked).toBe(false);
    });

    it("still blocks exact word matches", () => {
      expect(isTopicAllowed("drug").blocked).toBe(true);
      expect(isTopicAllowed("hack").blocked).toBe(true);
      expect(isTopicAllowed("kill").blocked).toBe(true);
      expect(isTopicAllowed("bomb").blocked).toBe(true);
    });

    it("blocks compound phrases with blocked words", () => {
      expect(isTopicAllowed("how to hack a computer").blocked).toBe(true);
      expect(isTopicAllowed("making a bomb at home").blocked).toBe(true);
      expect(isTopicAllowed("gun safety training").blocked).toBe(true);
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
