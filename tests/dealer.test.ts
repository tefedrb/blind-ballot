import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { PLANKS } from "@/content/planks.fixture";
import type { Party, Plank } from "@/content/schema";
import { TOPICS } from "@/content/topics";
import { DealError, dealPair, roundFor } from "@/lib/dealer";

const PARTIES: Party[] = ["D", "R", "L"];
const SEEDS = 1000;

// The fixture uses each topic exactly twice, so no half could ever break the
// topic cap. This pool puts 4 cards on each of 6 topics, so the cap has to hold.
const CROWDED: Plank[] = PLANKS.map((p, i) => ({ ...p, topic: TOPICS[Math.floor(i / 4)] }));

const ids = (half: Plank[]) => half.map((p) => p.id);

describe.each([
  ["the fixture", PLANKS],
  ["a crowded pool", CROWDED],
])("dealPair on %s, for 1,000 seeds", (_, pool) => {
  const forEverySeed = (check: (halves: [Plank[], Plank[]], seed: string) => void) =>
    fc.assert(
      fc.property(fc.string(), (seed) => check(dealPair(pool, seed), seed)),
      { numRuns: SEEDS },
    );

  it("gives each half 12 cards, exactly 4 per party", () => {
    forEverySeed((halves) => {
      for (const half of halves) {
        expect(half).toHaveLength(12);
        for (const party of PARTIES) {
          expect(half.filter((p) => p.party === party)).toHaveLength(4);
        }
      }
    });
  });

  it("puts no topic in a half more than twice", () => {
    forEverySeed((halves) => {
      for (const half of halves) {
        for (const topic of TOPICS) {
          expect(half.filter((p) => p.topic === topic).length).toBeLessThanOrEqual(2);
        }
      }
    });
  });

  it("gives each half at least one counter-type card per party", () => {
    forEverySeed((halves) => {
      for (const half of halves) {
        for (const party of PARTIES) {
          expect(half.some((p) => p.party === party && p.counterType)).toBe(true);
        }
      }
    });
  });

  it("deals two disjoint halves that together cover the pool", () => {
    forEverySeed(([a, b]) => {
      expect([...ids(a), ...ids(b)].sort()).toEqual(ids(pool).sort());
    });
  });

  it("deals the same halves, order included, for the same seed", () => {
    forEverySeed((halves, seed) => {
      expect(dealPair(pool, seed).map(ids)).toEqual(halves.map(ids));
    });
  });
});

describe("dealPair's final shuffle", () => {
  it("makes card 1 of half A a counter-type card in under 40% of 1,000 deals", () => {
    // Half A holds 3 counter-type cards out of 12, so 25% is expected. Without
    // the final shuffle, card 1 would be a counter-type card in every deal.
    let counterFirst = 0;
    for (let n = 0; n < SEEDS; n++) {
      if (dealPair(PLANKS, `seed-${n}`)[0][0].counterType) counterFirst++;
    }
    expect(counterFirst).toBeLessThan(SEEDS * 0.4);
  });
});

describe("roundFor", () => {
  it("returns half index % 2 of the pair seeded by {userId}:{floor(index / 2)}", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.nat({ max: 3 }), (userId, index) => {
        const pair = dealPair(PLANKS, `${userId}:${Math.floor(index / 2)}`);
        expect(ids(roundFor(PLANKS, userId, index))).toEqual(ids(pair[index % 2]));
      }),
    );
  });
});

describe("DealError", () => {
  it("is thrown for a pool with only one counter-type card for a party", () => {
    const dropped = PLANKS.find((p) => p.party === "D" && p.counterType)!;
    const pool = PLANKS.map((p) => (p.id === dropped.id ? { ...p, counterType: false } : p));

    expect(() => dealPair(pool, "any seed")).toThrow(DealError);
  });
});
