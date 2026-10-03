import { describe, expect, it } from "vitest";
import { PLANKS } from "@/content/planks.fixture";
import { type Answer, resultsFor } from "@/lib/results";

// Hand-built rounds on the fixture deck, in deal order. In the fixture,
// card-01 to card-08 alternate D and R, card-09 to card-16 alternate D and L,
// and card-17 to card-24 alternate R and L.
const ROUND_1: Answer[] = [
  { plankId: "card-10", vote: "support", guess: "L" }, // L
  { plankId: "card-01", vote: "support", guess: "D" }, // D
  { plankId: "card-04", vote: "oppose", guess: "R" }, // R
  { plankId: "card-02", vote: "support", guess: "D" }, // R: backed, guessed D, wasn't
  { plankId: "card-07", vote: "unsure", guess: "D" }, // D
  { plankId: "card-14", vote: "oppose", guess: "L" }, // L
  { plankId: "card-03", vote: "support", guess: "R" }, // D
  { plankId: "card-08", vote: "unsure", guess: "R" }, // R
  { plankId: "card-12", vote: "support", guess: "D" }, // L: backed, guessed D, wasn't
  { plankId: "card-16", vote: "unsure", guess: "R" }, // L
  { plankId: "card-05", vote: "oppose", guess: "D" }, // D
  { plankId: "card-06", vote: "oppose", guess: "L" }, // R
];
const DEALT_1 = ROUND_1.map((a) => a.plankId);

// Round 2: the other half, every card opposed and guessed R.
const DEALT_2 = [
  "card-09",
  "card-11",
  "card-13",
  "card-15",
  "card-17",
  "card-18",
  "card-19",
  "card-20",
  "card-21",
  "card-22",
  "card-23",
  "card-24",
];
const ROUND_2: Answer[] = DEALT_2.map((plankId) => ({ plankId, vote: "oppose", guess: "R" }));

describe("resultsFor", () => {
  const results = resultsFor(ROUND_1, PLANKS, "D", DEALT_1);

  it("counts support per party, matching a hand count", () => {
    expect(results.support).toEqual({
      D: { supported: 2, counted: 3 },
      R: { supported: 1, counted: 3 },
      L: { supported: 2, counted: 3 },
    });
  });

  it("leaves Unsure answers out of the counts", () => {
    const unsure = ROUND_1.map((a) => ({ ...a, vote: "unsure" as const }));
    const { support, lean } = resultsFor(unsure, PLANKS, "D", DEALT_1);
    expect(support).toEqual({
      D: { supported: 0, counted: 0 },
      R: { supported: 0, counted: 0 },
      L: { supported: 0, counted: 0 },
    });
    expect(lean).toEqual({ verdict: "too_close", reason: "all_unsure" });
  });

  it("joins each answer to its plank's party for the verdict and the findings", () => {
    // D 2/3 and L 2/3 tie for the lead.
    expect(results.lean).toEqual({ verdict: "too_close", reason: "tie" });
    // Right: card-10, 01, 04, 07, 14, 08 and 05.
    expect(results.guesses).toEqual({
      right: 7,
      total: 12,
      p: expect.closeTo(0.0664, 3),
    });
    // Backed: card-10, 01, 02, 03 and 12. Guessed D: 01, 02, 12. Were D: 01, 03.
    expect(results.projection).toEqual({
      party: "D",
      assumed: 3,
      actual: 2,
      supported: 5,
    });
    expect(results.mostRevealing?.plank.id).toBe("card-02");
  });

  it("gives every card-by-card row the plank's party, quote and source, in deal order", () => {
    expect(results.rows.map((r) => r.plank.id)).toEqual(DEALT_1);
    results.rows.forEach((row, i) => {
      const plank = PLANKS.find((p) => p.id === DEALT_1[i]);
      expect(row.plank.party).toBe(plank?.party);
      expect(row.plank.quote).toBe(plank?.quote);
      expect(row.plank.source).toEqual(plank?.source);
      expect(row.vote).toBe(ROUND_1[i].vote);
      expect(row.guess).toBe(ROUND_1[i].guess);
    });
  });

  it("counts every revealed round, but the rows and the most revealing card cover this round", () => {
    const both = resultsFor([...ROUND_1, ...ROUND_2], PLANKS, "D", DEALT_2);
    expect(both.support).toEqual({
      D: { supported: 2, counted: 7 },
      R: { supported: 1, counted: 7 },
      L: { supported: 2, counted: 7 },
    });
    expect(both.guesses.total).toBe(24);
    expect(both.rows.map((r) => r.plank.id)).toEqual(DEALT_2);
    // Round 1's card-02 qualifies, but round 2 backed nothing.
    expect(both.mostRevealing).toBeNull();
  });

  it("throws on an answer whose plank isn't in the deck", () => {
    const stray: Answer = { plankId: "card-99", vote: "support", guess: "D" };
    expect(() => resultsFor([...ROUND_1, stray], PLANKS, "D", DEALT_1)).toThrow("card-99");
  });

  it("throws on a dealt card with no answer", () => {
    expect(() => resultsFor(ROUND_1.slice(1), PLANKS, "D", DEALT_1)).toThrow("card-10");
  });
});
