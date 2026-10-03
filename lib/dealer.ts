import type { Party, Plank } from "@/content/schema";
import { seededRandom } from "./prng";

const PARTIES: Party[] = ["D", "R", "L"];
const PER_PARTY = 4;
const MAX_PER_TOPIC = 2;
const MAX_ATTEMPTS = 200;

export class DealError extends Error {}

// Splits the deck into two 12-card halves that each meet the rules (spec § 6,
// promise 2). The same seed always gives the same deal, order included.
export function dealPair(pool: Plank[], seed: string): [Plank[], Plank[]] {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const dealSeed = `${seed}/${attempt}`;
    const a = buildHalf(shuffle(pool, seededRandom(dealSeed)));
    const b = pool.filter((p) => !a.includes(p));
    if (!meetsRules(a) || !meetsRules(b)) continue;

    // Half A was built counter-type cards first, so shuffle each half's order:
    // a card's position mustn't say anything about it.
    const random = seededRandom(`${dealSeed}/order`);
    return [shuffle(a, random), shuffle(b, random)];
  }
  throw new DealError(`No valid deal after ${MAX_ATTEMPTS} attempts`);
}

// A user's rounds are the two halves of one deal, so round 2 never repeats a card.
export function roundFor(pool: Plank[], userId: string, index: number): Plank[] {
  return dealPair(pool, `${userId}:${Math.floor(index / 2)}`)[index % 2];
}

// Builds half A greedily from the shuffled pool. It may fall short; the caller
// checks both halves against the rules.
function buildHalf(shuffled: Plank[]): Plank[] {
  const half: Plank[] = [];
  const fits = (p: Plank) =>
    !half.includes(p) &&
    half.filter((q) => q.party === p.party).length < PER_PARTY &&
    half.filter((q) => q.topic === p.topic).length < MAX_PER_TOPIC;

  // First, one counter-type card per party.
  for (const party of PARTIES) {
    const card = shuffled.find((p) => p.party === party && p.counterType && fits(p));
    if (card) half.push(card);
  }
  // Then fill each party's quota. Prefer cards that aren't counter-type, so the
  // other half keeps a counter-type card for every party.
  const rest = [...shuffled.filter((p) => !p.counterType), ...shuffled.filter((p) => p.counterType)];
  for (const card of rest) {
    if (fits(card)) half.push(card);
  }
  return half;
}

function meetsRules(half: Plank[]): boolean {
  return (
    half.length === PER_PARTY * PARTIES.length &&
    PARTIES.every(
      (party) =>
        half.filter((p) => p.party === party).length === PER_PARTY &&
        half.some((p) => p.party === party && p.counterType),
    ) &&
    half.every((p) => half.filter((q) => q.topic === p.topic).length <= MAX_PER_TOPIC)
  );
}

// Fisher-Yates, on a copy.
function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
