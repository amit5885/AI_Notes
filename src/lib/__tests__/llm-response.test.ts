import { describe, it, expect } from "vitest";
import { parseJsonFromLLMText } from "../llm-response";

describe("parseJsonFromLLMText", () => {
  it("extracts JSON from plain text", () => {
    const text = 'Here is the result: {"key": "value"} end.';
    expect(parseJsonFromLLMText(text)).toEqual({ key: "value" });
  });

  it("extracts JSON wrapped in markdown fences", () => {
    const text = '```json\n{"key": "value"}\n```';
    expect(parseJsonFromLLMText(text)).toEqual({ key: "value" });
  });

  it("extracts JSON with surrounding prose", () => {
    const text = `Sure! Here are the notes:
{
  "title": "Photosynthesis",
  "intro": "Plants make food.",
  "keyConcepts": ["Sunlight", "Chlorophyll"]
}
Let me know if you need more!`;
    expect(parseJsonFromLLMText(text)).toEqual({
      title: "Photosynthesis",
      intro: "Plants make food.",
      keyConcepts: ["Sunlight", "Chlorophyll"],
    });
  });

  it("returns null when no JSON found", () => {
    expect(parseJsonFromLLMText("No JSON here at all")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseJsonFromLLMText("{not valid json}")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseJsonFromLLMText("")).toBeNull();
  });

  it("handles nested objects", () => {
    const text = '{"a": {"b": {"c": 1}}}';
    expect(parseJsonFromLLMText(text)).toEqual({ a: { b: { c: 1 } } });
  });

  it("handles arrays at top level", () => {
    const text = '[1, 2, 3]';
    expect(parseJsonFromLLMText(text)).toEqual([1, 2, 3]);
  });

  it("picks the first JSON block when multiple exist", () => {
    const text = '{"first": 1} some text {"second": 2}';
    expect(parseJsonFromLLMText(text)).toEqual({ first: 1 });
  });
});
