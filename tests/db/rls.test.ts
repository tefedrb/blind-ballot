import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

// Each client keeps its own session in memory, so A and B never share one.
const noPersist = { auth: { persistSession: false, autoRefreshToken: false } };

const admin = createClient(url, secretKey, noPersist);

type TestUser = { client: SupabaseClient; id: string };

async function signInGuest(): Promise<TestUser> {
  const client = createClient(url, publishableKey, noPersist);
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error("no user returned");
  return { client, id: data.user.id };
}

let a: TestUser;
let b: TestUser;

beforeAll(async () => {
  a = await signInGuest();
  b = await signInGuest();
});

// Each check deals its own round. A user may hold only one unrevealed round,
// so clear them between checks; the cascade removes their answers.
afterEach(async () => {
  await admin.from("rounds").delete().in("user_id", [a.id, b.id]);
});

afterAll(async () => {
  // Deleting the users cascades to their profiles, rounds and answers.
  for (const user of [a, b]) {
    if (user) await admin.auth.admin.deleteUser(user.id);
  }
});

const PLANK_IDS = Array.from({ length: 12 }, (_, i) => `test-${i + 1}`);

// Only the server deals rounds, so the admin client creates them here too.
async function dealRound(userId: string, revealed = false): Promise<string> {
  const { data, error } = await admin
    .from("rounds")
    .insert({
      user_id: userId,
      seed: `${userId}:0:0`,
      plank_ids: PLANK_IDS,
      revealed_at: revealed ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

function answer(user: TestUser, roundId: string, plankId: string) {
  return user.client
    .from("answers")
    .insert({ round_id: roundId, plank_id: plankId, vote: "support", guess: "D" });
}

function reveal(user: TestUser, roundId: string) {
  return user.client.rpc("reveal_round", { rid: roundId });
}

describe("row-level security", { timeout: 20_000 }, () => {
  it("1. B can't read A's rounds", async () => {
    const roundId = await dealRound(a.id);

    const asB = await b.client.from("rounds").select("id");
    const asA = await a.client.from("rounds").select("id");

    expect(asB.error).toBeNull();
    expect(asB.data).toEqual([]);
    // Control: the round exists and its owner can see it.
    expect(asA.data).toEqual([{ id: roundId }]);
  });

  it("2. A can't answer after the reveal", async () => {
    const roundId = await dealRound(a.id, true);

    const { error } = await answer(a, roundId, PLANK_IDS[0]);

    expect(error?.code).toBe("42501");
  });

  it("3. reveal_round needs all 12 answers, then returns the same stamp", async () => {
    const roundId = await dealRound(a.id);
    for (const plankId of PLANK_IDS.slice(0, 11)) {
      const { error } = await answer(a, roundId, plankId);
      expect(error).toBeNull();
    }

    const early = await reveal(a, roundId);
    expect(early.error?.message).toBe("round_incomplete");

    expect((await answer(a, roundId, PLANK_IDS[11])).error).toBeNull();
    const first = await reveal(a, roundId);
    expect(first.error).toBeNull();
    expect(typeof first.data).toBe("string");

    const again = await reveal(a, roundId);
    expect(again.data).toBe(first.data);
  });

  it("4. B can't answer in A's round, as B or as A", async () => {
    const roundId = await dealRound(a.id);

    const asB = await answer(b, roundId, PLANK_IDS[0]);
    const asA = await b.client.from("answers").insert({
      round_id: roundId,
      plank_id: PLANK_IDS[0],
      user_id: a.id,
      vote: "support",
      guess: "D",
    });

    expect(asB.error?.code).toBe("42501");
    expect(asA.error?.code).toBe("42501");
  });

  it("5. A can't edit or delete an answer", async () => {
    const roundId = await dealRound(a.id);
    expect((await answer(a, roundId, PLANK_IDS[0])).error).toBeNull();

    const edit = await a.client
      .from("answers")
      .update({ vote: "oppose" })
      .eq("round_id", roundId);
    const remove = await a.client.from("answers").delete().eq("round_id", roundId);

    expect(edit.error?.code).toBe("42501");
    expect(remove.error?.code).toBe("42501");
    const { data } = await admin.from("answers").select("vote").eq("round_id", roundId);
    expect(data).toEqual([{ vote: "support" }]);
  });
});
