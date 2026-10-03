import type { Party, Plank, StatedParty, Vote } from "@/content/schema";
import {
  guessSkill,
  lean,
  mostRevealing,
  projection,
  supportCounts,
  type Lean,
  type Projection,
  type RevealedAnswer,
  type SupportCount,
} from "./verdict";

// One answer, as the player gave it. The party comes from the deck.
export type Answer = { plankId: string; vote: Vote; guess: Party };

// One card in the card-by-card reveal.
export type CardRow = { plank: Plank; vote: Vote; guess: Party };

// Everything the results page shows, so the page does no maths.
export type Results = {
  lean: Lean;
  support: Record<Party, SupportCount>;
  guesses: { right: number; total: number; p: number };
  projection: Projection | null;
  mostRevealing: CardRow | null;
  rows: CardRow[];
};

// `answers` are every answer from the player's revealed rounds, which the
// verdict and the findings count together. `dealt` is this round's plank IDs in
// deal order: the card-by-card rows and the most revealing card come from it.
export function resultsFor(
  answers: Answer[],
  planks: Plank[],
  statedParty: StatedParty,
  dealt: string[],
): Results {
  const plankFor = (id: string) => {
    const plank = planks.find((p) => p.id === id);
    if (!plank) throw new Error(`No plank with ID ${id}`);
    return plank;
  };
  const revealed: RevealedAnswer[] = answers.map((a) => ({
    ...a,
    party: plankFor(a.plankId).party,
  }));

  const round = dealt.map((id) => {
    const answer = revealed.find((a) => a.plankId === id);
    // The database reveals a round only once every card is answered.
    if (!answer) throw new Error(`No answer for ${id}`);
    return answer;
  });
  const row = (a: RevealedAnswer): CardRow => ({
    plank: plankFor(a.plankId),
    vote: a.vote,
    guess: a.guess,
  });

  const right = revealed.filter((a) => a.guess === a.party).length;
  const card = mostRevealing(round, statedParty);
  return {
    lean: lean(revealed),
    support: supportCounts(revealed),
    guesses: { right, total: revealed.length, p: guessSkill(right, revealed.length) },
    projection: projection(revealed, statedParty),
    mostRevealing: card ? row(card) : null,
    rows: round.map(row),
  };
}
