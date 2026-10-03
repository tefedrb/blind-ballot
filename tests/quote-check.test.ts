import { describe, expect, it } from "vitest";
import { quoteFound } from "@/scripts/lib/quote-check";

const NBSP = " ";

describe("quoteFound", () => {
  it.each([
    ["a curly apostrophe", "don't cut", "We won’t and don’t cut benefits."],
    ["a line break and extra spaces", "no cuts,  including", "with no cuts,\nincluding no changes"],
    ["different case", "NO CUTS", "with no cuts to benefits"],
    ["an en dash", "2024-2025", "for the 2024–2025 school year"],
    ["a non-breaking space", "no cuts", `with no${NBSP}cuts to benefits`],
  ])("finds a quote that differs only by %s", (_, quote, source) => {
    expect(quoteFound(quote, source)).toBe(true);
  });

  it("rejects a quote whose words aren't in the source", () => {
    expect(quoteFound("protect retirement", "We will protect Social Security.")).toBe(false);
  });

  it("rejects an empty or blank quote", () => {
    expect(quoteFound("", "Any source text.")).toBe(false);
    expect(quoteFound(" \n ", "Any source text.")).toBe(false);
  });

  it.each([
    ["a single ellipsis character", "border … judges"],
    ["three dots", "border ... judges"],
  ])("rejects a quote with %s, even when the source has it too", (_, quote) => {
    expect(quoteFound(quote, `Hire more ${quote} now.`)).toBe(false);
  });
});
