import { describe, it, expect } from "vitest";
import { convertToMarkdown } from "../export-utils";

interface NoteContent {
  intro: string;
  keyConcepts: string[];
  howItWorks: string;
  example: string;
  summary: string;
}

describe("export-utils", () => {
  describe("convertToMarkdown", () => {
    it("converts note to markdown format", () => {
      const note = {
        title: "Photosynthesis",
        content: {
          intro: "Photosynthesis is the process by which plants make food.",
          keyConcepts: ["Chloroplasts", "Sunlight", "Carbon Dioxide"],
          howItWorks: "Plants use sunlight to convert CO2 into glucose.",
          example: "Think of it like a solar panel making energy.",
          summary: "Photosynthesis is essential for life on Earth.",
        } as NoteContent,
      };

      const markdown = convertToMarkdown(note);

      expect(markdown).toContain("# Photosynthesis");
      expect(markdown).toContain("## Introduction");
      expect(markdown).toContain("Photosynthesis is the process");
      expect(markdown).toContain("## Key Concepts");
      expect(markdown).toContain("- Chloroplasts");
      expect(markdown).toContain("- Sunlight");
      expect(markdown).toContain("- Carbon Dioxide");
      expect(markdown).toContain("## How It Works");
      expect(markdown).toContain("Plants use sunlight");
      expect(markdown).toContain("## Example / Analogy");
      expect(markdown).toContain("Think of it like");
      expect(markdown).toContain("## Summary");
      expect(markdown).toContain("Photosynthesis is essential");
    });

    it("handles empty key concepts", () => {
      const note = {
        title: "Test",
        content: {
          intro: "Intro",
          keyConcepts: [],
          howItWorks: "Works",
          example: "Example",
          summary: "Summary",
        } as NoteContent,
      };

      const markdown = convertToMarkdown(note);
      expect(markdown).toContain("# Test");
      expect(markdown).toContain("## Key Concepts");
    });
  });
});
