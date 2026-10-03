---
title: Casper take-home — Blind Ballot implementation plan
type: working-doc
identity: Task-by-task build plan for the 2-hour Blind Ballot take-home. For each slot of the approved schedule it gives the files, behaviour, test cases, commands and commit points. By the timebox rule, it contains no code.
date: 2026-10-02
status: approved 2026-09-30; revised 2026-10-02 after the pre-flight review and again after the kickoff review; ready to build — the build hasn't started
---

# Blind Ballot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Work directly on `main`, one step at a time: no branches, no worktrees, and no finishing-a-development-branch step. Build test-first, with the game's rules in a pure domain core: see "Test-driven and domain-driven" below. At every task boundary, update `docs/plans/handoff.md` and suggest a `/clear`. The repo's `CLAUDE.md` has the details.

**Goal:** Build and deploy Blind Ballot v1 in 2 hours. Users support or oppose party-platform promises with the labels removed, guess each one's party, and get an honest verdict. There are two rounds of 12 cards, one for each half of a 24-card deck.

**Architecture:** Next.js App Router on Vercel, with Supabase Auth (anonymous plus email) and Postgres.

- The deck lives in code. Rounds and answers live in Postgres, behind narrowed privileges and row-level security.
- The database guards the answers, and server code guards the party labels.
- Two local scripts use Claude: the Research Desk drafts the deck, and the leak check tests it. The live app never calls Claude.
- The repo's `CLAUDE.md` holds the working rules for Claude Code.

**Tech stack:**

- TypeScript.
- Next.js: the `with-supabase` template pins `latest`, which uses the `proxy.ts` convention.
- Supabase (`@supabase/ssr` and `@supabase/supabase-js`).
- Zod 4, Vitest, fast-check and tsx.
- cheerio, in the scripts only.
- `@anthropic-ai/sdk`, in the scripts only, with the model `claude-opus-5-5`. The call shape was verified against 0.131.0.

**Spec:** [`spec.md`](spec.md). Section names below refer to it.

**How this plan departs from the skill's default:** the writing-plans skill puts complete code in the plan. The Casper timebox rule says code and shipped copy are written inside the 2 hours. So each step here specifies behaviour, test cases, commands and expected output precisely enough to write quickly, but no step contains the code.

**Revisions:**

- **2026-09-30:**
  - The four plan changes:
    1. the dealer splits the deck into two valid halves, with a topic cap of 2 per round;
    2. the placeholder deck is 24 generated fake cards;
    3. the deck is plain data behind a `server-only` gate;
    4. both scripts use `claude-opus-5-5` with the refusal fallback on.
  - The eleven auth and deployment fixes.
- **2026-10-02:** the pre-flight review. Spec, "Revision 2026-10-02", gives the evidence for each change.
  - **Product and logic:**
    - Reveal-as-you-go is cut.
    - There are two rounds and no third.
    - The dealer shuffles each half's order at the end.
    - Answers are bound to the caller's `user_id`, and privileges are narrowed.
    - The leak check is reframed.
    - No flow depends on email.
  - **Sources:** the raw pages are cached before the timer, and the scripts fetch with browser headers.
  - **The Claude call:** the shape is now verified, with `max_tokens` capped at 20,000.
  - **Scheduling:**
    - The deck tests and the bare results page move into Claude's idle time in Task 5.
    - The loaded-word list and the landing words move into Task 4.
    - The cut list gets clock checks.
  - **New file:** the repo's `CLAUDE.md`.
- **2026-10-02, during the build:**
  - **Claude Code implements everything:** the code, the tests, the deck, the prompts and the copy. I review at every **[Claude → you check]** step and do the final review at the end. **[You]** now marks only what Claude Code can't do: the Supabase SQL editor, dashboard settings, and the manual checks on prod.
  - **Test-driven and domain-driven development are explicit:**
    - every step that adds logic starts with a failing test;
    - decisions move out of pages, actions and scripts into a pure domain core;
    - a new test keeps the core free of I/O.
  - Task 2's migration was written before its database checks, so that step had no red run.
  - **Handoff and clear at task boundaries:** at the end of each task, Claude rewrites `docs/plans/handoff.md`, commits it, and suggests a `/clear`. The next session starts from the handoff and the repo, not from a compacted summary.

---

## Who does what

Claude Code implements everything, and your job is review. This changed during the build (see Revisions). Every step below carries one of three tags:

- **[You]:** something only you can do: run SQL in the Supabase editor, change a dashboard setting, make a cut call, or try the app by hand on prod.
- **[Claude → you check]:** Claude Code builds it, then stops. You read every line, see the red and green test runs, and can explain it before Claude commits.
- **[Claude]:** plumbing. Skim the diff.

| Yours | Why it's yours |
| --- | --- |
| Every **[Claude → you check]** review, including the 24 cards Claude picks and the copy Claude drafts | You have to explain every line in the interview |
| The final review at the end of the build | You own what's submitted |
| Applying the migration, and the Supabase and Vercel settings | Claude Code can't reach them |
| Every cut call, every manual check, and the smoke test | You own the scope |

**Disclosure follows from this:** the README and the Ashby note say that Claude Code wrote the code, the deck and the copy, and that you reviewed and approved each piece.

## Test-driven and domain-driven

**Test-driven.** Every step that adds logic runs red, then green, then refactor:

1. Write the failing test from the step's cases.
2. Run it, and check that it fails for the expected reason.
3. Write the least code that passes, and rerun it.
4. Refactor with the tests green.

At a **[Claude → you check]** step, show both runs. Pages and server actions hold no logic worth testing on its own. Their decisions move into the domain core, where they're tested first.

**Domain-driven.** Use the spec's words everywhere: deck, plank, card, party, stated party, topic, counter-type, round, half, deal, seed, answer, vote, guess, reveal, lean, verdict, projection, guess skill, most revealing card, candidate, quote check, leak check and sureness. A *plank* is the full record, with its party. A *card* is what the player sees.

| Layer | What's in it | Rule |
| --- | --- | --- |
| Domain core | `content/schema.ts`, `content/topics.ts`, `lib/prng.ts`, `lib/dealer.ts`, `lib/verdict.ts`, `lib/results.ts`, `lib/share.ts`, `lib/save.ts`, `lib/routes.ts`, `lib/next-step.ts`, `scripts/lib/quote-check.ts`, `scripts/lib/extract.ts`, `scripts/lib/candidates.ts`, `scripts/lib/leak-summary.ts` | Pure. No I/O, and no imports from `next`, `react`, `@supabase/*`, `@anthropic-ai/*`, `node:fs`, `app/` or `lib/supabase/`. `tests/domain-imports.test.ts` enforces this |
| The gate | `lib/deck.ts` | The only way Play reaches the deck. It's `server-only`, and the browser gets only `toCard()` |
| Application | `app/actions.ts`, `lib/player.ts`, and the scripts' top-level files | Thin: load, call the domain, then save or redirect |
| Infrastructure | `lib/supabase/*`, `supabase/migrations/`, and the file and network calls in `scripts/lib/sources.ts` | The database enforces the round's rules |
| Presentation | `app/**` pages and components | Render what the application layer hands over |

