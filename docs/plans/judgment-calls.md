# Judgment calls

A running log of the calls that are mine to make during the build. Claude adds an entry whenever a choice would change the spec, the plan, the security model, the deck's wording rules or the copy, or whenever the plan and the code disagree. Each entry gives the options and Claude's recommendation. When I decide, the entry moves to **Decided** with the date, the decision and the commit that carries it out.

Unlike `handoff.md`, this file keeps its history. It's the record of what I decided, and why.

## Open

### Loaded words that sound plain

- **Raised:** 2026-10-02, Task 4, Step 7 (`content/loaded-words.ts`).
- **The question:** keep or drop "undocumented", "gun violence", "gun safety", "fair share", "the wealthy", "failed", "dangerous" and "extreme"? Each is one side's usual wording, but each could also catch a legitimate statement.
- **Options:** keep them all; drop some; drop them all.
- **Recommendation:** keep them for now. If a strong card trips one during Task 5's curation, reword the card first, and drop the word only if no neutral wording exists.

### "Freedom", "liberty" and "democracy"

- **Raised:** 2026-10-02, Task 4, Step 7.
- **The question:** add these to the loaded-word list? They're strong tells (L, L and D), but common enough that a ban would cost good cards.
- **Options:** leave them out; add them.
- **Recommendation:** leave them out. The leak check (spec § 8) reports per-card cues, so it catches them there.

### The landing pitch and "why" are in Claude's words

- **Raised:** 2026-10-02, Task 4, Step 7 (`app/page.tsx`, README §2).
- **The question:** the spec says the "why" is in my own words. Claude drafted it from spec § 1. Keep it, or rewrite it in my voice?
- **Options:** keep the draft; edit it; rewrite it.
- **Recommendation:** read it aloud and change anything that doesn't sound like me, because it's in my voice. Keep the landing page and README §2 identical.

### The block `next dev` adds to `CLAUDE.md`

- **Raised:** 2026-10-02, Task 4, Step 7.
- **The question:** `next dev` appends a "This is NOT the Next.js you know" block to `CLAUDE.md`, telling agents to read `node_modules/next/dist/docs/` first. Next's own generator writes it (`node_modules/next/dist/server/lib/generate-agent-files.js`), and it comes back after every `next dev`.
- **Options:** commit it; leave it unstaged, so it shows as modified; remove it each time.
- **Recommendation:** commit it. It will keep coming back, and its advice is what fixed the Task 4 build: Next 16's Cache Components needed `export const instant = false` on the pages that read the session.

### Add `next build` to the checks before a push

- **Raised:** 2026-10-02, Task 4, Step 7.
- **The question:** the rule before every push is `npx tsc --noEmit && npm test`. Neither caught Step 7's build failure: with Cache Components on, a page that reads the session outside `<Suspense>` fails only at `next build`, and Vercel would have refused the deploy. Should `npx next build` join the checks?
- **Options:** run it before every push; run it only when a commit touches `app/`, `lib/` or `next.config.ts`; leave the rule as it is.
- **Recommendation:** run it whenever a commit touches `app/`, `lib/` or `next.config.ts`. It takes about 20 seconds, and a broken deploy late in the build costs far more.

### Which answers decide an Independent's "party they guessed most"

- **Raised:** 2026-10-03, Task 6, Step 4 (`lib/results.ts`).
- **The question:** for Independent and Prefer not to say, the projection line and the most revealing card both use "the party they guessed most" (spec § 6, promise 3). The spec doesn't say over which answers. The projection counts every revealed round, but the most revealing card comes from this round's deal order. So after round 2, the two lines could use different parties.
- **Options:**
  - each line uses its own answers: the projection every revealed round, the most revealing card this round only;
  - both use every revealed round. `mostRevealing` would then need every revealed answer as well as this round's.
- **Recommendation:** each line uses its own answers. This is how it's built now. Both lines name the parties they mean ("you guessed it came from the Democrats"), so they can't contradict each other. It only affects which card qualifies, and only after round 2.

### What the disclosure claims

- **Raised:** 2026-10-03, Task 8, Step 2 (README §9).
- **The question:** two points in the draft are mine to state:
  - **"I reviewed and approved each piece."** This is true only once the deferred reviews are done: the Desk code (`fbaa422`), and the leak-check text in README §7 and `/how-it-works`.
  - **How the spec and the plan were written.** The draft says only that they were prepared in advance, not who wrote them or with what help.
- **Recommendation:** do the two deferred reviews before calling the README done, so the sentence stays as it is. Then say how the spec and the plan were written.

## Decided

### The docs lead with my judgment, not the brief

