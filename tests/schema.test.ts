import { describe, expect, it } from "vitest";
import { PlankSchema } from "@/content/schema";
import { TOPICS } from "@/content/topics";

const validPlank = {
  id: "rnc-2024-1",
  party: "R",
  topic: "Retirement",
  statement: "Keep Social Security and Medicare benefits with no cuts and no change to the retirement age.",
  quote: "FIGHT FOR AND PROTECT SOCIAL SECURITY AND MEDICARE WITH NO CUTS",
  source: {
    doc: "rnc-2024",
    section: "Promise 14",
    url: "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform",
  },
  counterType: true,
};

describe("topics", () => {
  it("lists the 12 topics once each", () => {
    expect(TOPICS).toHaveLength(12);
    expect(new Set(TOPICS).size).toBe(12);
  });
});

describe("PlankSchema", () => {
  it("accepts a valid plank", () => {
    expect(PlankSchema.parse(validPlank)).toEqual(validPlank);
  });

  it("rejects an unknown party", () => {
    expect(PlankSchema.safeParse({ ...validPlank, party: "G" }).success).toBe(false);
  });

  it("rejects an unknown topic", () => {
    expect(PlankSchema.safeParse({ ...validPlank, topic: "Sports" }).success).toBe(false);
  });

  it("rejects a source without a section", () => {
    const blank = { ...validPlank, source: { ...validPlank.source, section: "" } };
    const { doc, url } = validPlank.source;
    const missing = { ...validPlank, source: { doc, url } };

    expect(PlankSchema.safeParse(blank).success).toBe(false);
    expect(PlankSchema.safeParse(missing).success).toBe(false);
  });

  it("rejects a source URL that isn't https", () => {
    const http = { ...validPlank, source: { ...validPlank.source, url: "http://example.com" } };
    expect(PlankSchema.safeParse(http).success).toBe(false);
  });
});