There are two bounded contexts. **Deck authoring** is the scripts, `content/`, `research/` and `evals/`. **Play** is rounds, answers, the reveal and results. `lib/deck.ts` is where they meet.

## Guardrails for the whole build

- **Timebox:** the clock starts at Task 1. Stop at 2:00 and submit as-is. When behind, follow "If behind" near the end.
- **Explain-back:** read every diff before committing. If a line can't be explained, rewrite it or cut it.
- **Voice:** Claude drafts the landing pitch, the "why" and the README's personal sections from the spec, in its plain register. I review and edit them at their check steps.
- **Security:** privileges and RLS go on every table in the first migration. Never commit `.env*` (except `.env.example`), keys or `.cache/`.
- **`CLAUDE.md`:** the repo's `CLAUDE.md`, copied from [`repo-CLAUDE.md`](repo-CLAUDE.md) at Task 1, Step 3, holds these rules for Claude Code. It loads into every session and survives a restart.
- **Before every push:** run `npx tsc --noEmit && npm test` (`npm test` from Task 2 on, once its script exists).
  - `npm test` runs the unit and deck tests. The database tests run with `npm run test:db`.
  - Vercel's build type-checks the tests and scripts too, so one type error blocks the deploy.
- **Schema changes mid-build:** edit `supabase/migrations/0001_init.sql` first, then re-run only the changed statements in the SQL editor. The repo must match the live database at submission.
- **A bad push late in the build:** use Vercel's Instant Rollback to the last good deployment. Don't debug against the clock.
- **Context: handoff and clear at task boundaries.** A long session piles up tool output, and auto-compact keeps only a summary of the conversation. So at the end of each task, after its last commit, Claude rewrites `docs/plans/handoff.md`, commits and pushes it, and suggests a `/clear`. To resume, type: `Resume Blind Ballot: read CLAUDE.md and docs/plans/handoff.md.` Auto-compact stays on as the safety net. The repo's `CLAUDE.md`, "Context", has the full rule.
- **Judgment calls:** [`judgment-calls.md`](judgment-calls.md) logs every call that's mine to make, with Claude's options and recommendation, and what I decided. Claude points me to new entries at each check step, and the handoff lists the open ones. The repo's `CLAUDE.md`, "Judgment calls", has the full rule.
- **Commits:** commit at every step marked **Commit** and after any other change that stands on its own, and push after each commit so Vercel redeploys. The repo's `CLAUDE.md`, "Saving work", has the full rule.
- **Traps to check in every diff:**
  - `redirect()` and `notFound()` throw, so they go outside any `try`/`catch`.
  - `params`, `searchParams` and `cookies()` are async, so await them.
  - A full plank object is never passed to a client component; use `toCard()`.
  - Before any write with the secret key, the user is identified with `getUser()`. Never `getSession()`, and never an ID from the browser.
  - No policy, grant or security test is loosened to make a test pass.
  - Claude calls never send `temperature`, `top_p` or `top_k`, because Opus 5.5 rejects them.
- **Skills:**
  - @superpowers:test-driven-development for every step that adds logic (see "Test-driven and domain-driven");
  - @superpowers:verification-before-completion before calling any task done;
  - @claude-api when writing the two scripts.

## Pre-flight (before the timer; no code)

**Status on 2026-10-02.** Items 1–6 are done. The kickoff review (2026-10-02) finished [`kickoff-plan.md`](kickoff-plan.md) and `repo-CLAUDE.md`.

- **Still to do:**
  - items 7–9.
- **Then:** start the clock with Prompt 1 in [`kickoff-plan.md`](kickoff-plan.md).

1. **Accounts:** log in to GitHub, Vercel and Supabase.
   - **Done 2026-10-02:** `gh` is logged in as `tefedrb`, and the Supabase CLI is logged in.
   - Neither `~/Documents/github/blind-ballot` nor `tefedrb/blind-ballot` exists yet, so Task 1 won't collide.
   - **Done 2026-10-02:** logged in to Vercel on the web.
2. **Supabase slot:** the free plan allows 2 active projects.
   - **Done 2026-10-02:** one is active (`jfakqhqpzhcsexzcbnvd`, us-west-2), and one is already paused (`nkpqouohkobhqlgrlbmq`, us-east-1). A slot is free; nothing to pause.
3. **Anthropic key:** create one in the Console.
   - **Settings:**
     - **Linked account:** yourself, which makes it a personal key.
     - **Scope:** a single workspace, not the whole organization. An organization-wide key needs an `anthropic-workspace-id` header on every request, and the check below and the scripts don't send one. It can also call the Admin API as you.
     - **Which workspace:** the Default Workspace is fine. With prepaid credits and auto-reload off, the balance is the spending cap. The Default Workspace can't have its own spend or rate limits anyway.
     - **Expiration:** 30 days, so the key outlasts the interview.
   - **Credits:** the API is prepaid and billed apart from the Claude subscription. With a zero balance, every call fails.
     - Buy about $25 under Settings → Billing, with auto-reload off.
     - Rough estimate: the Desk costs $1–3, and each leak-check run (240 calls) costs $5–10.
   - **Rate limits:** after buying, open Settings → Limits. New organizations can start on an Evaluation tier with limits below the standard ones.
     - Claude Opus 5.5's input tokens per minute must be well above about 60K. That's the Democratic platform in one Desk call.
     - If it's lower, request an increase now, before the timer.
   - **Keep it out of Claude Code's shell.** Don't export it in the shell that will run Claude Code, and don't use `ant auth login`. Claude Code offers to use an exported key in place of my subscription, and an `ant` profile can trigger an auth-conflict prompt.
   - **Check it once from a separate terminal,** then close that terminal.
     1. Run `read -rs ANTHROPIC_API_KEY`, paste the key, and press Enter. Nothing echoes.
     2. Run the request below. It sends the exact headers and body shape the scripts will send.

     ```
     curl -s "https://api.anthropic.com/v1/messages?beta=true" \
       -H "x-api-key: $ANTHROPIC_API_KEY" \
       -H "anthropic-version: 2023-06-01" \
       -H "anthropic-beta: server-side-fallback-2026-07-01,structured-outputs-2025-12-15" \
       -H "content-type: application/json" \
       -d '{"model":"claude-opus-5-5","max_tokens":2000,"fallbacks":"default","output_config":{"effort":"low","format":{"type":"json_schema","schema":{"type":"object","properties":{"ok":{"type":"boolean"}},"required":["ok"],"additionalProperties":false}}},"messages":[{"role":"user","content":"Reply with ok set to true."}]}'
     ```

     Expected: `"stop_reason":"end_turn"` and a text block `{"ok":true}`. It costs under a cent.
   - **Done 2026-10-02:** credits are added, and the check returned `end_turn` with `{"ok":true}` (206 input tokens, 9 output, standard tier).
   - The key goes into `.env.local` at Task 1, Step 3.
