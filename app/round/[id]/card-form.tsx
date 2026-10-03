"use client";

import { useState, useTransition } from "react";
import { answerCard } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { Card, Party, Vote } from "@/content/schema";
import { PARTY_NAMES, VOTE_NAMES } from "@/lib/labels";

const VOTES = Object.keys(VOTE_NAMES) as Vote[];
const PARTIES = Object.keys(PARTY_NAMES) as Party[];

// One card. The vote comes first, so the guess can't prime it. The second tap
// sends both, and the server moves on to the next card. There's no way back,
// and every party button looks the same.
export function CardForm({
  roundId,
  card,
  number,
  total,
}: {
  roundId: string;
  card: Card;
  number: number;
  total: number;
}) {
  const [vote, setVote] = useState<Vote | null>(null);
  const [pending, startTransition] = useTransition();

  function guess(party: Party) {
    if (!vote) return;
    startTransition(() => answerCard(roundId, card.id, vote, party));
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Card {number} of {total}
        </span>
        <span>{card.topic}</span>
      </div>

      <p className="text-xl font-medium leading-snug">{card.statement}</p>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-semibold">Would you support this?</legend>
        <div className="grid grid-cols-3 gap-2">
          {VOTES.map((v) => (
            <Button
              key={v}
              type="button"
              variant={vote === v ? "default" : "outline"}
              // The vote locks on tap: the other two switch off.
              disabled={vote !== null && vote !== v}
              onClick={() => setVote(v)}
              className="h-12 px-2"
            >
              {VOTE_NAMES[v]}
            </Button>
          ))}
        </div>
      </fieldset>

      {vote && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-semibold">Who proposed it?</legend>
          <div className="grid grid-cols-3 gap-2">
            {PARTIES.map((p) => (
              <Button
                key={p}
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => guess(p)}
                className="h-12 px-2"
              >
                {PARTY_NAMES[p]}
              </Button>
            ))}
          </div>
        </fieldset>
      )}

      <p className="text-center text-xs text-muted-foreground">Answers lock on tap.</p>
    </div>
  );
}
