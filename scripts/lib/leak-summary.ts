import type { LeakAnswer, Party } from "@/content/schema";
import { guessSkill } from "@/lib/verdict";

// The leak check's maths (spec § 8). Pure: the script makes the calls and hands
// the answers over.

const PARTIES: Party[] = ["D", "R", "L"];

// A card flagged for review needs at least 4 of 5 runs naming its party.
const FLAG_SURENESS = 0.8;

// One card's answers, 5 runs on each version: the neutral statement and the
// original quote.
export type CardRuns = {
  plankId: string;
  party: Party;
  neutral: LeakAnswer[];
  original: LeakAnswer[];
};

// The majority is null on a tie. Sureness is how often the most common answer
// came up, whether or not it was a tie.
export type VersionResult = {
  majority: Party | null;
  sureness: number;
  correct: boolean;
  cues: string[];
};

export type CardResult = {
  plankId: string;
  party: Party;
  neutral: VersionResult;
  original: VersionResult;
};

export type Accuracy = { right: number; total: number; accuracy: number; pValue: number };

export type LeakSummary = {
  cards: CardResult[];
  neutral: Accuracy;
  original: Accuracy;
  // Original accuracy minus neutral accuracy: how much spin the rewrite removed.
  drop: number;
  // The cards whose neutral statement Claude placed right, with 4 or more of
  // 5 runs agreeing.
  flagged: string[];
};

export function summarize(runs: CardRuns[]): LeakSummary {
  const cards = runs.map((card) => ({
    plankId: card.plankId,
    party: card.party,
    neutral: versionResult(card.neutral, card.party),
    original: versionResult(card.original, card.party),
  }));
  const neutral = accuracy(cards.map((card) => card.neutral));
  const original = accuracy(cards.map((card) => card.original));
  return {
    cards,
    neutral,
    original,
    drop: original.accuracy - neutral.accuracy,
    flagged: cards
      .filter((card) => card.neutral.correct && card.neutral.sureness >= FLAG_SURENESS)
      .map((card) => card.plankId),
  };
}

function versionResult(answers: LeakAnswer[], party: Party): VersionResult {
  const count = (p: Party) => answers.filter((a) => a.party === p).length;
  const top = Math.max(...PARTIES.map(count));
  const leaders = PARTIES.filter((p) => count(p) === top);
  const majority = leaders.length === 1 ? leaders[0] : null;
  const cues = answers.filter((a) => a.party === majority).flatMap((a) => a.cues);
  return {
    majority,
    sureness: top / answers.length,
    correct: majority === party,
    cues: [...new Set(cues)],
  };
}

function accuracy(results: VersionResult[]): Accuracy {
  const right = results.filter((r) => r.correct).length;
  const total = results.length;
  return { right, total, accuracy: right / total, pValue: guessSkill(right, total) };
}