4. **Node:** `node --version` prints v22.x. Checked 2026-10-02: v22.20.0, npm 11.12.1.
5. **Raw platform pages:** save the three pages before the timer. lp.org blocks bare scripted requests, and the cache removes the network from the timed build.

   ```
   mkdir -p ~/Documents/github/blind-ballot-sources && cd ~/Documents/github/blind-ballot-sources
   UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
   curl -sSL -A "$UA" -H "Accept: text/html" -H "Accept-Language: en-US,en;q=0.9" -o D.html https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform
   curl -sSL -A "$UA" -H "Accept: text/html" -H "Accept-Language: en-US,en;q=0.9" -o R.html https://www.presidency.ucsb.edu/documents/2024-republican-party-platform
   curl -sSL -A "$UA" -H "Accept: text/html" -H "Accept-Language: en-US,en;q=0.9" -o L.html https://lp.org/platform/
   grep -l "you have been blocked" *.html; ls -l *.html
   ```

   Expected: `grep` prints nothing, and the sizes are about 350 KB (D), 98 KB (R) and 268 KB (L). If lp.org blocks anyway, open https://lp.org/platform/ in a browser and save it as "Webpage, HTML Only" to `L.html`.
   - **Done 2026-10-02:** these exact commands saved D (352,957 bytes), R (98,497) and L (268,614), none of them blocked.
   - The planned extraction gives 42,864, 5,374 and 3,446 words.
6. **Claude Code:**
   - Open it once in `~/Documents/github/` and confirm there's no auth prompt.
     - **Done 2026-10-02:** `ANTHROPIC_API_KEY` isn't set and `ant` isn't installed, so nothing competes with the subscription login.
   - Choose the permission mode for the build, either auto mode or allowing `npm`, `npx`, `git` and `gh`, so the timer isn't spent approving test runs.
     - **Done 2026-10-02:** `defaultMode` is `auto` in `~/.claude/settings.json`.
7. **Documents:** have this plan, the spec and `repo-CLAUDE.md` open.
8. **Make the spec yours:** edit `spec.md` wherever you'd decide differently. Start with its "Revision 2026-10-02" section. **[You]**
9. **Teach-back:** explain each promise and the data model without notes, and pass the quiz. **[You]**

**Already verified on 2026-10-02 (no action):**

- **The template:** its layout, `proxy.ts`, the login form, the env variable names and `.gitignore`.
- **The Claude call shape:** type-checked and run offline against SDK 0.131.0. Item 3 checks that the server accepts it.
- **Supabase's guest-to-email upgrade:** read in the Auth server's source.
- **The sources:** access, extraction and the three counter-type quotes.
- **The statistics:** every number in the test tables.

---

## Task 1: Scaffold and deploy (0:00–0:10)

**Files:** the template's files, plus:

- `CLAUDE.md`;
- `.cache/sources/`, which is never committed;
- `README.md`, as a skeleton;
- `docs/plans/blind-ballot-plan.md` and `docs/plans/blind-ballot-spec.md`, copies of this plan and the spec, as disclosed pre-planning.

**How it starts:** Prompt 1 in [`kickoff-plan.md`](kickoff-plan.md) has Claude do the mechanical parts, then hold:

- Step 1, the scaffold, plus Task 2, Step 1's installs;
- Step 3's file copies and `.gitignore` line, with `.env.local` created but left blank;
- Step 4's local commit, without pushing;
- Step 6's `.env.example` lines and the plan and spec copies.

During the hold, the rest of Steps 2–5 are yours: the Supabase settings, the keys, `gh repo create`, and Vercel. Prompt 2 starts at Step 6's README skeleton. Say in the disclosure that Claude ran the scaffold.

**Step 1: Scaffold.** **[You]**
Run: `cd ~/Documents/github && npx create-next-app@latest -e with-supabase blind-ballot && cd blind-ballot`
Expected: dependencies install, and `package.json` exists.

**Step 2: Supabase project.** **[You]** Create it in US East, next to Vercel's default region. Then, in Authentication settings:

- turn on anonymous sign-ins;
- turn off "Confirm email";
- leave "Secure password change" off (the default);
- raise the anonymous sign-in rate limit, so test runs and incognito checks can't lock you out.

Copy the project URL, the publishable key, and the secret key.

**Step 3: Local setup.** **[You]**

- Copy `.env.example` to `.env.local`. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and add `SUPABASE_SECRET_KEY` and `ANTHROPIC_API_KEY`.
- Copy in the working rules:
  `cp ~/Documents/notes-and-things/the-sewers/personal-wiki/blind-ballot/repo-CLAUDE.md CLAUDE.md`
- Copy in the saved pages:
  `mkdir -p .cache/sources && cp ~/Documents/github/blind-ballot-sources/*.html .cache/sources/`
- Add `.cache/` to `.gitignore` now, before the first commit. The template already ignores `.env*.local` and `.env`, and keeps `.env.example`.
- Run `npm run dev`, then open http://localhost:3000.
  Expected: the template's home page renders.
- Start Claude Code in this folder. `CLAUDE.md` is already in place.

**Step 4: Repository.** **[You]**
Run: `git add -A && git status --short`
Expected: neither `.env.local` nor anything under `.cache/` is listed.
Run: `git commit -m "chore: scaffold from with-supabase" && gh repo create blind-ballot --public --source=. --push`
Expected: the repo is on GitHub with one commit.

**Step 5: Deploy.** **[You]** Import the repo in Vercel and set the three Supabase environment variables. The Anthropic key never goes to Vercel. Deploy. Then, in Supabase's Authentication URL settings:

- set the Site URL to the Vercel URL;
- allow `http://localhost:3000/**` and `https://<your-vercel-domain>/**` as redirect URLs.

Expected: the Vercel URL serves the template, and its login page works.

**Step 6: README skeleton.** **[Claude]**

- Add the ten headings from the README outline, with the live link under the first.
- Add `SUPABASE_SECRET_KEY=` and `ANTHROPIC_API_KEY=` to `.env.example`, each with a one-line comment. The Anthropic key is for the scripts only.
- Copy this plan and the spec to `docs/plans/`.

**Commit:** `docs: README skeleton, build plan and spec`

---

## Task 2: Schema, privileges, RLS, the reveal function and the minimum database checks (0:10–0:20)

**Files:**

- Create: `supabase/migrations/0001_init.sql`, `vitest.config.mts`, `tests/empty.ts`, `tests/db/rls.test.ts`
- Modify: `package.json` (scripts), `tsconfig.json` (exclude)

**Step 1: Test tooling.** **[Claude]**
Run: `npm i zod server-only && npm i -D vitest fast-check tsx cheerio @anthropic-ai/sdk`

Add these scripts:

- `"test": "vitest run"`, which runs every test except `tests/db/`;
- `"test:db": "DB_TESTS=1 vitest run tests/db"`;
- `"desk": "tsx --env-file=.env.local scripts/research-desk.ts"`;
- `"leak-check": "tsx --env-file=.env.local scripts/leak-check.ts"`.

Set up `vitest.config.mts` to:

- use the `node` environment;
- alias `@` to the project root;
- alias `server-only` to `tests/empty.ts`, because the real package throws outside a React Server environment;
- load `.env.local` into `test.env` with Vite's `loadEnv`;
- exclude `tests/db/**` unless `DB_TESTS` is set;
- set `passWithNoTests: true`. Until Task 3 the only tests are in `tests/db/`, and Vitest exits with an error when it finds none, which would fail the commit check.

In `tsconfig.json`, add `research` and `evals` to `exclude`. Both hold generated output.

