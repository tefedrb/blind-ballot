# Handoff

The current state of the build, for the next session. Claude rewrites this at every task boundary, then suggests a `/clear`. It holds the current state only; `git log` has the history.

**Updated:** 2026-10-02, after `5834864` (end of Task 4).

## Where we are

- **Done and pushed:** Task 1, Step 6; all of Tasks 2, 3 and 4.
- **Task 4's manual check passed:** a full round on the placeholder cards, resuming on a refresh, a double-tapped guess, and `/start` redirecting to `/` in incognito. After Reveal, `/round/{id}/results` is a 404, as expected until Task 5.
- **The Desk has finished.** Every platform succeeded: 15 proposed and 15 passed for each of D, R and L. Counter-type cards: D 6, R 4, L 4. R has no Guns card. Its outputs (`research/candidates.json`, `research/planks.draft.ts`, `research/desk.log`) are untracked on purpose, because Task 5 commits them. Don't stage `research/` before then.
- **Waiting on the user:**
  - **Six Open entries in `docs/plans/judgment-calls.md`:**
    - the plain-sounding loaded words;
    - "freedom", "liberty" and "democracy";
    - the landing "why" in the user's own voice;
    - the `next dev` block in `CLAUDE.md`;
    - adding `next build` to the pre-push checks;
    - the fixture's IDs and the new `card-NN` rule. **Settle this one before Task 5, Step 2.**
  - **The deferred review of the Desk code,** commit `fbaa422`.
- **Next:** Task 5, Step 1: check the Desk's output, which is already fine (see above). Then Step 2: the deck tests, before the deck. That's a **[Claude → you check]** step, and it now includes the test that every ID matches `card-NN`.

## Decisions and departures from the plan

The calls the user made are in `docs/plans/judgment-calls.md`. These are Claude's implementation choices:

- **Pages that read the session export `instant = false`.** Next 16 has Cache Components on, so a page that reads cookies outside `<Suspense>` fails `next build`. Task 5's results page needs the same line.
- **Where things live:**
  - the `Card` type is in `content/schema.ts`, so client components can use it without importing `lib/deck`;
  - the button names are in `lib/labels.ts`;
  - `getRound(id)` is in `lib/player.ts`. It returns null for a malformed or foreign ID, and the round comes with its answers;
  - `nextCard()` is in `lib/next-step.ts`.
- **`startRound` must be bound:** `startRound.bind(null, party)` or `startRound.bind(null, undefined)`. As a bare form action it would receive the form data, and Zod would reject it.
- **The reveal page redirects** to the round if cards are still unanswered, and to the results if the round is already revealed.
- **The Desk's retry.** SDK 0.131.0's `parse()` throws an `AnthropicError` when output is cut off or fails the schema, so `research-desk.ts` retries once at effort `medium` on any non-API `AnthropicError`. Each platform logs a line when its call finishes. The `{party}: N proposed · …` summaries print only after all three settle.
- **The Libertarian text** includes lp.org's footer menu, which sits between the plan's two markers. Word counts: D 42,864, R 5,374, L 3,418 (3,446 expected).
- **Task 2 had no red run,** and the Vitest config is `vitest.config.mts`.

## Gotchas

- **Task 5, Step 2 expects the deck tests to pass on the fixture,** but the `card-NN` ID test fails on `fixture-N` IDs. Ask the user about the Open entry first; the recommendation is to rename the fixture's IDs to `card-01` to `card-24`.
- **Run `npx next build` before pushing page changes.** `tsc` and `npm test` don't catch Cache Components prerender errors, but Vercel's build does.
- **`next dev` re-adds a block to the end of `CLAUDE.md`.** Until the user decides, keep it out of commits: copy the file aside, strip the block with `perl -0pi -e 's/\n<!-- BEGIN:nextjs-agent-rules -->.*?<!-- END:nextjs-agent-rules -->\n//s' CLAUDE.md`, stage it, then copy the file back.
- **Rounds dealt from the fixture break once the deck switches,** because `getPlank` throws for unknown IDs. Test only with new sessions after Task 5, Step 3.
- **A scratch script that imports project packages must sit inside the repo,** for example in the gitignored `.cache/`, so Node can find `node_modules`. Delete it afterwards.
- tsx runs `.ts` scripts as CommonJS, so no top-level `await`. Use `.mts`, or wrap the script in `main()`.
- A commit message containing an apostrophe breaks the heredoc. Write the message to a file and use `git commit -F`.
- Run `git diff --cached` before every commit.
- Don't report elapsed time; the user asked for that.
