import type { Candidate, Party, Plank } from "@/content/schema";
import { countWords } from "./extract";
import { PLATFORMS } from "./platforms";
import { quoteFound } from "./quote-check";

export const MAX_QUOTE_WORDS = 40;

// A candidate after the Desk's checks, with its ID and its party from the platform.
export type CheckedCandidate = Candidate & {
  id: string;
  party: Party;
  quoteFound: boolean;
  quoteWords: number;
  passed: boolean;
};

export type CheckCounts = { proposed: number; passed: number; flagged: number };

export function checkCandidates(
  party: Party,
  candidates: Candidate[],
  sourceText: string,
): { cards: CheckedCandidate[]; counts: CheckCounts } {
  const { doc } = PLATFORMS[party];

  const cards = candidates.map((c, i): CheckedCandidate => {
    const found = quoteFound(c.quote, sourceText);
    const quoteWords = countWords(c.quote);
    return {
      // Copy the fields by name, so nothing else Claude sent comes along.
      statement: c.statement,
      quote: c.quote,
      section: c.section,
      topic: c.topic,
      counterType: c.counterType,
      counterReason: c.counterReason,
      id: `${doc}-${i + 1}`,
      party,
      quoteFound: found,
      quoteWords,
      passed: found && quoteWords <= MAX_QUOTE_WORDS,
    };
  });

  const passed = cards.filter((c) => c.passed).length;
  return { cards, counts: { proposed: cards.length, passed, flagged: cards.length - passed } };
}

const PARTY_ORDER: Party[] = ["D", "R", "L"];

// The passing cards in the Plank shape, grouped by party, counter-type first.
export function toDraftPlanks(cards: CheckedCandidate[]): Plank[] {
  return PARTY_ORDER.flatMap((party) => {
    const passing = cards.filter((c) => c.party === party && c.passed);
    const ordered = [
      ...passing.filter((c) => c.counterType),
      ...passing.filter((c) => !c.counterType),
    ];
    return ordered.map((c) => ({
      id: c.id,
      party: c.party,
      topic: c.topic,
      statement: c.statement,
      quote: c.quote,
      source: { doc: PLATFORMS[party].doc, section: c.section, url: PLATFORMS[party].url },
      counterType: c.counterType,
    }));
  });
}