**Step 2: Write the failing database checks** **[Claude → you check]** (`tests/db/rls.test.ts`). The first three are the minimum. Checks 4 and 5 add two more of promise 1's attacks from the spec's test table.

- **The clients:**
  - one admin client, using the secret key;
  - two user clients, each its own supabase-js instance with `persistSession: false`, each signed in with `signInAnonymously()`.
- **The checks:**
  1. The admin creates a round for user A. User B selects from `rounds`.
     Expected: zero rows.
  2. The admin creates a round for A and stamps `revealed_at` directly. A inserts an answer for one of its cards.
     Expected: the insert is rejected.
  3. The admin creates a round for A with 12 card IDs.
     - A answers 11 cards and calls `reveal_round`. Expected: an error, `round_incomplete`.
     - A answers the 12th and calls it again. Expected: a timestamp.
     - A calls it a third time. Expected: the same timestamp.
  4. The admin creates a round for A. B inserts an answer into it, once with B's own `user_id` and once with A's.
     Expected: both inserts are rejected.
  5. A answers a card, then tries to update the vote and to delete the answer.
     Expected: neither changes anything, and the answer still holds the original vote.
- **Cleanup:** after all tests, the admin client deletes both test users with `auth.admin.deleteUser`. The cascades remove their rows.

Run: `npm run test:db`
Expected: FAIL, because the tables don't exist.

**Step 3: Write the migration** **[Claude → you check]** to match the Data model section. Claude annotates each grant, each policy and each step of `reveal_round`.

- **Tables:** `profiles`, `rounds` and `answers`, with the listed columns. `rounds` has no mode column.
- **Foreign keys:** every `user_id` references `auth.users` with `on delete cascade`, and `answers.round_id` references
  `rounds` with `on delete cascade`.
- **Constraints:**
  - checks on `stated_party`, `vote`, `guess`, and `cardinality(plank_ids) = 12`;
  - a unique `(round_id, plank_id)`;
  - a partial unique index that allows one unrevealed round per user.
- **Indexes** on `rounds.user_id` and `answers.user_id`.
- **Privileges:** revoke all on the three tables from `anon` and `authenticated`. Then grant `authenticated`:
  - select on `rounds`;
  - select and insert on `answers`;
  - select, insert and update on `profiles`.
- **RLS** enabled on all three tables, with policies written using `(select auth.uid())`:
  - `profiles`: select, insert and update the user's own row.
  - `rounds`: select own rows only.
  - `answers`: select own rows. Insert only when all of these hold:
    - `user_id` is the caller's;
    - the round is the caller's;
    - the card is in `plank_ids`;
    - `revealed_at` is null.
- **`reveal_round(rid uuid) returns timestamptz`:** `security definer`, `set search_path = ''`, with schema-qualified
  names. It works in this order:
  1. Lock the round's row (`for update`), so two calls at once get one stamp.
  2. If it isn't the caller's round, or there's no such round, raise `not_found`.
  3. If the round is already revealed, return the existing stamp.
  4. If there are fewer answers than cards, raise `round_incomplete`.
  5. Otherwise stamp and return `now()`.

  Revoke execute from `public` and `anon`, and grant it to `authenticated`.

**Step 4: Apply the migration.** **[You]** Paste the file into the Supabase SQL editor and run it.
Expected: "Success. No rows returned."

**Step 5: Run the checks.** **[Claude]**
Run: `npm run test:db`
Expected: 5 passed.

**Step 6: README §5 (running it locally).** **[Claude]** Cover:

- Node 22;
- copying `.env.example`;
- running the migration in the SQL editor;
- turning on anonymous sign-ins and turning off "Confirm email";
- `npm run dev`, `npm test` and `npm run test:db`.

**Commit:** `feat: schema, privileges, RLS and reveal_round with database checks`

---

## Task 3: Write the Research Desk script and start it (0:20–0:30)

**Files:**

- Create:
  - `content/topics.ts`, `content/schema.ts`, `tests/schema.test.ts`;
  - `scripts/lib/quote-check.ts`, `tests/quote-check.test.ts`;
  - `scripts/lib/extract.ts`, `tests/extract.test.ts`, `scripts/lib/sources.ts`;
  - `scripts/lib/candidates.ts`, `tests/candidates.test.ts`;
  - `scripts/prompts/desk.md`, `scripts/research-desk.ts`.
- Output at run time: `research/candidates.json`, `research/planks.draft.ts`, `research/desk.log`

**Step 1: Shared definitions.** **[Claude]**

- `content/topics.ts`: the 12 topics from the wording rules, as a readonly tuple.
- `content/schema.ts`: Zod schemas for:
  - `Party`: D, R or L;
  - `Topic`;
  - `Plank`: the fields in the Data model section, with `source` as `{ doc, section, url }`;
  - `Candidate`: statement, quote, section, topic, counterType and counterReason;
  - `Candidates`: an object with a `cards` array of `Candidate`, because structured output needs an object at the top level.

  The output schema keeps to plain strings, booleans and the topic enum, with no length limits. The word limits live in the prompt and the checks.

These two files are the domain's vocabulary, and everything else imports its types from them. Test first (`tests/schema.test.ts`): a valid plank parses, and an unknown party, an unknown topic or a source without a section is rejected.

**Step 2: Write the failing quote-check tests** **[Claude → you check]** (`tests/quote-check.test.ts`). `quoteFound(quote, sourceText)` normalizes
both sides, then looks for an exact substring. Normalizing means:

- Unicode NFKC, which also turns a non-breaking space into a space;
- curly quotes to straight;
- en and em dashes to hyphens;
- whitespace collapsed;
- lower case.

| Quote | Source contains | Expected |
| --- | --- | --- |
| `don't cut` | `don’t cut` (curly apostrophe) | true |
| `no cuts,  including` | `no cuts,\nincluding` | true |
| `NO CUTS` | `no cuts` | true |
| `2024-2025` | `2024–2025` (en dash) | true |
| `no cuts` | `no` + non-breaking space + `cuts` | true |
| `protect retirement` | `protect Social Security` | false |
| `border … judges` (contains an ellipsis) | anything | false: a quote must be one contiguous passage |

Run: `npx vitest run tests/quote-check.test.ts`
Expected: FAIL, because the function is missing.

**Step 3: Implement `quoteFound`, then rerun.** **[Claude → you check]** Expected: PASS.

**Step 4: Sources** **[Claude]**. Split into a pure extraction module, tested first, and a thin I/O wrapper.

- **Domain: `scripts/lib/extract.ts`.** `extractText(party, html)` returns plain text, and `countWords(text)` returns its word count.
  - **Test first** (`tests/extract.test.ts`), with short inline HTML strings, not the cached pages, so the tests run on a fresh clone:
    - `<br>` and block elements become line breaks, and runs of spaces collapse;
    - entities decode, so `&amp;` becomes `&`;
    - D and R keep only the single `.field-docs-content` region, and zero or two regions throw;
    - L keeps the text from "PREAMBLE" to "Join Our Newsletter", and a missing marker throws;
    - a page containing "you have been blocked" throws.
  - Run them, see them fail, then implement with cheerio.
