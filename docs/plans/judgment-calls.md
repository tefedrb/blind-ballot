# Judgment calls

A running log of the calls that are mine to make during the build. Claude adds an entry whenever a choice would change the spec, the plan, the security model, the deck's wording rules or the copy, or whenever the plan and the code disagree. Each entry gives the options and Claude's recommendation. When I decide, the entry moves to **Decided** with the date, the decision and the commit that carries it out.

Unlike `handoff.md`, this file keeps its history. It's the record of what I decided, and why, for the interview.

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
- **Recommendation:** read it aloud and change anything that doesn't sound like me, because the interview will ask about it. Keep the landing page and README §2 identical.

### The block `next dev` adds to `CLAUDE.md`

- **Raised:** 2026-10-02, Task 4, Step 7.
- **The question:** `next dev` appends a "This is NOT the Next.js you know" block to `CLAUDE.md`, telling agents to read `node_modules/next/dist/docs/` first. Next's own generator writes it (`node_modules/next/dist/server/lib/generate-agent-files.js`), and it comes back after every `next dev`.
- **Options:** commit it; leave it unstaged, so it shows as modified; remove it each time.
- **Recommendation:** commit it. It will keep coming back, and its advice is what fixed the Task 4 build: Next 16's Cache Components needed `export const instant = false` on the pages that read the session.

## Decided

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
