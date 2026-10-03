# Handoff

The current state of the build, for the next session. Claude rewrites this at every task boundary, then suggests a `/clear`. It holds the current state only; `git log` has the history.

**Updated:** 2026-10-03, after `d7d5e73` (end of Task 5).

## Where we are

- **Done and pushed:** Task 1, Step 6; all of Tasks 2, 3, 4 and 5.
- **The MVP line is reached.** On prod, in a fresh incognito window, the user played a full round on the real deck: 12 cards, the lock-in screen, then Reveal and the "Card by card" list.
- **The deck is live:** 24 cards in `content/planks.ts`, 8 per party, 3 counter-type each, 11 topics with no "Energy and climate". `lib/deck.ts` reads it, and all 13 deck tests pass. README §7 has the Desk's funnel.
- **Waiting on the user:**
  - **Five Open entries in `docs/plans/judgment-calls.md`:**
    - the plain-sounding loaded words;
    - "freedom", "liberty" and "democracy";
    - the landing "why" in the user's own voice;
    - the `next dev` block in `CLAUDE.md`;
    - adding `next build` to the pre-push checks.
  - **The deferred review of the Desk code,** commit `fbaa422`.
- **Next:** Task 6, Step 1: the failing verdict tests in `tests/verdict.test.ts`, table-driven from the plan. That's a **[Claude → you check]** step, so show the red run.

## Decisions and departures from the plan

The calls the user made are in `docs/plans/judgment-calls.md`. These are Claude's implementation choices:

- **Pages that read the session export `instant = false`.** Next 16 has Cache Components on, so a page that reads cookies outside `<Suspense>` fails `next build`. The results page already has it.
- **Where things live:**
  - the `Card` type is in `content/schema.ts`, so client components can use it without importing `lib/deck`;
  - the button names (`PARTY_NAMES`, `VOTE_NAMES`) are in `lib/labels.ts`;
  - `getRound(id)` is in `lib/player.ts`. It returns null for a malformed or foreign ID, and the round comes with its answers;
  - `nextCard()` is in `lib/next-step.ts`.
- **`startRound` must be bound:** `startRound.bind(null, party)` or `startRound.bind(null, undefined)`. As a bare form action it would receive the form data, and Zod would reject it.
- **Redirects between the round pages:**
  - the reveal page sends the player back to the round if cards are still unanswered, and on to the results if the round is already revealed;
  - the results page gives a 404 for a foreign round and redirects to the round if it isn't revealed.
- **The bare results page joins answers to planks inline** (`app/round/[id]/results/page.tsx`). It throws if a revealed round has no answer for a card. Task 6, Step 4 moves the join into `lib/results.ts`, with tests.
- **The deck tests** (`tests/deck.test.ts`):
  - each rule collects the cards that break it and expects `[]`, so a failure names them;
  - the limits are literals from the spec, not the Desk's `MAX_QUOTE_WORDS`;
  - word counts use `countWords` from `scripts/lib/extract.ts`;
  - `loadedWordsIn()` lives in the test file, with two tests of its own.
- **`content/planks.ts` was generated** by a one-off script, since deleted. Each card has a `// Desk:` comment with its original ID. Cards are sorted by the order in `content/topics.ts`, then by statement.
- **The dealer tests still use the fixture** (`tests/dealer.test.ts` imports it directly). The fixture's IDs are now `card-01` to `card-24` too.
- **Task 5's single plan commit became several:** `a71109c` (the deck tests), `8d29dfd` (the deck), `7757297` (the results page) and `d7d5e73` (README §7), plus the judgment-call logs.
- **The Desk's retry.** SDK 0.131.0's `parse()` throws an `AnthropicError` when output is cut off or fails the schema, so `research-desk.ts` retries once at effort `medium` on any non-API `AnthropicError`. No call needed the retry.
- **The Libertarian text** includes lp.org's footer menu, which sits between the plan's two markers.
- **Task 2 had no red run,** and the Vitest config is `vitest.config.mts`.

## Gotchas

- **The fixture and the real deck share `card-NN` IDs.** A round dealt from the fixture now shows real cards beside placeholder answers instead of erroring. Test only with fresh incognito sessions.
- **The `startTime` error in the console on Start is Chrome DevTools' own bug.** Its Live Metrics script runs as a `VM` script and only while DevTools is open. It mishandles the soft navigation after Start. Ignore it.
- **Some source sections contain names.** For example, card-01's section is "Make Trump Tax Cuts Permanent…". They show only after the reveal, so the blind holds.
- **Run `npx next build` before pushing page changes.** `tsc` and `npm test` don't catch Cache Components prerender errors, but Vercel's build does.
- **`next dev` re-adds a block to the end of `CLAUDE.md`.** Until the user decides, keep it out of commits: stage only named files, never `CLAUDE.md`.
- **A scratch script that imports project packages must sit inside the repo,** for example in the gitignored `.cache/`, so Node can find `node_modules`. Delete it afterwards.
- tsx runs `.ts` scripts as CommonJS, so no top-level `await`. Use `.mts`, or wrap the script in `main()`.
- A commit message containing an apostrophe breaks the heredoc. Write the message to a file and use `git commit -F`.
- Run `git diff --cached` before every commit.
- Don't report elapsed time; the user asked for that.