- **I/O: `scripts/lib/sources.ts`.** `getSource(party)` returns the platform's plain text.
  - **Where the HTML comes from:**
    - It reads the raw HTML from `.cache/sources/{party}.html`.
    - If the file is missing, or `--refresh` is passed, it fetches the URL from the spec's source table and saves the raw HTML there. The fetch sends a full browser `User-Agent` plus `Accept` and `Accept-Language` headers.
  - It calls `extractText`, then checks the word count:
    - It logs the count for each party.
    - It throws if a count is below half the expected one: D 42,864, R 5,374, L 3,446.
    - It never returns partial text.

**Step 5: The Desk** **[Claude → you check]**.

**The prompt,** `scripts/prompts/desk.md`: the request, the picking rules and the wording rules (spec § 7). Quotes must be one contiguous passage, copied exactly, with no ellipses.

**The card checks, domain first** (`scripts/lib/candidates.ts`). `checkCandidates(party, candidates, sourceText)` is pure: it takes the parsed candidates and the source text, and returns each card with its check results, plus the counts (proposed, passed, flagged). `toDraftPlanks(checked)` returns the passing cards in the `Plank` shape, grouped by party, with the counter-type cards first.

- **Test first** (`tests/candidates.test.ts`):
  - a quote that isn't in the source is flagged;
  - a 41-word quote is flagged, and a 40-word one passes;
  - every card's `party` is the platform passed in, never anything from the candidate;
  - IDs run `{doc}-1`, `{doc}-2` and so on, in the order proposed;
  - the counts add up;
  - `toDraftPlanks` drops the flagged cards and puts the counter-type cards first.
- Run them, see them fail, then implement.

**The script,** `scripts/research-desk.ts`, is the thin application layer: it calls Claude, then hands the result to the domain. It runs the three parties in parallel. For each:

1. **Call Claude.** Call `client.beta.messages.parse` with:
   - `model: "claude-opus-5-5"`;
   - `max_tokens: 20000`. Stay under 21,333, or the SDK demands streaming;
   - `betas: ["server-side-fallback-2026-07-01"]` and `fallbacks: "default"`;
   - `output_config: { effort: "high", format: betaZodOutputFormat(CandidatesSchema) }`, where the helper comes from
     `@anthropic-ai/sdk/helpers/beta/zod`.

   The system prompt is `scripts/prompts/desk.md`, and the user message is the platform text.
2. **Check the stop reason before reading `parsed_output`.**
   - `refusal`: the fallback model has already had its turn, so log `stop_details` and fail that platform loudly.
   - `max_tokens`, or `parsed_output` is null: retry once at effort `medium`, then fail loudly.
3. **Log `response.model`.** It shows when a fallback model served the request.
4. **Check each card** with `checkCandidates`. It runs `quoteFound`, checks that the quote is at most 40 words, sets `party` from the platform, and gives each card the ID `{doc}-{n}`, where the doc is `dnc-2024`, `rnc-2024` or `lp-2024`.
5. **Write the output.**
   - `research/candidates.json`: per platform, the model that served and the counts (proposed, passed, flagged), plus every card with its check results.
   - `research/planks.draft.ts`: the output of `toDraftPlanks`. It imports the type through the `@/content/schema` alias, so it can be copied to `content/` unchanged.
   - A one-line summary per party, printed to the log.
   - `--party X` reruns one platform and replaces only that platform's entries in both files.

**Step 6: Start it in the background.** **[Claude]**
Run: `mkdir -p research && npm run desk > research/desk.log 2>&1`, as a background command, so the Anthropic key stays inside the script's process and never enters the shell.
When the first line appears, read the log. The Libertarian line comes first, because its source is the shortest. Expected: a line like `L: 15 proposed · 14 quote ok · 1 flagged · claude-opus-5-5`. If there's no line, or there's an error, fix it before going on.
**Commit:** `feat: Research Desk script with quote check`. This commit has only the scripts, the prompt and the tests; the outputs are committed in Task 5.

**Handoff:** rewrite `docs/plans/handoff.md`, commit and push it, then suggest a `/clear` before Task 4. Note whether the Desk is still running in the background, and where its log is.

---

## Task 4: The game loop on placeholder cards (0:30–0:55)

**Files:**

- Create:
  - the deck: `content/planks.fixture.ts`, `content/loaded-words.ts`, `lib/prng.ts`, `lib/dealer.ts`, `lib/deck.ts`;
  - its tests: `tests/dealer.test.ts`, `tests/deck-dto.test.ts`, `tests/deck-imports.test.ts`, `tests/domain-imports.test.ts`;
  - the decisions: `lib/routes.ts`, `tests/routes.test.ts`, `lib/next-step.ts`, `tests/next-step.test.ts`;
  - the server side: `lib/supabase/admin.ts`, `lib/player.ts`, `app/actions.ts`;
  - the screens: `app/start/page.tsx`, `app/round/[id]/page.tsx`, `app/round/[id]/card-form.tsx`, `app/round/[id]/reveal/page.tsx`.
- Modify: `app/page.tsx` (the landing page), `lib/supabase/proxy.ts` (route access)

**Step 1: The fixture.** **[Claude]** `content/planks.fixture.ts` holds 24 fake cards that pass every deck rule (spec § 6, promise 4). The dealer tests use it, and the deck tests in Task 5 can run on it.

- 8 cards per party, each of the 12 topics used twice by two different parties, and 2 counter-type cards per party.
- Statements of 8–20 words and similar length, free of loaded words. For example: "Placeholder card seven about guns, used only while the game loop is built".
- Short quotes, and sources with a section and an `https://` URL.

These cards are for building only and never ship.

**Step 2: Write the failing dealer property tests** **[Claude → you check]** (`tests/dealer.test.ts`, using fast-check and the fixture).

For 1,000 seeds, `dealPair(pool, seed)` returns two halves that:

- each hold 12 cards, exactly 4 per party;
- each have no topic more than twice;
- each have at least one counter-type card per party;
- are disjoint, and together cover the pool;
- are identical, order included, for the same seed.

Three more tests:

- Card 1 of half A is a counter-type card in under 40% of the 1,000 deals. 25% is expected; without the final shuffle it would be every deal.
- `roundFor(pool, userId, index)` returns half `index % 2` of the pair seeded by `{userId}:{floor(index / 2)}`.
- An impossible pool, with only one counter-type card for a party, throws `DealError`.

Run: `npx vitest run tests/dealer.test.ts`
Expected: FAIL.

**Step 3: Implement.** **[Claude → you check]**

- `lib/prng.ts`: a string hash plus mulberry32.
- `lib/dealer.ts`:
  1. Shuffle the pool with the seed.
  2. Build half A greedily: first one counter-type card per party, then fill each party's quota, preferring
     non-counter-type cards and capping each topic at 2.
  3. Check that the complement, half B, meets every rule too.
  4. If not, retry with a derived seed, up to 200 times, then throw.
  5. Shuffle each half's order with a seed derived from the deal's seed.

Rerun. Expected: PASS.

**Step 4: The deck boundary.** **[Claude]** Write the three tests below first, and run them red: `lib/deck.ts` doesn't exist yet. Then write `lib/deck.ts`.

- **`lib/deck.ts`:** starts with `import 'server-only'` and exports:
  - `allPlanks()`;
  - `getPlank(id)`;
  - `toCard(p)`, which returns only `{id, statement, topic}`.

  For now it imports the fixture; Task 5 changes that one import line.
