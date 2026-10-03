import { describe, expect, it } from "vitest";
import type { LeakAnswer, Party } from "@/content/schema";
import { guessSkill } from "@/lib/verdict";
import { summarize, type CardRuns } from "@/scripts/lib/leak-summary";
import { importsOf } from "./imports";

// The cases from the plan's Task 7, Step 1.

// One answer per run, each naming a party, with no cues.
const runs = (...parties: Party[]): LeakAnswer[] => parties.map((party) => ({ party, cues: [] }));

// One card's runs on each version. The original runs default to the neutral ones.
let ids = 0;
const card = (party: Party, neutral: LeakAnswer[], original = neutral): CardRuns => ({
  plankId: `card-${String(++ids).padStart(2, "0")}`,
  party,
  neutral,
  original,
});

describe("one card", () => {
  it("is correct and flagged when 4 of 5 runs name the right party", () => {
    const sure = card("R", runs("R", "R", "R", "R", "D"));

    const { cards, flagged } = summarize([sure]);

    expect(cards[0].neutral).toMatchObject({ majority: "R", sureness: 0.8, correct: true });
    expect(flagged).toEqual([sure.plankId]);
  });

  it("counts a 2–2–1 split as a miss", () => {
    const { cards, flagged } = summarize([card("R", runs("R", "R", "D", "D", "L"))]);

    expect(cards[0].neutral).toMatchObject({ majority: null, sureness: 0.4, correct: false });
    expect(flagged).toEqual([]);
  });

  it("is correct but not flagged when 3 of 5 runs name the right party", () => {
    const { cards, flagged } = summarize([card("L", runs("L", "L", "L", "D", "R"))]);

    expect(cards[0].neutral).toMatchObject({ majority: "L", sureness: 0.6, correct: true });
    expect(flagged).toEqual([]);
  });

  it("isn't flagged when 4 of 5 runs agree on the wrong party", () => {
    const { cards, flagged } = summarize([card("D", runs("R", "R", "R", "R", "D"))]);

    expect(cards[0].neutral).toMatchObject({ majority: "R", sureness: 0.8, correct: false });
    expect(flagged).toEqual([]);
  });

  it("is flagged on the neutral version only", () => {
    const spun = card("D", runs("D", "D", "D", "R", "L"), runs("D", "D", "D", "D", "D"));

    const { cards, flagged } = summarize([spun]);

    expect(cards[0].original).toMatchObject({ majority: "D", sureness: 1, correct: true });
    expect(flagged).toEqual([]);
  });

  it("keeps the cues from the runs that named the majority, once each", () => {
    const answers: LeakAnswer[] = [
      { party: "R", cues: ["illegal aliens"] },
      { party: "R", cues: ["illegal aliens", "border wall"] },
      { party: "R", cues: [] },
      { party: "D", cues: ["asylum officers"] },
      { party: "L", cues: ["open borders"] },
    ];

    const { cards } = summarize([card("R", answers)]);

    expect(cards[0].neutral.cues).toEqual(["illegal aliens", "border wall"]);
  });
});

describe("the whole deck", () => {
  it("takes accuracy's p-value from guessSkill: 13 of 24 right gives p ≈ 0.028", () => {
    const deck = [
      ...Array.from({ length: 13 }, () => card("D", runs("D", "D", "D", "R", "L"))),
      ...Array.from({ length: 11 }, () => card("D", runs("R", "R", "R", "D", "L"))),
    ];

    const { neutral } = summarize(deck);

    expect(neutral).toMatchObject({ right: 13, total: 24 });
    expect(neutral.accuracy).toBeCloseTo(13 / 24);
    expect(neutral.pValue).toBe(guessSkill(13, 24));
    expect(neutral.pValue).toBeCloseTo(0.028, 3);
  });

  it("imports guessSkill rather than rewriting it", () => {
    expect(importsOf("scripts/lib/leak-summary.ts")).toContain("lib/verdict");
  });

  it("reports the drop as original accuracy minus neutral accuracy", () => {
    const deck = [
      card("D", runs("D", "D", "D", "D", "D")),
      card("R", runs("D", "D", "D", "R", "R"), runs("R", "R", "R", "R", "R")),
      card("L", runs("R", "R", "L", "L", "D"), runs("L", "L", "L", "R", "D")),
      card("L", runs("D", "D", "D", "D", "L"), runs("L", "L", "L", "L", "L")),
    ];

    const { neutral, original, drop } = summarize(deck);

    expect(neutral.accuracy).toBe(0.25);
    expect(original.accuracy).toBe(1);
    expect(drop).toBe(0.75);
  });
});
