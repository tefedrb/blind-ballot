# Handoff

The current state of the build, for the next session. Claude rewrites this at every task boundary, then suggests a `/clear`. It holds the current state only; `git log` has the history.

**Updated:** 2026-10-03, after `cf9d8fe` (end of Task 6).

## Where we are

- **Done and pushed:** Task 1, Step 6; all of Tasks 2 to 6.
- **Task 6 shipped as seven commits** rather than the plan's one:
  - `8716d5b`, the verdict;
  - `4d0e802`, the share line;
  - `191b97d`, the results page;
  - `55753bf`, the judgment-call entry;
  - `76d9a97`, save;
  - `0b139c7`, the header and the template deletions;
  - `cf9d8fe`, `/how-it-works`.
- **Waiting on the user:**
  - **The plan's prod check for Task 6,** in a fresh incognito window:
    - play round 1 and look at its results;
    - press "Play round 2", finish it, and check that the results say "You've seen the whole deck";
    - press "Save results", then sign out and back in.

    The save upgrade (same `user_id`, no email sent) is also on Task 8's list.
  - **Six Open entries in `docs/plans/judgment-calls.md`:**
    - the plain-sounding loaded words;
    - "freedom", "liberty" and "democracy";
    - the landing "why" in the user's own voice. `/how-it-works` adds a line in the user's voice: "I reviewed and approved every card."
    - the `next dev` block in `CLAUDE.md`;
    - adding `next build` to the pre-push checks;
    - **new:** which answers decide an Independent's "party they guessed most".
  - **The deferred review of the Desk code,** commit `fbaa422`.
- **Next:** Task 7, Step 1: the failing tests for `scripts/lib/leak-summary.ts` (`tests/leak-summary.test.ts`). That's a **[Claude → you check]** step, so show the red run.

## Decisions and departures from the plan

The calls the user made are in `docs/plans/judgment-calls.md`. These are Claude's implementation choices.

**The verdict and results (Task 6):**

- **`lib/verdict.ts`'s API:**
  - The input is a `RevealedAnswer`: `{ plankId, vote, guess, party }`.
  - `lean()` returns `{ verdict: "clear" | "leaning", leader }` or `{ verdict: "too_close", reason: "tie" | "all_unsure" }`.
  - **`guessSkill(right, total)` returns the p-value.** Task 7 imports it with plain counts.
  - `projection()` and `mostRevealing()` take `(answers, statedParty)`. Both use a private `measuredParty()`.
  - `supportCounts()` is public, for the three bars.
- **The verdict tests go beyond the plan's table:**
  - both bounds for 4/4 and 0/4;
  - non-backed answers in the first projection case;
  - near-misses in the first most-revealing case;
  - an extra most-revealing case for an Independent;
  - `reason: "tie"`.
- **`resultsFor(answers, planks, statedParty, dealt)` takes a fourth input,** `dealt`: this round's plank IDs, in deal order.
  - `answers` holds every revealed answer, which the verdict and the findings count together.
  - The card-by-card rows and the most revealing card come from `dealt`.
  - It throws on an answer whose plank isn't in the deck, and on a dealt card with no answer.
- **The results page:**
  - It loads its data with `getRevealedAnswers()` (`lib/player.ts`), which reads revealed rounds only.
  - It treats a missing stated party as `"none"`.
  - It reads `is_anonymous` from `getClaims()`, to decide whether to show "Save results".
  - "Share" is the only client component (`share-button.tsx`), and it gets only the finished line.
- **The share line:** "Blind Ballot · guessed 8/12 · blind lean: leaning Libertarian · {home URL}". The lean reads "clearly X", "leaning X" or "too close to call", with full party names. The home URL comes from `VERCEL_PROJECT_PRODUCTION_URL`, and falls back to `http://localhost:3000/`.
- **Save:** `SaveSchema` (`lib/save.ts`) carries the error messages, and `saveResults` shows the first one. The form uses `useActionState`.
- **Sign in and out:** the login form and the logout button call `router.refresh()` after `router.push("/")`. Next's layouts don't re-render on navigation, so without it the header would stay stale. The save action needs no refresh, because setting cookies in a server action re-renders the layout.
- **Copy and leftovers:**
  - The login form says "Sign in" instead of "Login", to match the header.
  - `components/theme-switcher.tsx` is now unused. The plan didn't list it for deletion, so it stays.
