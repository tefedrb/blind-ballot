# Handoff

The current state of the build, for the next session. Claude rewrites this at every task boundary, then suggests a `/clear`. It holds the current state only; `git log` has the history.

**Updated:** 2026-10-03, after `bfdcffe` (Task 8, Step 3 waiting on the user).

## Where we are

- **Done and pushed:**
  - Tasks 1 to 7, and Task 8's Steps 1 and 2.
  - Two of the three deferred reviews: the Desk code (`fbaa422`, with a fix in `9921b31`) and the leak-check text (`501bf68`).
  - README "What I'd build next", regrouped with the user's new directions (`a554328`).
  - `npm test` passes 147 tests. `npm run test:db` passed all 6 database checks on 2026-10-03, and the migration hasn't changed since.
- **Uncommitted: README §7's leak-check paragraphs, simplified.** Claude rewrote them at the user's request and showed them; the user hasn't said OK yet.
  - The rewrite explains the two versions of each card first, defines "cues" once, gives the table as counts ("24 of 24", "21 of 24") instead of percentages, and calls the drop "the difference": 3 cards.
  - On OK: commit `docs(readme): simplify the leak-check paragraphs` and push. If the user doesn't want it: `git checkout -- README.md`.
- **Next: Task 8, Step 3,** the application note. It's final, and the disclosure wording is decided (`judgment-calls.md`, "What the disclosure claims"). The user sends it. Then close Task 8 here.
- **After Task 8:**
  - the last deferred review: the 21 flagged cards, wording or policy, and any rewrites;
  - the plan's "After submission": keep Supabase awake, and rehearse;
  - a refine pass the user plans for later, including the Desk, and `evals/leak-report.md` rounding 87.5% to 88% and the 12.5-point drop to 13.
- **Waiting on the user:**
  - OK on the README §7 rewrite;
  - sending the note;
  - the 21 flagged cards;
  - **six Open entries in `docs/plans/judgment-calls.md`:**
    - the plain-sounding loaded words;
    - "freedom", "liberty" and "democracy";
    - the landing "why" in the user's own voice;
    - the `next dev` block in `CLAUDE.md`;
    - adding `next build` to the pre-push checks;
    - which answers decide an Independent's "party they guessed most".

## Decisions and departures from the plan

The calls the user made are in `docs/plans/judgment-calls.md`. These are Claude's implementation choices.

**The deferred reviews (after Task 8, Step 2):**

- **The Desk's `--party` fix:** `partiesToRun(args)` in `scripts/lib/platforms.ts`, tested in `tests/platforms.test.ts`. With no `--party`, it runs all three platforms. A `--party` must be followed by D, R or L, or it throws "--party needs D, R or L" before the Desk reads a platform or builds a client.
- **No code checks a card's section heading.** The 24 cards' headings were checked by hand on 2026-10-03.
- **The leak-check run's console output** is in `.cache/leak-check.log`. It shows no retry warnings, but retries print to stderr, and it's unclear whether the log captured stderr. So the README doesn't claim "no retries".

**The README and the docs (Task 8):**

- **The docs lead with the user's judgment, not the brief.** The README, `CLAUDE.md`, `judgment-calls.md`, the handoff and code comments talk about the product and the user's reasons, never the brief's process or how fast the build went. The spec and the plan stay as they were. Commit messages follow the same rule, since the repo is public.
- **README "Calls I made"** lists seven design decisions with their reasons, and points to `judgment-calls.md`.
- **README "What I'd build next"** has four groups: new cards, more to learn from each card, comparing with other players, and labels and spin. The four calls behind it are in `judgment-calls.md`, "What I'd build next".
- **README §§1, 6 and 8** were filled too, though the plan's Step 2 names only §§3, 4, 9 and 10.
- **`CLAUDE.md` was committed without the `next dev` block:** the index got `HEAD` plus the edits, through `git hash-object -w` and `git update-index --cacheinfo`.

**The leak check (Task 7):**

- **`summarize(runs)`** (`scripts/lib/leak-summary.ts`) takes one `CardRuns` per card: `{ plankId, party, neutral, original }`, where each version holds 5 `LeakAnswer`s.
  - It returns `{ cards, neutral, original, drop, flagged }`.
  - Each version's result is `{ majority, sureness, correct, cues }`. On a tie, `majority` is null and sureness is still the top count over 5 (0.4 for a 2–2–1 split).
  - The cues come from the runs that named the majority party, with duplicates removed.
  - `flagged` holds plank IDs. It uses the neutral version only: correct, with sureness ≥ 0.8.
