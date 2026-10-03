# Handoff

The current state of the build, for the next session. Claude rewrites this at every task boundary, then suggests a `/clear`. It holds the current state only; `git log` has the history.

**Updated:** 2026-10-02, after `fbaa422` (end of Task 3).

## Where we are

- **Done and pushed:** Task 1, Step 6; all of Task 2; all of Task 3.
- **The Desk has finished.** It isn't running in the background. Its log is `research/desk.log`. Results:
  - D, R and L: 15 proposed, 15 quote ok, 0 flagged each, all served by `claude-opus-5-5` at effort `high`.
  - Counter-type cards: D 6, R 4, L 4. The longest quote is 36 words; statements run 9–18 words.
  - Topic gaps: R has no Guns card. Each party covers at least 11 of the 12 topics.
- **The Desk's outputs are deliberately uncommitted.** `research/candidates.json`, `research/planks.draft.ts` and `research/desk.log` show as untracked, and the plan commits them in Task 5. Don't stage `research/` before then.
- **Waiting on the user:** nothing blocking. The user deferred the walkthrough of Task 3, Step 5 and said to keep going. The code went in as `fbaa422`, so they can review it there any time.
- **Next:** Task 4, Step 1: the fixture (`content/planks.fixture.ts`). Then Step 2, the failing dealer tests, a **[Claude → you check]** step.

## Decisions and departures from the plan

- **The Desk's retry.** SDK 0.131.0's `parse()` throws an `AnthropicError` when output is cut off at `max_tokens` or fails the schema. It doesn't return `parsed_output: null`. So `research-desk.ts` treats any non-API `AnthropicError` from `parse()` as unusable output and retries once at `medium`. An `APIError` fails the platform. `stop_reason` is still checked first whenever a response comes back.
- **The Desk's log order.** Each platform logs a `{party}: {model} at effort …, stop_reason …` line as its call finishes. The one-line summaries (`L: 15 proposed · …`) print only after all three settle, not with L first as the plan describes.
- **The Libertarian text** includes lp.org's footer menu, because it sits between the plan's two markers. It's harmless, so it's left as planned. Word counts: D 42,864 and R 5,374, both exact; L 3,418, against 3,446 expected.
- **Task 2 had no red run,** because the migration was applied before its tests existed.
- **The Vitest config is `vitest.config.mts`,** not `.ts`, so Vite loads it as ESM.

## Gotchas

- tsx runs `.ts` scripts as CommonJS, so no top-level `await`: wrap the script in `main()`.
- A commit message containing an apostrophe breaks the heredoc. Write the message to a file and use `git commit -F`.
- Run `git diff --cached` before every commit: a `git mv` stages itself.
- Don't report elapsed time; the user asked for that.