- **`/how-it-works` hard-codes the source links,** copied from `scripts/lib/platforms.ts`, so Play doesn't import the Desk.

**Carried over from earlier tasks:**

- **Pages that read the session export `instant = false`.** Next 16 has Cache Components on, so a page that reads cookies outside `<Suspense>` fails `next build`. The header's `AuthButton` sits inside `<Suspense>` in `app/layout.tsx` instead.
- **Where things live:**
  - the `Card` type is in `content/schema.ts`;
  - the button names are in `lib/labels.ts`;
  - `getRound(id)`, `getPlayerState()` and `getRevealedAnswers()` are in `lib/player.ts`;
  - `nextStep()` and `nextCard()` are in `lib/next-step.ts`.
- **`startRound` must be bound:** `startRound.bind(null, party)` or `startRound.bind(null, undefined)`.
- **Redirects between the round pages:**
  - the reveal page sends the player back to the round while cards are unanswered, and on to the results once the round is revealed;
  - the results page gives a 404 for a foreign round and redirects to the round if it isn't revealed.
- **The deck tests** (`tests/deck.test.ts`):
  - each rule collects the cards that break it and expects `[]`;
  - the limits are literals from the spec;
  - word counts use `countWords` from `scripts/lib/extract.ts`.
- **`content/planks.ts` was generated** by a one-off script, since deleted. Each card has a `// Desk:` comment with its original ID.
- **The fixture is still used** by the dealer and results tests. Its IDs are `card-01` to `card-24`, like the real deck's.
- **The Desk's retry.** SDK 0.131.0's `parse()` throws an `AnthropicError` when output is cut off or fails the schema, so `research-desk.ts` retries once at effort `medium` on any non-API `AnthropicError`. The leak check should do the same.
- **The Libertarian text** includes lp.org's footer menu.
- **Task 2 had no red run,** and the Vitest config is `vitest.config.mts`.

## Gotchas

- **`/how-it-works` has a placeholder for the leak check:** "The results will be published here." Task 7, Step 3 replaces it with the results. If Task 7 is cut, say the check was skipped, in `/how-it-works` and in README.
- **The repo has no Prettier.** `npx prettier` downloads it and formats at 80 columns, but the code here is written to 100. If you use it, pass `--print-width 100`. Prettier also keeps an object expanded once it has been split across lines, so collapse such objects by hand.
- **TypeScript doesn't narrow `Lean`** after separate checks for `"clear"` and `"leaning"`. Check `verdict === "too_close"` first.
- **To check pages without a session:** run `npx next build`, then `npx next start -p 3123` in the background, and fetch pages with curl. Stop the server afterwards.
- **The fixture and the real deck share `card-NN` IDs.** Test only with fresh incognito sessions.
- **The `startTime` error in the console on Start is Chrome DevTools' own bug.** Ignore it.
- **Some source sections contain names,** such as card-01's "Make Trump Tax Cuts Permanent…". They show only after the reveal.
- **Run `npx next build` before pushing page changes.** `tsc` and `npm test` don't catch Cache Components prerender errors.
- **`next dev` re-adds a block to the end of `CLAUDE.md`.** Until the user decides, never stage `CLAUDE.md`.
- **A scratch script that imports project packages must sit inside the repo,** for example in `.cache/`. Delete it afterwards.
- tsx runs `.ts` scripts as CommonJS, so no top-level `await`. Use `.mts`, or wrap the script in `main()`.
- **Write commit messages to a file and use `git commit -F`.** An apostrophe breaks the heredoc.
- Run `git diff --cached` before every commit.
- Don't report elapsed time; the user asked for that.
