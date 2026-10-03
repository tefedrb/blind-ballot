import { describe, expect, it } from "vitest";
import { nextCard, nextStep, type PlayerState } from "@/lib/next-step";

const state = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  unrevealedRoundId: null,
  revealedRoundIds: [],
  statedParty: "I",
  ...overrides,
});

describe("nextStep", () => {
  it("resumes an unrevealed round, even when two rounds are revealed", () => {
    expect(nextStep(state({ unrevealedRoundId: "r3", revealedRoundIds: ["r1", "r2"] }))).toEqual({
      kind: "resume",
      roundId: "r3",
    });
  });

  it("resumes an unrevealed round before asking for a party", () => {
    expect(nextStep(state({ unrevealedRoundId: "r1", statedParty: null }))).toEqual({
      kind: "resume",
      roundId: "r1",
    });
  });

  it("ends the deck after two revealed rounds, pointing at the latest one", () => {
    expect(nextStep(state({ revealedRoundIds: ["r1", "r2"] }))).toEqual({
      kind: "deck-done",
      roundId: "r2",
    });
  });

  it("asks for the stated party before round 1", () => {
    expect(nextStep(state({ statedParty: null }))).toEqual({ kind: "choose-party" });
  });

  it("deals round 1, then round 2", () => {
    expect(nextStep(state())).toEqual({ kind: "deal", round: 1 });
    expect(nextStep(state({ revealedRoundIds: ["r1"] }))).toEqual({ kind: "deal", round: 2 });
  });
});

describe("nextCard", () => {
  const dealt = ["a", "b", "c"];

  it("gives the first card in deal order, numbered from 1", () => {
    expect(nextCard(dealt, [])).toEqual({ plankId: "a", number: 1 });
  });

  it("skips the cards already answered", () => {
    expect(nextCard(dealt, ["a"])).toEqual({ plankId: "b", number: 2 });
    expect(nextCard(dealt, ["b"])).toEqual({ plankId: "a", number: 1 });
  });

  it("gives null once every card is answered", () => {
    expect(nextCard(dealt, ["c", "a", "b"])).toBeNull();
  });
});
