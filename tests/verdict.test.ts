import { describe, expect, it } from "vitest";
import type { Party, Vote } from "@/content/schema";
import {
  guessSkill,
  lean,
  mostRevealing,
  projection,
  wilson,
  type Lean,
  type RevealedAnswer,
} from "@/lib/verdict";

// The hand-worked cases from the plan's Task 6 table, recomputed on 2026-10-02.

let ids = 0;
const answer = (party: Party, vote: Vote, guess: Party = party): RevealedAnswer => ({
  plankId: `card-${String(++ids).padStart(2, "0")}`,
  vote,
  guess,
  party,
});

// One party's cards: k supported of n counted, plus any Unsure answers.
const cards = (party: Party, k: number, n: number, unsure = 0): RevealedAnswer[] => [
  ...Array.from({ length: k }, () => answer(party, "support")),
  ...Array.from({ length: n - k }, () => answer(party, "oppose")),
  ...Array.from({ length: unsure }, () => answer(party, "unsure")),
];

// The cards a player supported, each with its guess and its actual party.
const backed = (guesses: Party[], parties: Party[]): RevealedAnswer[] =>
  guesses.map((guess, i) => answer(parties[i], "support", guess));

const near = (actual: number, expected: number, tolerance: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

describe("wilson, the 80% interval", () => {
  it.each([
    [4, 4, 0.709, 1],
    [0, 4, 0, 0.291],
    [3, 4, 0.433, 0.922],
    [1, 4, 0.078, 0.567],
    [0, 0, 0, 1],
  ])("gives %i of %i as [%f, %f]", (k, n, lo, hi) => {
    const interval = wilson(k, n);
    near(interval.lo, lo, 0.001);
    near(interval.hi, hi, 0.001);
  });
});

describe("lean", () => {
  it.each<[string, RevealedAnswer[], Lean]>([
    [
      "L 4/4, D 0/4, R 0/4 is clear",
      [...cards("L", 4, 4), ...cards("D", 0, 4), ...cards("R", 0, 4)],
      { verdict: "clear", leader: "L" },
    ],
    [
      "L 3/4, D 1/4, R 1/4 is leaning",
      [...cards("L", 3, 4), ...cards("D", 1, 4), ...cards("R", 1, 4)],
      { verdict: "leaning", leader: "L" },
    ],
    [
      "a tie for the lead is too close",
      [...cards("L", 2, 4), ...cards("D", 2, 4), ...cards("R", 1, 4)],
      { verdict: "too_close", reason: "tie" },
    ],
    [
      "every answer Unsure is too close",
      [...cards("L", 0, 0, 4), ...cards("D", 0, 0, 4), ...cards("R", 0, 0, 4)],
      { verdict: "too_close", reason: "all_unsure" },
    ],
    [
      "an Unsure answer isn't counted: L 3/3 is still clear",
      [...cards("L", 3, 3, 1), ...cards("D", 0, 4), ...cards("R", 0, 4)],
      { verdict: "clear", leader: "L" },
    ],
    [
      "a party with nothing counted has [0, 1], so the leader is only leaning",
      [...cards("L", 4, 4), ...cards("D", 0, 4), ...cards("R", 0, 0, 4)],
      { verdict: "leaning", leader: "L" },
    ],
  ])("%s", (_, answers, expected) => {
    expect(lean(answers)).toEqual(expected);
  });
});

describe("guessSkill, the binomial test against 1 in 3", () => {
  it.each([
    [8, 12, 0.0188],
    [4, 12, 0.607],
    // The leak check reuses this.
    [13, 24, 0.0284],
  ])("gives %i of %i right p ≈ %f", (right, total, p) => {
    near(guessSkill(right, total), p, 0.0005);
  });
});

describe("projection", () => {
  it("counts the backed cards guessed as the stated party against those that were", () => {
    const answers = [
      ...backed(["D", "D", "D", "D", "D", "R"], ["D", "D", "L", "L", "R", "R"]),
      // Not backed, so neither one counts.
      answer("D", "oppose", "D"),
      answer("D", "unsure", "D"),
    ];
    expect(projection(answers, "D")).toEqual({ party: "D", assumed: 5, actual: 2, supported: 6 });
  });

  it("measures an Independent against the party they guessed most", () => {
    const answers = backed(["L", "L", "D"], ["L", "R", "D"]);
    expect(projection(answers, "I")).toEqual({ party: "L", assumed: 2, actual: 1, supported: 3 });
  });

  it("is hidden when two parties tie for most guessed", () => {
    expect(projection(backed(["L", "D"], ["L", "D"]), "none")).toBeNull();
  });

  it("is hidden when nothing was backed", () => {
    const answers = [answer("D", "oppose"), answer("R", "unsure", "D")];
    expect(projection(answers, "D")).toBeNull();
  });
});

describe("mostRevealing", () => {
  it("finds the first backed card guessed as the stated party that came from another", () => {
    const answers = [
      answer("R", "support", "R"), // guessed another party
      answer("R", "oppose", "D"), // not backed
      answer("D", "support", "D"), // really theirs
      answer("R", "support", "D"), // the one
      answer("L", "support", "D"), // also qualifies, but later in the deal
    ];
    expect(mostRevealing(answers, "D")).toBe(answers[3]);
  });

  it("uses the party an Independent guessed most", () => {
    const answers = [
      answer("L", "support", "L"),
      answer("R", "support", "D"), // D isn't the party they guessed most
      answer("D", "support", "L"), // the one
    ];
    expect(mostRevealing(answers, "I")).toBe(answers[2]);
  });

  it("is null when no backed card meets the rule", () => {
    const answers = [
      answer("D", "support", "D"),
      answer("R", "oppose", "D"),
      answer("L", "support", "R"),
    ];
    expect(mostRevealing(answers, "D")).toBeNull();
  });
});
