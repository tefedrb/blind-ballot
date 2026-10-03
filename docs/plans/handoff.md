# Handoff

The current state of the build, for the next session. Claude rewrites this at every task boundary, then suggests a `/clear`. It holds the current state only; `git log` has the history.

**Updated:** 2026-10-02, after `a9d1d23` (Task 3, Step 4), before a mid-task `/clear`.

## Where we are

- **Done and pushed:** Task 1, Step 6; all of Task 2; Task 3, Steps 1–4.
- **In progress:** Task 3, Step 5, the Desk. It's a **[Claude → you check]** step. The code is written and the tests pass, but nothing is committed:
  - `scripts/lib/candidates.ts` and `tests/candidates.test.ts` (red, then green, 7 of 7);
  - `scripts/prompts/desk.md` and `scripts/research-desk.ts`;
  - `scripts/lib/platforms.ts`, which gains a `name` for each platform.
- **Waiting on the user:** the review of Step 5. Once approved, commit `feat(desk): add research desk script, prompt and card checks`, and push.
- **Next:** Task 3, Step 6: run the Desk in the background. It makes 3 API calls and costs about $1–3, so ask before running it.

## Decisions and departures from the plan

- **The Desk's retry.** SDK 0.131.0's `parse()` throws an `AnthropicError` when output is cut off at `max_tokens` or fails the schema. It doesn't return `parsed_output: null`. So `research-desk.ts` treats any non-API `AnthropicError` from `parse()` as unusable output and retries once at `medium`. An `APIError` fails the platform. `stop_reason` is still checked first whenever a response comes back.
- **The Libertarian text** includes lp.org's footer menu, because it sits between the plan's two markers. It's harmless, so it's left as planned. Word counts: D 42,864 and R 5,374, both exact; L 3,418, against 3,446 expected.
- **Task 2 had no red run,** because the migration was applied before its tests existed.
- **The Vitest config is `vitest.config.mts`,** not `.ts`, so Vite loads it as ESM.

## Gotchas

- tsx runs `.ts` scripts as CommonJS, so no top-level `await`: wrap the script in `main()`.
- A commit message containing an apostrophe breaks the heredoc. Write the message to a file and use `git commit -F`.
- Run `git diff --cached` before every commit: a `git mv` stages itself.
- Don't report elapsed time; the user asked for that.
