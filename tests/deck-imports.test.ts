import { describe, expect, it } from "vitest";
import { importsOf, isClientComponent, sourceFiles } from "./imports";

// The deck data holds every card's party, so only the gate may read it.
const DECK_DATA = ["content/planks", "content/planks.fixture"];

const mayImportDeckData = (file: string) =>
  file === "lib/deck.ts" || file.startsWith("scripts/") || file.startsWith("tests/");

describe("the deck boundary", () => {
  it("lets only lib/deck.ts, scripts/ and tests/ import the deck data", () => {
    const offenders = sourceFiles().filter(
      (file) => !mayImportDeckData(file) && importsOf(file).some((i) => DECK_DATA.includes(i)),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps lib/deck out of every client component", () => {
    const offenders = sourceFiles().filter(
      (file) => isClientComponent(file) && importsOf(file).includes("lib/deck"),
    );
    expect(offenders).toEqual([]);
  });
});
