import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSafetySettings, isSafetyBlock } from "../gemini";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({})),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: "HARM_CATEGORY_HARASSMENT",
    HARM_CATEGORY_HATE_SPEECH: "HARM_CATEGORY_HATE_SPEECH",
    HARM_CATEGORY_SEXUALLY_EXPLICIT: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    HARM_CATEGORY_DANGEROUS_CONTENT: "HARM_CATEGORY_DANGEROUS_CONTENT",
  },
  HarmBlockThreshold: {
    BLOCK_NONE: "BLOCK_NONE",
    BLOCK_MEDIUM_AND_ABOVE: "BLOCK_MEDIUM_AND_ABOVE",
  },
}));

describe("gemini safety settings", () => {
  describe("getSafetySettings", () => {
    it("returns safety settings array", () => {
      const settings = getSafetySettings();
      expect(Array.isArray(settings)).toBe(true);
      expect(settings.length).toBe(4);
    });

    it("includes all four harm categories", () => {
      const settings = getSafetySettings();
      const categories = settings.map((s) => s.category);
      expect(categories).toContain(HarmCategory.HARM_CATEGORY_HARASSMENT);
      expect(categories).toContain(HarmCategory.HARM_CATEGORY_HATE_SPEECH);
      expect(categories).toContain(HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT);
      expect(categories).toContain(HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT);
    });

    it("sets all thresholds to BLOCK_MEDIUM_AND_ABOVE for content safety", () => {
      const settings = getSafetySettings();
      settings.forEach((s) => {
        expect(s.threshold).toBe(HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE);
      });
    });
  });

  describe("isSafetyBlock", () => {
    it("returns true when response has safety block reason", () => {
      const response = {
        promptFeedback: {
          blockReason: "SAFETY",
        },
      };
      expect(isSafetyBlock(response)).toBe(true);
    });

    it("returns true when candidates have safety block", () => {
      const response = {
        candidates: [
          {
            finishReason: "SAFETY",
            safetyRatings: [{ category: "HARM_CATEGORY_HARASSMENT", probability: "HIGH" }],
          },
        ],
      };
      expect(isSafetyBlock(response)).toBe(true);
    });

    it("returns false for normal response", () => {
      const response = {
        candidates: [
          {
            finishReason: "STOP",
            content: { parts: [{ text: "Hello" }] },
          },
        ],
      };
      expect(isSafetyBlock(response)).toBe(false);
    });

    it("returns false for empty response", () => {
      expect(isSafetyBlock({})).toBe(false);
    });
  });
});
