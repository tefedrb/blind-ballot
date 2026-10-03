import { describe, expect, it } from "vitest";
import { allPlanks, getPlank, toCard } from "@/lib/deck";

describe("toCard", () => {
  it("returns exactly id, statement and topic, so the party never reaches the browser", () => {
    for (const plank of allPlanks()) {
      expect(Object.keys(toCard(plank)).sort()).toEqual(["id", "statement", "topic"]);
    }
  });
});

describe("getPlank", () => {
  it("finds a plank by its ID", () => {
    const [first] = allPlanks();
    expect(getPlank(first.id)).toBe(first);
  });

  it("throws for an ID that isn't in the deck", () => {
    expect(() => getPlank("no-such-card")).toThrow();
  });
});
