<!-- Copied into the blind-ballot repo root as CLAUDE.md at 0:00 (plan, Task 1, Step 3). Prepared before the timer and disclosed. -->

# Blind Ballot: working rules for Claude Code

This is a timed, two-hour take-home build. The plan is `docs/plans/blind-ballot-plan.md`, and the spec is `docs/plans/blind-ballot-spec.md`. I have to explain every line in the follow-up interview, so small, plain diffs beat clever ones.

## How we work

- Do one plan step at a time. At every step tagged **[Claude → you check]**, stop and wait for my review before starting the next step.
- Write all code in this session; don't hand code-writing to subagents. Subagents are fine for read-only work: looking something up in the template or `node_modules` (use Haiku), or a fresh-eyes check of a **[Claude → you check]** diff against the Security rules before you show it to me.
- Work directly on `main`. No branches, no worktrees. The plan names superpowers:executing-plans: follow its stop-when-blocked rules, but do one step at a time instead of its batches of three, and skip its worktree and finishing-a-development-branch steps.
- Some pieces are mine. You may review them, or describe a change in prose, but don't edit them:
  - `lib/verdict.ts`;
  - `tests/verdict.test.ts`;
  - the three checks in `tests/db/rls.test.ts` (you set up the clients);
  - `content/loaded-words.ts`;
  - `content/planks.ts`, once I've copied it in;
  - `scripts/prompts/desk.md`;
  - all user-facing words on the landing page and `/how-it-works`, and the README's personal sections.
- If something in the plan doesn't match what you find in the code, stop and say so rather than improvising.

## Saving work (commit and push)

Every time the plan says **Commit**, and after any other change that stands on its own:

1. Run `npx tsc --noEmit`, plus `npm test` once the test script exists. If anything fails, fix it first. Never commit or push broken work. Vercel type-checks the tests and scripts too, so one type error blocks the deploy.
2. Use the `/git-commit` skill to write the message. It suggests a few; pick the best one yourself. The plan's **Commit** lines are good starting points.
3. Stage only this change's files. Never stage `.env*` (except `.env.example`) or `.cache/`.
4. Commit, then `git push`. Vercel redeploys on every push. Tell me the message and that it's pushed.

On a **[Claude → you check]** step, commit only after I say it looks good. If a push fails, stop and tell me. Never force-push or rewrite history. Run `npm run test:db` whenever the migration changes.

## Security rules

The product's promises depend on these.

- Every table has narrowed privileges and row-level security. Never weaken a policy, a grant, a constraint or a database test to make a test pass. If a security test fails, report why.
- A card's party is reachable only through `lib/deck.ts`, which is `server-only`.
  - Import `content/planks*` only from `lib/deck.ts`, `scripts/` and `tests/`.
  - Never pass a full plank to a client component; use `toCard()`, which gives `{id, statement, topic}`.
  - Results use revealed rounds only.
- In server actions, identify the user with `supabase.auth.getUser()` before any write with the secret key. Never rely on `getSession()` on the server, and never take a user ID from the browser.
- Never commit `.env*` (except `.env.example`), `.cache/`, or keys. The Anthropic key lives in `.env.local` and is used only by `scripts/`.

## Next.js and Supabase traps

- `params`, `searchParams` and `cookies()` are async, so await them.
- `redirect()` and `notFound()` work by throwing, so call them outside any `try`/`catch`.
- The template's route guard is `lib/supabase/proxy.ts`, called from the root `proxy.ts`. Keep its comment-marked cookie handling intact.

## Claude API rules (scripts only)

The live app never calls Claude. Use the claude-api skill when writing `scripts/`.

- Use `client.beta.messages.parse` with `betaZodOutputFormat` from `@anthropic-ai/sdk/helpers/beta/zod`.
- Send `betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"` and `output_config.effort`.
- Check `stop_reason` before reading `parsed_output`.
- Keep `max_tokens` at 20,000 or less for non-streaming calls.
- Opus 5.5 rejects `temperature`, `top_p`, `top_k` and `budget_tokens`. Don't send them.
- A card's party always comes from its source platform, never from Claude.