- **`LeakAnswerSchema`** (`{ party, cues[] }`) is in `content/schema.ts`, next to `CandidatesSchema`.
- **The script:** 8 calls at a time, through a small `pool()`; one retry at effort `low` when the output is unusable; a refusal or a second failure stops the run, and nothing is written. It reports token totals and the cost at Opus 5.5's list prices, $4 in and $20 out per million. Retried attempts aren't counted, and the cost arithmetic is untested.
- **The prompt** tells Claude to leave `cues` empty when only the policy gave the party away. Claude mostly ignored that and restated the policy.
- **`/how-it-works` names no cards,** so the page spoils no party. The README names card-03, card-06 and card-19, and uses "repeal the federal income tax" as its example.

**The verdict and results (Task 6):**

- **`lib/verdict.ts`'s API:**
  - The input is a `RevealedAnswer`: `{ plankId, vote, guess, party }`.
  - `lean()` returns `{ verdict: "clear" | "leaning", leader }` or `{ verdict: "too_close", reason: "tie" | "all_unsure" }`.
  - `guessSkill(right, total)` returns the p-value. The leak check imports it.
  - `projection()` and `mostRevealing()` take `(answers, statedParty)`. Both use a private `measuredParty()`.
  - `supportCounts()` is public, for the three bars.
- **`resultsFor(answers, planks, statedParty, dealt)` takes a fourth input,** `dealt`: this round's plank IDs, in deal order. `answers` holds every revealed answer, which the verdict and the findings count together. The card-by-card rows and the most revealing card come from `dealt`.
- **The results page** loads its data with `getRevealedAnswers()` (`lib/player.ts`), which reads revealed rounds only. It treats a missing stated party as `"none"`, and reads `is_anonymous` from `getClaims()` to decide whether to show "Save results". "Share" is the only client component (`share-button.tsx`), and it gets only the finished line.
- **The share line:** "Blind Ballot · guessed 8/12 · blind lean: leaning Libertarian · {home URL}". The home URL comes from `VERCEL_PROJECT_PRODUCTION_URL`, and falls back to `http://localhost:3000/`.
- **Save:** `SaveSchema` (`lib/save.ts`) carries the error messages. The form uses `useActionState`.
- **Sign in and out** call `router.refresh()` after `router.push("/")`, because Next's layouts don't re-render on navigation.
- **Copy and leftovers:** the login form says "Sign in". `components/theme-switcher.tsx` is unused but stays, since the plan didn't list it for deletion.
- **`/how-it-works` hard-codes the source links,** copied from `scripts/lib/platforms.ts`, so Play doesn't import the Desk.

**Carried over from earlier tasks:**

- **Pages that read the session export `instant = false`.** Next 16 has Cache Components on, so a page that reads cookies outside `<Suspense>` fails `next build`. The header's `AuthButton` sits inside `<Suspense>` in `app/layout.tsx`.
- **Where things live:** the `Card` type is in `content/schema.ts`; the button names are in `lib/labels.ts`; `getRound(id)`, `getPlayerState()` and `getRevealedAnswers()` are in `lib/player.ts`; `nextStep()` and `nextCard()` are in `lib/next-step.ts`.
- **`startRound` must be bound:** `startRound.bind(null, party)` or `startRound.bind(null, undefined)`.
- **Redirects between the round pages:** the reveal page sends the player back to the round while cards are unanswered, and on to the results once revealed. The results page gives a 404 for a foreign round and redirects to the round if it isn't revealed.
- **The deck tests** (`tests/deck.test.ts`) collect the cards that break each rule and expect `[]`. The limits are literals from the spec, and word counts use `countWords` from `scripts/lib/extract.ts`.
- **`content/planks.ts` was generated** by a one-off script, since deleted. Each card has a `// Desk:` comment with its original ID.
- **The fixture is still used** by the dealer and results tests. Its IDs are `card-01` to `card-24`, like the real deck's.
- **SDK 0.131.0's `parse()` throws an `AnthropicError`** when output is cut off or fails the schema. Both scripts retry once at a lower effort on any non-API `AnthropicError`.
- **SDK 0.131.0's schema transform** sends a string `enum` as a hint in the description, not a constraint. Zod checks the value inside `parse()`.
- **The Libertarian text** includes lp.org's footer menu.
- **Task 2 had no red run,** and the Vitest config is `vitest.config.mts`.

## Gotchas

- **To run a script that calls Claude without reaching Anthropic,** run `npx tsx` without `--env-file`, and set `ANTHROPIC_BASE_URL` to a small local mock server in `.cache/` (for a dry run), or to `http://127.0.0.1:9` (to check that it stops before any call). Delete the mock and any output afterwards.
- **The repo has no Prettier.** `npx prettier` formats at 80 columns, but the code here is written to 100. If you use it, pass `--print-width 100`.
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
- Run `git diff --cached` before every commit, and stage files by name: `README.md` has an uncommitted change waiting for the user's OK.
- Don't report elapsed time; the user asked for that.
