<!-- Copied into the blind-ballot repo root as CLAUDE.md at the start of the build (plan, Task 1, Step 3). Prepared in advance and disclosed. -->

# Blind Ballot: working rules for Claude Code

The plan is `docs/plans/blind-ballot-plan.md`, and the spec is `docs/plans/blind-ballot-spec.md`. I have to be able to explain every line, so small, plain diffs beat clever ones.

## How we work

- Do one plan step at a time. At every step tagged **[Claude → you check]**, stop and wait for my review before starting the next step.
- Write all code in this session; don't hand code-writing to subagents. Subagents are fine for read-only work: looking something up in the template or `node_modules` (use Haiku), or a fresh-eyes check of a **[Claude → you check]** diff against the Security rules before you show it to me.
- Work directly on `main`. No branches, no worktrees. The plan names superpowers:executing-plans: follow its stop-when-blocked rules, but do one step at a time instead of its batches of three, and skip its worktree and finishing-a-development-branch steps.
- You implement everything: code, tests, the deck and its prompts, and the copy. My part is review. I review at every **[Claude → you check]** step and do the final review at the end. Steps still tagged **[You]** are actions only I can take, such as running SQL in the Supabase editor, changing dashboard settings, and the manual checks on prod.
- If something in the plan doesn't match what you find in the code, stop and say so rather than improvising.

## Judgment calls

`docs/plans/judgment-calls.md` is a running log of the calls that are mine to make.

- **Add an entry under Open** whenever a choice would change the spec, the plan, the security model, the deck's wording rules or the copy, or whenever the plan and the code disagree. Give the options and your recommendation.
- **At every stop for my review,** point me to any new Open entries.
- **When I decide,** move the entry to Decided, with the date, my decision and the commit that carries it out.
- Unlike the handoff, this file keeps its history: it's the record of my decisions.

## Test-driven and domain-driven development

**Test-driven.** Every piece of logic starts with a failing test.

1. Write the test from the plan's cases or the spec.
2. Run it, and confirm it fails for the expected reason: the function is missing or the answer is wrong, not a typo or a setup error.
3. Write the least code that makes it pass, and rerun it.
4. Refactor only while the tests stay green.

At a **[Claude → you check]** step, show me the red run as well as the green one. If a test goes green before its code exists, say so: the test isn't testing anything yet. Never edit a test just to make it pass. If a test turns out to be wrong, say why before changing it.

**Domain-driven.** The game's rules live in a pure domain core, and everything else sits around it.

- **Use the spec's words everywhere,** in code, tests, the database and the UI: deck, plank, card, party, stated party, topic, counter-type, round, half, deal, seed, answer, vote, guess, reveal, lean, verdict (clear, leaning, too close), projection, guess skill, most revealing card, candidate, quote check, leak check, sureness. Don't invent synonyms. A *plank* is the full record, with its party. A *card* is what the player sees: `toCard()`.
- **The domain core is pure:** no I/O, and no imports from `next`, `react`, `@supabase/*`, `@anthropic-ai/*`, `node:fs`, `app/` or `lib/supabase/`. It's the place for the dealer, the verdict, the share line, the quote check, text extraction from HTML, the route rules, the schemas and the topics. Each module is tested directly.
- **Everything else stays thin:** pages, server actions, the Supabase clients and the scripts' file and network calls. They load data, call the domain, and save or render the result. When a page or action needs a decision, such as where to send the player next, put that decision in a pure domain function and test it.
- **Two bounded contexts,** joined at one gate:
  - **Deck authoring:** `scripts/`, `content/`, `research/` and `evals/`.
  - **Play:** rounds, answers, the reveal and results.
  - **The gate:** `lib/deck.ts` is the only place Play reads the deck.
- **Aggregates guard their invariants:**
  - **A round** owns its answers. The database enforces its rules: 12 cards, one answer per card, insert-only answers, and a reveal only once every card is answered.
  - **The deck's** rules (promise 4) are enforced by the deck tests.

## Context: handoff and clear at task boundaries

A long session piles up tool output and dead ends, and auto-compact keeps only a summary of the conversation. So we reset at task boundaries instead, starting from a note we wrote on purpose, plus the repo.

- **At the start of every session,** before anything else, read `docs/plans/handoff.md` and `git log --oneline -10`.
- **At the end of every task,** after its last commit:
  1. Rewrite `docs/plans/handoff.md`: where we are, what's next, what's waiting on me (including the Open entries in `docs/plans/judgment-calls.md`), any decisions or departures from the plan that aren't recorded elsewhere, and gotchas. It holds the current state only; git has the history.
  2. Commit it, and push.
  3. Tell me it's a good place to `/clear`, and give me the resume line: `Resume Blind Ballot: read CLAUDE.md and docs/plans/handoff.md.`
- **Mid-task,** if I ask to clear, do the same, and say which step is half-done and what's uncommitted.
- Auto-compact stays on as the safety net.

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