- **Raised:** 2026-10-03, Task 8, Step 2. Several docs framed the work around the brief, not around the product and my reasons for it.
- **Decided:** 2026-10-03.
  - Reword that framing in the docs that change as we go: `CLAUDE.md`, this file and the deck's header comment.
  - Leave the spec and the plan as they are. They're the dated pre-planning records, and git history keeps every version anyway.
  - Add a README section, "Calls I made", with the decisions behind the design.
  - Leave out any mention of how fast it was built.

  Commit `4885571`.

### README sections that Task 8 doesn't name

- **Raised:** 2026-10-03, Task 8, Step 2. The plan's Step 2 drafts README §§3, 4, 9 and 10. But §1 had no pitch line, and §6 (How it works) and §8 (Tests) were empty. The spec's outline says §6 and §8 are written "as built", and no task did.
- **Decided:** 2026-10-03. Fill §§1, 6 and 8 in the same draft, from the spec's outline. Commit `4885571`.

### The leak check's per-card review is deferred

- **Raised:** 2026-10-03, Task 7, Step 3, a **[Claude → you check]** step. The check flagged 21 of the 24 cards, and their cues mostly restate the policy. Sorting them into wording and policy, and proposing rewrites, can wait until v1 is deployed.
- **Decided:** 2026-10-03. Ship v1 first:
  - publish the overall results and the limits in README §7 and `/how-it-works`, committed without stopping for review;
  - leave all 24 cards unchanged, and list the per-card review under "What's incomplete";
  - review the leak-check text, and then the flagged cards, after the deploy.

  Commit `d18543c`.

### The 24 cards

- **Raised:** 2026-10-03, Task 5, Step 4 (`content/planks.ts`). The spec asks for at least 2 counter-type cards per party, and doesn't require every topic.
- **Decided:** 2026-10-03. Commit `8d29dfd`.
  - 3 counter-type cards per party, so the surprises don't lean toward one party.
  - 11 topics. "Energy and climate" is left out: D's E15 card gives a reason and describes something already done, R's says "mandates", and L's alone would leave the topic with one party.
  - 7 statements reworded to meet the wording rules, such as "assault weapons" to "certain semi-automatic firearms" and "abortion protections" to "abortion rules". The quotes are unchanged.

### Committing the Desk's draft

- **Raised:** 2026-10-03, Task 5, Step 4. The plan commits `research/candidates.json` and `research/desk.log`; the handoff also listed `research/planks.draft.ts`.
- **Decided:** 2026-10-03. Commit the draft too, so the header of `content/planks.ts` points to a file that exists, and the edits from draft to deck show in git. Commit `8d29dfd`.

### The fixture's IDs and the new `card-NN` rule

- **Raised:** 2026-10-02, at the end of Task 4, ahead of Task 5, Step 2. The deck tests run on the fixture first, and its IDs (`fixture-1` to `fixture-24`) would fail the `card-NN` rule.
- **Decided:** 2026-10-02. Rename the fixture's IDs to `card-01` to `card-24` rather than skip the ID test on the fixture. Commit `a71109c`.

### Card IDs mustn't name the party

- **Raised:** 2026-10-02, Task 4, Step 2. The Desk's IDs (`rnc-2024-14`) reach the browser through `toCard()` and `rounds.plank_ids`, so devtools would show a card's party before the answer.
- **Decided:** 2026-10-02. In Task 5, renumber the deck `card-01` to `card-24`, ordered by topic and then by statement, and add a deck test that every ID matches `card-NN`. The spec's example ID is updated to match. Commit `3e98314`.

### A crowded pool in the dealer tests

- **Raised:** 2026-10-02, Task 4, Step 2. The fixture uses each topic exactly twice, so the "no topic more than twice" property couldn't fail.
- **Decided:** 2026-10-02. Also run the property tests on a pool with 4 cards on each of 6 topics. Removing the dealer's topic cap breaks only that pool's test. Commit `9060b95`.

### At most two rounds per player, enforced by the database

- **Raised:** 2026-10-02, Task 4, Step 6, by the security check. A race between reading the player's state and inserting could deal a third round that repeats revealed cards.
- **Decided:** 2026-10-02. Add `unique (user_id, seed)` to `rounds`; I ran the `alter table` in the Supabase SQL editor. DB test 6 covers it. Commit `d7b4939`.

### The Desk's review is deferred

- **Raised:** 2026-10-02, Task 3, Step 5, a **[Claude → you check]** step.
- **Decided:** 2026-10-02. Skip the walkthrough for now, run the Desk, and review commit `fbaa422` later.
- **Reviewed:** 2026-10-03. It looks good for now; I'll come back and refine it after the sprint.
  - **Fixed:** a bare `--party` ran all three platforms. It now stops before any call. Commit `9921b31`.
  - **No code checks a card's section heading.** The 24 cards' headings were checked by hand: each appears in its platform before the quote.
  - **The prompt's small departures from spec § 7 stay:** "ideally 12 to 16" words, "an editor will keep about 8", rule 7's wording, and the 12 topics given only through the output schema.
