import type { Party, StatedParty, Vote } from "@/content/schema";

// Promise 3 (spec § 6): only what the answers show. Pure maths over answers
// from revealed rounds; Unsure answers are never counted.

const PARTIES: Party[] = ["D", "R", "L"];

// 80%, two-sided.
const Z = 1.2816;

// An answer joined to its plank's party. Only lib/results.ts builds these, and
// only for revealed rounds.
export type RevealedAnswer = { plankId: string; vote: Vote; guess: Party; party: Party };

export type Lean =
  | { verdict: "clear" | "leaning"; leader: Party }
  | { verdict: "too_close"; reason: "tie" | "all_unsure" };

export type Projection = { party: Party; assumed: number; actual: number; supported: number };

// The Wilson score interval for k supported of n counted. With nothing
// counted, the support rate could be anything: [0, 1].
export function wilson(k: number, n: number): { lo: number; hi: number } {
  if (n === 0) return { lo: 0, hi: 1 };
  const rate = k / n;
  const z2 = Z * Z;
  const denominator = 1 + z2 / n;
  const center = (rate + z2 / (2 * n)) / denominator;
  const half = (Z / denominator) * Math.sqrt((rate * (1 - rate)) / n + z2 / (4 * n * n));
  return { lo: center - half, hi: center + half };
}

// The leader is the party with the single highest support rate. It's clear
// when its interval sits wholly above every other party's, and leaning when
// they overlap. A tie for the lead, or nothing counted, is too close to call.
export function lean(answers: RevealedAnswer[]): Lean {
  const counts = supportCounts(answers);
  // A party with nothing counted has no support rate, so it can't lead.
  const rated = PARTIES.filter((p) => counts[p].counted > 0);
  if (rated.length === 0) return { verdict: "too_close", reason: "all_unsure" };

  const rate = (p: Party) => counts[p].supported / counts[p].counted;
  const top = Math.max(...rated.map(rate));
  const leaders = rated.filter((p) => rate(p) === top);
  if (leaders.length > 1) return { verdict: "too_close", reason: "tie" };

  const leader = leaders[0];
  const interval = (p: Party) => wilson(counts[p].supported, counts[p].counted);
  const clear = PARTIES.filter((p) => p !== leader).every(
    (p) => interval(leader).lo > interval(p).hi,
  );
  return { verdict: clear ? "clear" : "leaning", leader };
}

// The exact binomial test against chance: the probability of getting at least
// `right` of `total` by guessing at random, 1 in 3 each time.
export function guessSkill(right: number, total: number): number {
  let p = 0;
  for (let k = right; k <= total; k++) {
    p += choose(total, k) * (1 / 3) ** k * (2 / 3) ** (total - k);
  }
  return p;
}

// Among the cards the player supported: how many they guessed were their
// party's, against how many actually were. Null hides the line.
export function projection(answers: RevealedAnswer[], statedParty: StatedParty): Projection | null {
  const supported = answers.filter((a) => a.vote === "support");
  if (supported.length === 0) return null;
  const party = measuredParty(supported, statedParty);
  if (!party) return null;
  return {
    party,
    assumed: supported.filter((a) => a.guess === party).length,
    actual: supported.filter((a) => a.party === party).length,
    supported: supported.length,
  };
}

// The first card in deal order that the player supported and guessed was their
// party's, but that came from another party. Null hides the line.
export function mostRevealing(
  answers: RevealedAnswer[],
  statedParty: StatedParty,
): RevealedAnswer | null {
  const supported = answers.filter((a) => a.vote === "support");
  const party = measuredParty(supported, statedParty);
  if (!party) return null;
  return supported.find((a) => a.guess === party && a.party !== party) ?? null;
}

// Per party: the cards supported, out of those answered Support or Oppose.
function supportCounts(answers: RevealedAnswer[]) {
  const counts = {
    D: { supported: 0, counted: 0 },
    R: { supported: 0, counted: 0 },
    L: { supported: 0, counted: 0 },
  };
  for (const a of answers) {
    if (a.vote === "unsure") continue;
    counts[a.party].counted++;
    if (a.vote === "support") counts[a.party].supported++;
  }
  return counts;
}

// The party a player is measured against: their stated party, or for
// Independent and Prefer not to say, the party they guessed most often among
// the cards they supported. Null when two parties tie for most guessed.
function measuredParty(supported: RevealedAnswer[], statedParty: StatedParty): Party | null {
  if (statedParty !== "I" && statedParty !== "none") return statedParty;
  const guesses = (p: Party) => supported.filter((a) => a.guess === p).length;
  const top = Math.max(...PARTIES.map(guesses));
  const most = PARTIES.filter((p) => guesses(p) === top);
  return most.length === 1 ? most[0] : null;
}

// n choose k, built up as a running product so it stays exact for small n.
function choose(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}
