import "server-only";
import { z } from "zod";
import type { Party, Vote } from "@/content/schema";
import type { PlayerState } from "./next-step";
import { createClient } from "./supabase/server";

// A round as the database stores it, with its answers.
export type RoundRow = {
  id: string;
  plank_ids: string[];
  revealed_at: string | null;
  answers: { plank_id: string; vote: Vote; guess: Party }[];
};

// One of the player's own rounds, or null when the ID doesn't exist or isn't
// theirs: row-level security makes the two look the same, so both are a 404.
export async function getRound(id: string): Promise<RoundRow | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("id, plank_ids, revealed_at, answers(plank_id, vote, guess)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Reads the player's rounds and stated party with their own client, so
// row-level security returns only their rows.
export async function getPlayerState(): Promise<PlayerState> {
  const supabase = await createClient();
  const [rounds, profile] = await Promise.all([
    supabase.from("rounds").select("id, revealed_at").order("created_at"),
    supabase.from("profiles").select("stated_party").maybeSingle(),
  ]);
  if (rounds.error) throw rounds.error;
  if (profile.error) throw profile.error;

  return {
    unrevealedRoundId: rounds.data.find((r) => r.revealed_at === null)?.id ?? null,
    revealedRoundIds: rounds.data.filter((r) => r.revealed_at !== null).map((r) => r.id),
    statedParty: profile.data?.stated_party ?? null,
  };
}
