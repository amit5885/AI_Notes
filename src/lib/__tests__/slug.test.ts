import { describe, it, expect } from "vitest";
import { normalizeSlug } from "../slug";

describe("normalizeSlug", () => {
  it("converts to lowercase", () => {
    expect(normalizeSlug("Photosynthesis")).toBe("photosynthesis");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeSlug("Machine Learning")).toBe("machine-learning");
  });

  it("removes special characters", () => {
    expect(normalizeSlug("What is DNA?")).toBe("what-is-dna");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeSlug("a---b")).toBe("a-b");
  });

  it("removes leading and trailing hyphens", () => {
    expect(normalizeSlug("-hello-")).toBe("hello");
  });

  it("handles multiple spaces", () => {
    expect(normalizeSlug("  too   many   spaces  ")).toBe("too-many-spaces");
  });

  it("handles empty string", () => {
    expect(normalizeSlug("")).toBe("");
  });

  it("handles numbers", () => {
    expect(normalizeSlug("World War 2")).toBe("world-war-2");
  });

  it("preserves hyphens in input", () => {
    expect(normalizeSlug("e-commerce")).toBe("e-commerce");
  });
});