- **`content/planks.ts`** stays plain data that scripts and tests can read. The guard is the structure plus a test.
- **Tests:**
  - `tests/deck-dto.test.ts`: `toCard` returns exactly the keys `id`, `statement` and `topic`.
  - `tests/deck-imports.test.ts`:
    - only `lib/deck.ts`, `scripts/**` and `tests/**` import `content/planks` or `content/planks.fixture`;
    - no file containing `'use client'` imports `lib/deck`.
  - `tests/domain-imports.test.ts`: no file in the domain core (the table in "Test-driven and domain-driven") imports `next`, `react`, `@supabase/*`, `@anthropic-ai/*`, `node:fs`, `app/` or `lib/supabase/`. This keeps the core pure as it grows.

Run: `npm test`
Expected: red before `lib/deck.ts` exists, then PASS.

**Step 5: Route access** **[Claude → you check]**. The template's `lib/supabase/proxy.ts` calls `getClaims()`, then redirects visitors without a session to `/auth/login` on every path except `/`, `/login` and `/auth`. Change it:

- `/`, `/how-it-works` and `/auth/*` are public;
- a visitor without a session on any other path is redirected to `/`, not to `/auth/login`.

The rule is domain, and the proxy is plumbing:

1. **Test first** (`tests/routes.test.ts`):
   - `isPublicPath` is true for `/`, `/how-it-works`, `/auth/login` and `/auth/confirm`;
   - it's false for `/start`, `/round/abc`, `/save`, `/protected` and `/how-it-works-not`;
   - `/authority` isn't public: a prefix has to match a whole path segment.
2. Run it red, then implement `isPublicPath(pathname)` in `lib/routes.ts`.
3. Make `lib/supabase/proxy.ts` call it, and redirect to `/`.

**Step 6: Player state and server actions.** **[Claude → you check]**

- **The decision, domain first: `lib/next-step.ts`.** The landing page, `/start` and `startRound` all ask the same question: where does this player go next? `nextStep(state)` answers it once, as a pure function of the player state: the unrevealed round's ID, the revealed round IDs in order, and the stated party.
  - **Test first** (`tests/next-step.test.ts`). The rules are checked in this order:
    1. an unrevealed round gives `resume`, with that round's ID, even when two rounds are revealed;
    2. two revealed rounds give `deck-done`, with the latest round's ID;
    3. no stated party gives `choose-party`;
    4. otherwise the result is `deal`, with round number = revealed rounds + 1, so 1 or 2.
  - Run it red, then implement.
- **`lib/supabase/admin.ts`:** a `server-only` client built with the secret key.
- **`lib/player.ts`:** `getPlayerState()` returns the unrevealed round's ID if there is one, the revealed rounds in order, and the stated party if there is one. It uses the user's own client, so RLS applies.
- **`app/actions.ts`:** every action identifies the user with `getUser()` and validates its inputs with Zod.
  - **`beginAnonymous()`:** if there's no session, call `supabase.auth.signInAnonymously()`. Then redirect to `/start`.
  - **`startRound(statedParty?)`:**
    1. If a party was given, upsert the profile with the user's client.
    2. Ask `nextStep`. On `resume`, redirect to that round. On `deck-done` or `choose-party`, redirect to `/start`, which shows the whole-deck message or the party buttons.
    3. On `deal`, carry on.
    4. Deal `roundFor(allPlanks(), userId, revealedCount)`. Insert the round with the admin client, storing the seed as `{userId}:{pair}:{half}`.
    5. A unique violation (`23505`) from the one-unrevealed-round index means another tab got there first: redirect to that round.
    6. Redirect to `/round/{id}`.
  - **`answerCard(roundId, plankId, vote, guess)`:** insert as the user, and treat a unique violation as success. Then redirect to `/round/{id}`. It never returns a party.
  - **`revealRound(roundId)`:** call `rpc('reveal_round')`.
    - On `round_incomplete`, redirect to `/round/{id}`.
    - Otherwise redirect to `/round/{id}/results`.

**Step 7: Screens.** **[Claude → you check: the copy and the loaded words]** Follow the Screens section.

- **Landing:**
  - the name, the pitch and the "why". Claude drafts them from spec § 1 in the spec's plain register, and the same text goes into README §2;
  - a face-down sample card;
  - one primary button from `nextStep`: "Start" with no session, `choose-party` or `deal` 1; "Finish your round" for `resume`; "Play round 2" for `deal` 2; "Your results" for `deck-done`. "Start" and "Play round 2" call `beginAnonymous`;
  - a "Your results" link to the latest revealed round whenever one exists.
- **`/start`** renders `nextStep`:
  - `resume`: redirect to the round.
  - `deck-done`: show "You've seen the whole deck" and a link to the latest results.
  - `choose-party`: show five party buttons (Democrat, Republican, Libertarian, Independent, Prefer not to say) and the note. They call `startRound(party)`.
  - `deal`: show a "Deal round N" button. It calls `startRound()`.
- **`/round/[id]`:** a server component that loads the round and its answers.
  - If the round isn't found (it isn't the user's, or it doesn't exist), call `notFound()`.
  - Otherwise pick the first unanswered card. If none is left, redirect to `/reveal`.
  - Render `CardForm`, a client component that shows the vote, then the guess, and submits on the second tap. No back
    link, no party colours.
- **`/round/[id]/reveal`:** "All 12 answers are locked. Ready?" with one button that calls `revealRound`.

**Also in Step 7 [Claude]:** `content/loaded-words.ts`, the loaded words and names, as a readonly array. Include the party and candidate names, and both sides' loaded terms from the spec's wording rules, such as "pro-life", "reproductive freedom" and "Obamacare". The deck tests in Task 5 use it.

**Step 8: Manual check, locally.** **[You]**

- Play a full round on the fixture. Expected: the reveal lands on a 404 until Task 5 adds the results page.
- Refresh on card 5. Expected: it resumes at card 5.
- Double-tap a guess. Expected: no error, and the next card appears.
- Open `/start` in a fresh incognito window. Expected: it redirects to `/`.

**Commit:** `feat: dealer, deck boundary, route access and game loop`, then push.

**Handoff:** rewrite `docs/plans/handoff.md`, commit and push it, then suggest a `/clear` before Task 5.

---

## Task 5: The real deck, the deck tests and the bare results page — the MVP line (0:55–1:10)

**Files:**

- Create: `tests/deck.test.ts`, `content/planks.ts`, `app/round/[id]/results/page.tsx`
- Modify: `lib/deck.ts` (one import line)
- Commit: `research/candidates.json`, `research/desk.log`

**Step 1: Check the Desk's output.** **[Claude]** Read the three summary lines in `research/desk.log`. If a platform failed, rerun
only that one (`npm run desk -- --party R`) while starting Step 2.

**Step 2: The deck tests, before the deck** **[Claude → you check]** (`tests/deck.test.ts`). They're promise 4 written as tests, against `allPlanks()`:

- Every card parses with the `Plank` schema, and the IDs are unique.
- Every ID matches `card-NN`. The browser sees IDs in `toCard()` and in `rounds.plank_ids`, so a Desk ID like `rnc-2024-14` would give the party away.
- There are exactly 24 cards, 8 per party.
- There are at least 2 counter-type cards per party.
- Every topic that appears has cards from at least 2 parties, and at most 4 cards.
- No statement contains a word or name from `content/loaded-words.ts`, matching case-insensitively on whole words.
- Statements are 8–20 words, and quotes are at most 40 words.
- The mean statement length per party is within 15 characters across the parties.
- Every source has a section and an `https://` URL.
- `dealPair` succeeds on the deck for 100 seeds.

Run them on the fixture. Expected: PASS, which shows the tests accept a deck that meets the rules.

**Step 3: Switch to the real deck, red.** **[Claude]**

1. Copy `research/planks.draft.ts` to `content/planks.ts`.
2. Change the import in `lib/deck.ts` from the fixture to `content/planks.ts`.
3. Run the deck tests. Expected: FAIL for the expected reasons: the draft has more than 24 cards, and probably loaded words or lengths out of range.

From here on, the deck tests check the real deck.

**Step 4: Curate to green.** **[Claude → you check: all 24 cards]** Delete the rejects and fix the wording until 24 cards remain and `npx vitest run tests/deck.test.ts` passes:

- 8 per party;
- at least 2 counter-type cards per party;
- the topic rules met;
- the spec's wording rules followed, including the ones no test can check: verb first, say what changes and not why, and one register for all three parties.

If a party is short of cards, rerun it with `--party` and take what you need from the new draft. Once the wording is final, renumber the 24 cards `card-01` to `card-24`, ordered by topic and then by statement, so the number says nothing about the party. Show the final 24 for review, each with its statement, quote, party and counter-type flag. Then run `npx tsc --noEmit && npm test`. Expected: PASS.

**Step 5: The bare results page** **[Claude]** (`app/round/[id]/results/page.tsx`):

- If the round isn't the user's, show `notFound()`.
- If it isn't revealed, redirect to `/round/{id}`.
- Otherwise list this round's 12 cards in deal order. Each shows its party, "as they put it" (the quote), the source link, and the user's vote and guess. No maths yet.

**Step 6: MVP on prod.** **[Claude pushes · You play]** Claude pushes, and Vercel deploys. On the live URL, in a fresh incognito window, you play a full round.
Rounds dealt from the fixture stop working once the deck switches, so test only with new sessions from here on.
Expected: 12 real cards, the lock-in screen, then the card-by-card reveal. **This is the MVP line.**

**Step 7: README §7, the funnel.** **[Claude]** From `candidates.json`, record per party:

- how many cards were proposed, passed the quote check and were approved;
- which model served.

**Commit:** `feat: 24-card deck from the Research Desk, with deck tests and the reveal`

**Handoff:** rewrite `docs/plans/handoff.md`, commit and push it, then suggest a `/clear` before Task 6.

---

## Task 6: Results (1:10–1:35)

**Files:**

- Create:
  - `lib/verdict.ts`, `tests/verdict.test.ts`;
  - `lib/results.ts`, `tests/results.test.ts`;
  - `lib/share.ts`, `tests/share.test.ts`;
  - `lib/save.ts`, `tests/save.test.ts`;
  - `app/save/page.tsx`, `app/how-it-works/page.tsx`.
- Modify:
  - `app/round/[id]/results/page.tsx`;
  - `app/actions.ts` (the save action);
  - `app/layout.tsx` and `components/auth-button.tsx` (the header);
  - `components/login-form.tsx`, `components/logout-button.tsx`.
- Delete:
  - the routes `app/protected/`, `app/auth/sign-up/`, `app/auth/sign-up-success/`, `app/auth/forgot-password/` and `app/auth/update-password/`;
  - the components `components/sign-up-form.tsx`, `components/forgot-password-form.tsx` and `components/update-password-form.tsx`;
  - the template's home-page leftovers, once nothing imports them: `components/tutorial/`, `hero`, `deploy-button`, `next-logo`, `supabase-logo` and `env-var-warning`.

**Step 1: Write the failing verdict tests** **[Claude → you check]** (`tests/verdict.test.ts`), table-driven. Every number was recomputed on 2026-10-02.

| Function | Input | Expected |
| --- | --- | --- |
| `wilson(k, n)`, z = 1.2816 (80%) | 4/4, 0/4, 3/4, 1/4, 0/0 | lo 0.709; hi 0.291; [0.433, 0.922]; [0.078, 0.567]; [0, 1], all ±0.001 |
| `lean` | L 4/4, D 0/4, R 0/4 | clear, L |
| `lean` | L 3/4, D 1/4, R 1/4 | leaning, L |
| `lean` | L 2/4, D 2/4, R 1/4 | too close (a tie for the lead) |
| `lean` | every answer Unsure | too close, with reason `all_unsure` |
| `lean` | L 3/3 (plus 1 Unsure), D 0/4, R 0/4 | clear, L |
| `lean` | L 4/4, D 0/4, R all 4 Unsure | leaning, L: R has nothing counted, so its interval is [0, 1] |
| `guessSkill` | 8 of 12 right | p ≈ 0.0188 (±0.0005) |
| `guessSkill` | 4 of 12 right | p ≈ 0.607 |
| `guessSkill` | 13 of 24 right | p ≈ 0.0284. The leak check reuses this |
| `projection` | stated D; backed 6; guessed D, D, D, D, D, R; actually D, D, L, L, R, R | assumed 5/6, actual 2/6 |
| `projection` | stated I; backed 3; guessed L, L, D | measured against L, the most-guessed party |
| `projection` | stated none; backed 2; guessed L, D | null: a tie for most guessed, so the line is hidden |
| `projection` | nothing backed | null, so the line is hidden |
| `mostRevealing` | stated D; one backed card guessed D that was R | that card |
| `mostRevealing` | no backed card meets the rule | null |

Run: `npx vitest run tests/verdict.test.ts`
Expected: FAIL.

**Step 2: Implement `lib/verdict.ts`.** **[Claude → you check]**

- Keep it pure.
- Leave Unsure out of the counts.
- Handle `n = 0` everywhere. A party with nothing counted has the interval [0, 1] and can't lead.

Rerun. Expected: PASS.

**Step 3: Share line.** **[Claude]** `lib/share.ts` builds something like `Blind Ballot · guessed 8/12 · blind lean: leaning L ·
<home page URL>`. It links to the home page, never to a round.

- **Test first** (`tests/share.test.ts`): it contains no card statement, no per-card party and no round ID, and it ends with the home page URL. Run it red.
- Implement. Expected: PASS.

**Step 4: The results page** **[Claude → you check]**. Build on top of the bare reveal list, following Screens §5.

- **Domain first: `lib/results.ts`.** `resultsFor(answers, planks, statedParty)` returns everything the page shows: the verdict, the findings and the card-by-card rows. It joins each answer to its plank's party, then calls `lib/verdict.ts`, so the page does no maths.
  - **Test first** (`tests/results.test.ts`), with a hand-built set of 12 answers:
    - the support counts per party match a hand count;
    - Unsure answers are left out of the counts;
    - every card-by-card row carries the plank's party, quote and source;
    - an answer whose plank isn't in the deck throws, rather than being skipped without a word.
  - Run it red, then implement.
