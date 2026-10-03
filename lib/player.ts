import "server-only";
import type { PlayerState } from "./next-step";
import { createClient } from "./supabase/server";

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
