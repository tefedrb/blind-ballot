"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  PartySchema,
  StatedPartySchema,
  VoteSchema,
  type Party,
  type StatedParty,
  type Vote,
} from "@/content/schema";
import { roundFor } from "@/lib/dealer";
import { allPlanks } from "@/lib/deck";
import { nextStep } from "@/lib/next-step";
import { getPlayerState } from "@/lib/player";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Postgres's error code for a unique violation.
const UNIQUE_VIOLATION = "23505";

// Every action identifies the user with getUser(), which checks the token with
// Supabase. Never getSession(), and never a user ID sent by the browser.
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  return { supabase, user };
}

// "Start": signs a new visitor in as a guest, then sends them on.
export async function beginAnonymous() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
  redirect("/start");
}

// Saves the stated party if one was chosen, then deals the next round, or
// sends the player wherever nextStep says.
export async function startRound(statedParty?: StatedParty) {
  const party = StatedPartySchema.optional().parse(statedParty);
  const { supabase, user } = await requireUser();

  if (party) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, stated_party: party });
    if (error) throw error;
  }

  const step = nextStep(await getPlayerState());
  if (step.kind === "resume") redirect(`/round/${step.roundId}`);
  if (step.kind !== "deal") redirect("/start");

  // Rounds 1 and 2 are the two halves of one deal (lib/dealer.ts).
  const index = step.round - 1;
  const planks = roundFor(allPlanks(), user.id, index);
  const { data, error } = await createAdminClient()
    .from("rounds")
    .insert({
      user_id: user.id,
      seed: `${user.id}:${Math.floor(index / 2)}:${index % 2}`,
      plank_ids: planks.map((p) => p.id),
    })
    .select("id")
    .single();

  // Another tab dealt first, and the one-unrevealed-round index stopped this
  // insert. Go to that tab's round instead.
  if (error?.code === UNIQUE_VIOLATION) {
    const now = nextStep(await getPlayerState());
    redirect(now.kind === "resume" ? `/round/${now.roundId}` : "/start");
  }
  if (error) throw error;
  redirect(`/round/${data.id}`);
}

const AnswerSchema = z.object({
  roundId: z.uuid(),
  plankId: z.string().min(1),
  vote: VoteSchema,
  guess: PartySchema,
});

// Records one card's vote and guess as the user, so row-level security checks
// it. It never returns a party.
export async function answerCard(roundId: string, plankId: string, vote: Vote, guess: Party) {
  const answer = AnswerSchema.parse({ roundId, plankId, vote, guess });
  const { supabase } = await requireUser();

  const { error } = await supabase.from("answers").insert({
    round_id: answer.roundId,
    plank_id: answer.plankId,
    vote: answer.vote,
    guess: answer.guess,
  });
  // A double tap or a second tab: the card is already answered, and the first
  // answer stands.
  if (error && error.code !== UNIQUE_VIOLATION) throw error;
  redirect(`/round/${answer.roundId}`);
}

export async function revealRound(roundId: string) {
  const id = z.uuid().parse(roundId);
  const { supabase } = await requireUser();

  const { error } = await supabase.rpc("reveal_round", { rid: id });
  // Not every card is answered yet: back to the next one.
  if (error?.message === "round_incomplete") redirect(`/round/${id}`);
  if (error) throw error;
  redirect(`/round/${id}/results`);
}
