import { describe, expect, it } from "vitest";
import type { Candidate } from "@/content/schema";
import { checkCandidates, toDraftPlanks } from "@/scripts/lib/candidates";

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i + 1}`).join(" ");

const SOURCE = `Raise the minimum wage. Cut the corporate tax rate. ${words(41)}`;

const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  statement: "Raise the federal minimum wage for all workers in every state.",
  quote: "Raise the minimum wage.",
  section: "Jobs",
  topic: "Jobs and trade",
  counterType: false,
  counterReason: "",
  ...overrides,
});

describe("checkCandidates", () => {
  it("passes a quote found in the source, and flags one that isn't", () => {
    const { cards } = checkCandidates("R", [
      candidate(),
      candidate({ quote: "Abolish the minimum wage." }),
    ], SOURCE);

    expect(cards.map((c) => c.quoteFound)).toEqual([true, false]);
    expect(cards.map((c) => c.passed)).toEqual([true, false]);
  });

  it("passes a 40-word quote and flags a 41-word one", () => {
    const { cards } = checkCandidates("R", [
      candidate({ quote: words(40) }),
      candidate({ quote: words(41) }),
    ], SOURCE);

    expect(cards.map((c) => c.quoteWords)).toEqual([40, 41]);
    expect(cards.map((c) => c.passed)).toEqual([true, false]);
  });

  it("takes the party from the platform, never from the candidate", () => {
    const sneaky = { ...candidate(), party: "D" } as Candidate;

    const { cards } = checkCandidates("L", [sneaky], SOURCE);

    expect(cards[0].party).toBe("L");
  });

  it("numbers the IDs in the order proposed", () => {
    const { cards } = checkCandidates("R", [candidate(), candidate(), candidate()], SOURCE);

    expect(cards.map((c) => c.id)).toEqual(["rnc-2024-1", "rnc-2024-2", "rnc-2024-3"]);
  });

  it("counts proposed, passed and flagged cards", () => {
    const { counts } = checkCandidates("D", [
      candidate(),
      candidate({ quote: "Not in the source." }),
      candidate({ quote: "Cut the corporate tax rate." }),
    ], SOURCE);

    expect(counts).toEqual({ proposed: 3, passed: 2, flagged: 1 });
  });
});

describe("toDraftPlanks", () => {
  const checked = [
    ...checkCandidates("L", [
      candidate({ quote: "Cut the corporate tax rate.", topic: "Taxes and spending" }),
      candidate({ counterType: true, counterReason: "against type" }),
    ], SOURCE).cards,
    ...checkCandidates("D", [
      candidate({ quote: "Not in the source." }),
      candidate(),
    ], SOURCE).cards,
  ];

  it("keeps only passing cards, grouped D, R, L, counter-type first", () => {
    expect(toDraftPlanks(checked).map((p) => p.id)).toEqual(["dnc-2024-2", "lp-2024-2", "lp-2024-1"]);
  });

  it("gives each card the Plank shape, citing the platform", () => {
    expect(toDraftPlanks(checked)[0]).toEqual({
      id: "dnc-2024-2",
      party: "D",
      topic: "Jobs and trade",
      statement: "Raise the federal minimum wage for all workers in every state.",
      quote: "Raise the minimum wage.",
      source: {
        doc: "dnc-2024",
        section: "Jobs",
        url: "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform",
      },
      counterType: false,
    });
  });
});
