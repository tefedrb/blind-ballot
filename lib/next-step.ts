import type { StatedParty } from "@/content/schema";

// What the server knows about a player, read under their own row-level security.
export type PlayerState = {
  unrevealedRoundId: string | null;
  // Oldest first.
  revealedRoundIds: string[];
  statedParty: StatedParty | null;
};

export type NextStep =
  | { kind: "resume"; roundId: string }
  | { kind: "deck-done"; roundId: string }
  | { kind: "choose-party" }
  | { kind: "deal"; round: 1 | 2 };

// Where the player goes next. The landing page, /start and startRound all ask
// this one function, so they can't disagree. The rules are checked in order.
export function nextStep(state: PlayerState): NextStep {
  if (state.unrevealedRoundId) return { kind: "resume", roundId: state.unrevealedRoundId };
  // The deck is two halves, so two revealed rounds means every card is seen.
  if (state.revealedRoundIds.length >= 2) {
    return { kind: "deck-done", roundId: state.revealedRoundIds[state.revealedRoundIds.length - 1] };
  }
  if (!state.statedParty) return { kind: "choose-party" };
  return { kind: "deal", round: state.revealedRoundIds.length === 0 ? 1 : 2 };
}
