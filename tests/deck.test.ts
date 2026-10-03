import { describe, expect, it } from "vitest";
import { LOADED_WORDS } from "@/content/loaded-words";
import { type Party, PlankSchema } from "@/content/schema";
import { TOPICS } from "@/content/topics";
import { dealPair } from "@/lib/dealer";
import { allPlanks } from "@/lib/deck";
import { countWords } from "@/scripts/lib/extract";

// Promise 4 (spec § 6): neutral, sourced cards. Each rule collects the cards
// that break it, so a failure names them.

const PARTIES: Party[] = ["D", "R", "L"];
const deck = allPlanks();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole words only, ignoring case: "Harris" doesn't match "Harrison".
function loadedWordsIn(statement: string): string[] {
  return LOADED_WORDS.filter((word) => new RegExp(`\\b${escape(word)}\\b`, "i").test(statement));
}

describe("loadedWordsIn", () => {
  it("finds words and phrases, ignoring case", () => {
    expect(loadedWordsIn("Repeal obamacare and end the Death Tax")).toEqual(["Obamacare", "death tax"]);
  });

  it("ignores a loaded word inside a longer word", () => {
    expect(loadedWordsIn("Fund new schools in Harrison County")).toEqual([]);
  });
});

describe("the deck", () => {
  it("parses with the Plank schema, with unique IDs", () => {
    expect(deck.filter((p) => !PlankSchema.safeParse(p).success).map((p) => p.id)).toEqual([]);
    expect(new Set(deck.map((p) => p.id)).size).toBe(deck.length);
  });

  it("numbers every ID card-NN, so the ID says nothing about the party", () => {
    expect(deck.map((p) => p.id).filter((id) => !/^card-\d{2}$/.test(id))).toEqual([]);
  });

  it("has 24 cards, 8 per party", () => {
    expect(deck).toHaveLength(24);
    expect(PARTIES.map((party) => deck.filter((p) => p.party === party).length)).toEqual([8, 8, 8]);
  });

  it("has at least 2 counter-type cards per party", () => {
    const short = PARTIES.map((party) => ({
      party,
      counterType: deck.filter((p) => p.party === party && p.counterType).length,
    })).filter((c) => c.counterType < 2);
    expect(short).toEqual([]);
  });

  it("gives every topic that appears at least 2 parties and at most 4 cards", () => {
    const broken = TOPICS.map((topic) => {
      const cards = deck.filter((p) => p.topic === topic);
      return { topic, cards: cards.length, parties: new Set(cards.map((p) => p.party)).size };
    }).filter((t) => t.cards > 0 && (t.parties < 2 || t.cards > 4));
    expect(broken).toEqual([]);
  });

  it("has no loaded words or names in any statement", () => {
    const loaded = deck
      .map((p) => ({ id: p.id, words: loadedWordsIn(p.statement) }))
      .filter((c) => c.words.length > 0);
    expect(loaded).toEqual([]);
  });

  it("has statements of 8–20 words", () => {
    const outOfRange = deck
      .map((p) => ({ id: p.id, words: countWords(p.statement) }))
      .filter((c) => c.words < 8 || c.words > 20);
    expect(outOfRange).toEqual([]);
  });

  it("has quotes of at most 40 words", () => {
    const tooLong = deck
      .map((p) => ({ id: p.id, words: countWords(p.quote) }))
      .filter((c) => c.words > 40);
    expect(tooLong).toEqual([]);
  });

  it("keeps the mean statement length per party within 15 characters", () => {
    const means = PARTIES.map((party) => {
      const lengths = deck.filter((p) => p.party === party).map((p) => p.statement.length);
      return lengths.reduce((a, b) => a + b, 0) / lengths.length;
    });
    expect(Math.max(...means) - Math.min(...means)).toBeLessThanOrEqual(15);
  });

  it("gives every card a section and an https:// source", () => {
    const unsourced = deck
      .filter((p) => !p.source.section.trim() || !p.source.url.startsWith("https://"))
      .map((p) => p.id);
    expect(unsourced).toEqual([]);
  });

  it("can be dealt for 100 seeds", () => {
    for (let n = 0; n < 100; n++) {
      expect(() => dealPair(deck, `seed-${n}`)).not.toThrow();
    }
  });
});
