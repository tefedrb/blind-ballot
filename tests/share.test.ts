import { describe, expect, it } from "vitest";
import { PLANKS } from "@/content/planks";
import { PARTY_NAMES } from "@/lib/labels";
import { shareLine } from "@/lib/share";
import { lean, type Lean, type RevealedAnswer } from "@/lib/verdict";

const HOME = "https://blind-ballot.vercel.app/";

describe("shareLine", () => {
  it.each<[Lean, string]>([
    [{ verdict: "clear", leader: "D" }, "clearly Democrat"],
    [{ verdict: "leaning", leader: "L" }, "leaning Libertarian"],
    [{ verdict: "too_close", reason: "tie" }, "too close to call"],
    [{ verdict: "too_close", reason: "all_unsure" }, "too close to call"],
  ])("puts the lean %o as %s", (lean, words) => {
    expect(shareLine({ lean, right: 8, total: 12, homeUrl: HOME })).toBe(
      `Blind Ballot · guessed 8/12 · blind lean: ${words} · ${HOME}`,
    );
  });

  it("gives away no card, no per-card party and no round, and ends with the home page", () => {
    const roundId = "3f2b8c1e-6a4d-4e9f-9b7a-2c5d8e1f0a6b";
    const round = PLANKS.slice(0, 12);
    const answers: RevealedAnswer[] = round.map((p) => ({
      plankId: p.id,
      vote: "support",
      guess: "D",
      party: p.party,
    }));
    const right = answers.filter((a) => a.guess === a.party).length;

    const line = shareLine({ lean: lean(answers), right, total: 12, homeUrl: HOME });

    for (const plank of round) {
      expect(line).not.toContain(plank.statement);
      expect(line).not.toContain(plank.id);
    }
    expect(line).not.toContain(roundId);
    // At most one party is named: the leader, never one per card.
    const named = Object.values(PARTY_NAMES).filter((name) => line.includes(name));
    expect(named.length).toBeLessThanOrEqual(1);
    expect(line.endsWith(HOME)).toBe(true);
  });
});