- Load the user's answers from revealed rounds only, never from the round in progress.
- Render:
  - the headline verdict, with its confidence and the three bars;
  - the personal findings;
  - the card-by-card reveal.
- Actions:
  - "Play round 2", after round 1;
  - "Save results", for guests only;
  - "Share", which copies the line.

  After round 2, show "You've seen the whole deck."
- Use the wording rule "Blind, you voted most like…" everywhere.

**Step 5: Save results.** **[Claude]** `/save` is for guests only; email accounts are redirected to `/`.

- **Test first** (`tests/save.test.ts`): the input schema in `lib/save.ts` accepts a valid email with a 6-character password, and rejects a malformed email and a 5-character password. Run it red, then implement.
- A server action validates the input with that schema. It then calls `supabase.auth.updateUser({ email, password })` once.
- On the error code `email_exists`, show "That email already has an account — sign in instead."
- On success, call `refreshSession()` so the token's `is_anonymous` updates, then redirect to the latest results.
- With "Confirm email" off, the upgrade is immediate, sends no email and keeps the same `user_id` (spec § 4). Check it on prod in Task 8.

**Step 6: The header, sign in and out.** **[Claude]**

- **The header** goes in `app/layout.tsx`, adapting `components/auth-button.tsx`. It holds:
  - "How it works";
  - "Sign in", linking to `/auth/login`, for visitors without a session and for guests (`is_anonymous`);
  - the email and "Sign out", for email accounts.

  Remove the template's "Sign up" button and its "Hey, {email}" greeting, which breaks for guests.
- **The login form:**
  - Go to `/` after signing in, not `/protected`.
  - Remove the "Sign up" and "Forgot your password?" links.
  - Add "New here? Press Start on the home page."
- **The logout button:** go to `/`, not `/auth/login`.
- Delete the routes and components listed above.

**Step 7: Words.** **[Claude → you check]** Write `/how-it-works` from the spec, in its plain register. The landing words were written in Task 4.

- the sources, with links, including the archived Libertarian copy;
- how the cards are written;
- how the results are calculated, in plain words;
- the privacy note;
- a placeholder for the leak-check result.

**Commit:** `feat: results, verdict engine, round 2, save, sign-in and share`. Push, then check rounds 1 and 2 and their results on
prod.

**Handoff:** rewrite `docs/plans/handoff.md`, commit and push it, then suggest a `/clear` before Task 7.

---

## Task 7: The leak check — first to cut (1:35–1:45)

**Files:** create `scripts/lib/leak-summary.ts`, `tests/leak-summary.test.ts`, `scripts/prompts/leak-check.md` and `scripts/leak-check.ts`. They output `evals/leak-report.json` and `evals/leak-report.md`.

**Step 1: The script.** **[Claude → you check]** The summary is domain logic, so it comes first. The script is the thin layer that makes the calls.

- **Test first** (`tests/leak-summary.test.ts`), for the pure summary in `scripts/lib/leak-summary.ts`, given each card's 5 answers per version:
  - 4 of 5 for the right party gives majority correct, with sureness 0.8, so the card is flagged;
  - a 2–2–1 split counts as a miss;
  - 3 of 5 for the right party is correct, but not flagged;
  - accuracy and its p-value come from `guessSkill`, which is imported, not rewritten;
  - the drop is original accuracy minus neutral accuracy.

  Run it red, then implement.

- **The prompt file** asks which party's platform proposed the text, and which words point to that party. It doesn't mention the deck's balance.
- **The calls:** for each card, and for each version (the neutral statement, then the original quote), make 5 calls to `client.beta.messages.parse` with:
  - `model: "claude-opus-5-5"`;
  - `max_tokens: 4000`, because thinking counts against it;
  - the same `betas` and `fallbacks` as the Desk;
  - `output_config: { effort: "medium", format: betaZodOutputFormat({ party, cues[] }) }`;
  - at most 8 calls at a time;
  - the same stop-reason checks as the Desk.

The script hands the answers to the summary, which records for each card and version:

- the majority party (a tie counts as a miss);
- sureness, the majority count ÷ 5;
- whether the majority was correct;
- the cues.

Then it summarizes:

- accuracy for the neutral and original versions, each with the p-value from `guessSkill`'s binomial tail (reuse it rather
  than rewriting it);
- the drop from the original to the neutral version;
- the flagged cards: correct, with sureness ≥ 0.8.

**Step 2: Run it.** **[Claude]**
Run: `npm run leak-check`
Expected: neutral accuracy above chance, because Claude knows these platforms and some policies give their party away. Original accuracy is higher still. The drop is the result to report.

**Step 3: Publish.** **[Claude → you check]** Add the table to README §7 and `/how-it-works`, with the limits:

- the same model family wrote the wording and tested it;
- the cues are Claude's own account.

For each flagged card, Claude says whether its cues are wording or policy and proposes a rewrite when they're wording. You decide which rewrites go in. Any flagged card left as it is goes under "What's incomplete".
**Commit:** `feat: leak check and report`

**Handoff:** rewrite `docs/plans/handoff.md`, commit and push it, then suggest a `/clear` before Task 8.

---

## Task 8: Smoke test, README, submit (1:45–2:00)

**Step 1: Smoke test on prod, in incognito.** **[You]**

- Before tapping Start, open `/how-it-works`. Expected: it loads.
- Play round 1 through the reveal and results.
- Play round 2. Expected: none of round 1's cards, results built on both rounds, then "You've seen the whole deck".
- Refresh mid-round. Expected: it resumes.
- Paste a round URL from another browser. Expected: a 404.
- Save results. Expected: the header shows "Sign out". Then sign in on a second browser. Expected: the same results.
- During a round, view the page source and search for `"party"` and for a party name next to a card. Expected: no hits.

**Step 2: README §§3, 4, 9 and 10.** **[Claude → you check]** Claude drafts them from your smoke-test results, and you edit them.

- **What works:** check each item against Step 1.
- **What's incomplete:** anything cut, plus the known limits.
- **Disclosure:** what was prepared in advance, and that Claude Code wrote the code, tests, deck and copy, which you reviewed.
- **What's next.**

**Commit and push:** `docs: README for submission`. Confirm the Vercel deploy is green.

**Step 3: Ashby note.** **[Claude drafts · You review and submit]** Five lines: the live link, the repo link, a line saying that what works, what's incomplete and
how to run it are in the README, and the one-line disclosure. **Stop at 2:00.**

---

## If behind

Cut in this order:

1. Task 7, the leak check.
2. The guess-skill stat: its rows in `verdict.test.ts` and its line on the results page.
3. The projection line and the most revealing card.
4. The dealer's constraints: deal a plain seeded shuffle, split in two.

**Clock checks:**

- **0:33:** if there's no Libertarian line in `research/desk.log`, or there's an error, fix the Desk before going on.
- **1:15:** if the MVP isn't on prod, cut the leak check now.
- **1:35:** if the verdict tests aren't green, cut the guess-skill stat, then the projection line and the most revealing card.
- **1:45:** stop feature work, whatever state it's in. Only the smoke test and the README remain.

Never cut: sign-in, route access, the blind rules and their database checks, the quote check, the card-by-card reveal,
the honest verdict, the deploy, or the README.

Every cut call is yours. **[You]**
