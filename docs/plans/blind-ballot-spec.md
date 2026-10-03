---
title: Casper take-home — Blind Ballot spec
type: working-doc
identity: The consolidated build spec for Blind Ballot. It holds every section approved from 2026-09-28 to 2026-09-30, the four plan changes, auth and deployment, and the 2026-10-02 pre-flight revision. Build from this plus the plan.
date: 2026-10-02
status: final for the build — revised 2026-10-02 after the pre-flight review; the build hasn't started
---

# Blind Ballot — the build spec

This is the one document to build from. The companion files:

- [`plan.md`](plan.md) is the task-by-task plan, slot by slot.
- [`repo-CLAUDE.md`](repo-CLAUDE.md) becomes the repo's `CLAUDE.md` at 0:00. It holds the working rules for Claude Code.
- [`judgment-calls.md`](judgment-calls.md) logs the calls made during the build that change this spec or the plan, and what was decided.
- [`concept.md`](concept.md) holds how the idea came about, the research, the rival comparison and the dated approval record. Where it differs from this spec, this spec wins.
- [`_casper-take-home.md`](../_casper-take-home.md) is the brief.

## Revision 2026-10-02

A pre-flight review checked every assumption the build depends on. The checks, with the evidence in the sections named:

- **The template:** its layout matches § 4. That covers the root `proxy.ts`, `lib/supabase/proxy.ts`, the publishable-key variable, the login form and `/protected`.
- **Supabase Auth:** I read the Auth server's source, because the docs don't cover the case. With "Confirm email" off, `updateUser({ email, password })` on an anonymous user adds the email at once. It sends no message and keeps the same user ID (§ 4).
- **The Claude SDK:** the call in § 7 was type-checked and run offline against `@anthropic-ai/sdk` 0.131.0.
- **The sources:** all three platforms were fetched and extracted. lp.org blocks bare scripted requests (§ 7).
- **The statistics:** every number in the test tables was recomputed.

What changed:

1. **Reveal-as-you-go is cut.** Every round has exactly 4 cards per party, so revealing card by card lets later guesses be made by elimination.
   - I simulated 200,000 rounds with a player who ignores the wording and only counts what's left. That player averaged 6.1 of 12 and scored 8 or more 13.9% of the time. The guess-skill test assumes 1.9% (§ 6).
2. **Every counted answer is blind.** The old rule counted a repeated card's latest answer. But a card can only repeat after its reveal, and labels pull votes toward your own party.
   - Now a user plays the two halves of the deck and no third round, so each card is answered once, before its reveal (§ 2, § 6).
3. **The dealer shuffles each half after building it.** The greedy build picks the counter-type cards first. Without the shuffle, every round would open with the same party pattern (§ 6).
4. **The database is tighter.**
   - An answer's `user_id` must be the caller's.
   - Table privileges are narrowed under the policies (§ 5).
5. **The leak check is reframed.** Claude has read these platforms, and a policy can give its party away however neutral the wording. So above-chance accuracy on the neutral wording is expected. The wording is judged by the drop from the original wording and by each card's cues (§ 8).
6. **No flow depends on email.** Supabase's built-in mailer only delivers to the project team's addresses, two messages an hour. So the template's sign-up and password-reset pages go (§ 4).
7. **The sources are saved as raw pages before the timer,** and the scripts fetch with browser headers (§ 7).
8. **Smaller fixes:**
   - exact verdict rules for ties and for parties with nothing counted (§ 6);
   - an explicit topic rule (§ 6);
   - the share line links to the landing page (§ 3);
   - the "this seems slanted" flag moves to the seams (§ 12).

## 1. The product

**Pitch:** twelve promises to voters with the party labels removed. For each one, you say whether you'd support it and guess who proposed it. Then you see who you actually agree with.

**Why it exists:** party labels work like the halo effect in my Kahneman notes: they change how people judge a policy. In Geoffrey Cohen's "Party over Policy" (2003, *JPSP* 85(5), 808–822), people backed the welfare policy their own party endorsed, whatever its content, and denied that the label had swayed them. Blind Ballot removes the label, so the judgment is about the policy. The reveal then shows each party's own wording, which teaches the propaganda lesson.

**Who it's for:** anyone who votes, or argues about politics. The US midterms fall on 2026-11-03.

**The four promises** (the non-trivial logic, § 6):

1. No peeking, no take-backs.
2. Fair rounds.
3. Only what your answers show.
4. Neutral, sourced cards.

**Where Claude fits:** nowhere in the live app. Claude does two jobs offline: the Research Desk drafts the deck from the platforms (§ 7), and the leak check tests it (§ 8). The party always comes from the source documents, never from Claude.

## 2. Defaults

- **Card flow:** two taps per card.
  1. "Would you support this?" Support, Oppose or Unsure.
  2. "Who proposed it?" Democrat, Republican or Libertarian.

  The vote comes first, so a guess can't prime it.
- **Source:**
  - the 2024 platforms of the Democratic and Republican parties;
  - the Libertarian platform that was in force for the 2024 election (§ 7).

  No Libertarian sits in Congress, so bills can't represent all three parties. Bills are the later daily version.
- **Deck:** 24 cards, 8 per party, with at least 2 counter-type cards per party. Rounds are 12 cards.
- **Rounds:** two per user, one for each half of the deck. After both, the deck is done ("You've seen the whole deck"). More cards arrive with the bill feed (§ 12).
- **Reveal:** at the end of the round. Reveal-as-you-go is cut from v1 (§ 6, promise 3).
- **"Unsure":** offered, and left out of the support counts.
- **Party options:** users name their own party, once, before round 1. The options are Democrat, Republican, Libertarian, Independent or Prefer not to say. Guesses stay Democrat, Republican or Libertarian.
- **Honest results:** counts, not identity percentages. Always "Blind, you voted most like…", never "You are a…".
- **Name:** Blind Ballot.

## 3. Screens and user flow

There are five screens plus one static page. The layout is mobile-first: one column and big tap targets.

```
Landing ─Start─▶ Your party ─▶ Cards 1–12 ─▶ Lock in & reveal ─▶ Results
                 (round 1 only)                                    │
              Play round 2 · Save results · Share ◀────────────────┘
"How it works" (sources, method, privacy) is linked from every screen
```

**The header on every screen:** "How it works", plus "Sign in" or "Sign out" (§ 4).

1. **Landing.** It has to pass the 30-second test before anyone taps.
   - It shows the name, a one-line pitch and a short "why", all in my own words and written inside the timer.
   - It shows a sample card, face down.
   - "Start" signs the user in anonymously in the background, with no form.
   - Returning players see one button for where they are: "Finish your round", "Play round 2" or "Your results". Whenever a revealed round exists, a "Your results" link appears as well.
2. **Your party.** This screen comes once, before round 1.
   - It asks "Which party do you identify with?" The options are Democrat, Republican, Libertarian, Independent or Prefer not to say.
   - The note reads "Only you see this; we compare it with how you vote blind."
   - Round 2 starts from a single "Deal round 2" button instead.
3. **Card.** One card at a time. The example below is from the Democratic platform:

   ```
   Card 3 of 12                          Immigration

   Hire more border patrol agents,
   immigration judges and asylum officers.

   Would you support this?
   [ Support ]  [ Oppose ]  [ Unsure ]

   Who proposed it?
   [ Democrat ]  [ Republican ]  [ Libertarian ]
                                answers lock on tap
   ```

   - The guess row appears after the vote. The second tap locks the card and moves on. There is no back button.
   - No party colors appear anywhere until the reveal, so a color can't prime the guess.
4. **Lock in and reveal.** The screen reads "All 12 answers are locked. Ready?" and has one button.
5. **Results.**
   - **The headline verdict, with its confidence**, for example "Blind, you're leaning Libertarian — not clear yet".
     Three bars show the support counts. The verdict builds across both rounds.
   - **The personal findings:** the party the user named against how they voted blind, the projection line, and their guessing compared with luck.
   - **Card by card,** for this round's 12 cards: the party, "as they put it" (the original quote), the source link, and the user's vote and guess.
   - **Actions:**
     - "Play round 2" after round 1;
     - "Save results" for guests;
     - "Share", a line that gives away no answers and links to the landing page, never to a round.

     After round 2, the screen says "You've seen the whole deck."
6. **How it works (static and public).** The sources with links, how cards are written, how results are calculated in plain words, the leak-check result, and privacy. It is the method note for evaluators who bring their own politics.

## 4. Auth and deployment

### Auth

- **Anonymous by default.** "Start" signs the user in anonymously in the background, with no form. Anonymous users (guests) get
  Supabase's `authenticated` role, flagged `is_anonymous`.
- **Who the server trusts.** Server actions identify the user with `supabase.auth.getUser()`, which checks with Supabase, before writing anything with the secret key. The server never relies on `getSession()`, and never on a user ID sent by the browser.
- **Route access.** The template's `lib/supabase/proxy.ts` (checked 2026-10-02) calls `getClaims()`. It redirects visitors without a session to `/auth/login` on every path except `/`, `/login*` and `/auth*`. Change it so that:
  - `/`, `/how-it-works` and `/auth/*` are public;
  - `/start`, `/round/*` and `/save` need a session (a guest one counts);
  - a visitor without a session on those pages goes back to `/`, not to a login form.
- **Save results.** `/save` is for guests only. It takes an email and a password of at least 6 characters, and calls `updateUser({ email, password })` once.
  - **What Supabase does:** I read this in the Supabase Auth server source on 2026-10-02 (`internal/api/user.go` and `verify.go`), because the docs don't cover it.
    - With "Confirm email" off, an anonymous user's new email is confirmed at once, and no message is sent.
    - The password is set in the same request.
    - `is_anonymous` becomes false.
    - The user ID doesn't change, so every round carries over.
  - **After the call:** the session token still says `is_anonymous` until it is refreshed, so the action calls `refreshSession()`.
  - **An email that already has an account:** the error code is `email_exists`. Show "That email already has an account — sign in instead." Merging accounts is a later feature.
- **Sign in and out.**
  - The header shows "Sign in" (the template's `/auth/login`) to visitors without a session and to guests. Guests get no "Sign out", because signing out would lose their rounds.
  - It shows the account's email and "Sign out" to email accounts. Signing out goes to `/`.
  - **The login form:**
    - It goes to `/` after signing in, not `/protected`.
    - Its "Sign up" and "Forgot your password?" links are removed.
    - "New here? Press Start on the home page." takes their place.
  - **Routes to delete:** `/protected`, `/auth/sign-up`, `/auth/sign-up-success`, `/auth/forgot-password` and `/auth/update-password`. Accounts are created through Start and Save results. A second sign-up path would create an account without the guest's rounds.
- **No flow depends on email.** Supabase's built-in mailer only delivers to the project team's addresses, and only two messages an hour (Supabase docs, checked 2026-10-02). Password reset needs a custom SMTP server, so it's a later feature.
- **Someone else's round.** The database rules return nothing, so the page shows a 404.
- **Supabase Auth settings:**
  - anonymous sign-ins on;
  - "Confirm email" off;
  - "Secure password change" off (the default);
  - the anonymous sign-in rate limit raised for the build;
  - the Site URL set to the Vercel domain;
  - `http://localhost:3000/**` and the Vercel domain allowed as redirect URLs.

  Manual identity linking isn't needed for this flow.
- **Bots.** Supabase rate-limits anonymous sign-ins by IP. A CAPTCHA is a later addition.

### Deployment

- **One Supabase project** serves both local dev and prod. Create it in US East, next to Vercel's default region.
- **Vercel** builds from the GitHub repo on every push.
  - Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`
    (server only).
  - The Anthropic key never goes to Vercel. Only the local scripts use it.
- **Keys on my laptop:** `.env.local` holds the Supabase values and `ANTHROPIC_API_KEY`.
  - The scripts load the file with `tsx --env-file=.env.local`.
  - The key is never exported in the shell that runs Claude Code. Claude Code offers to use an exported `ANTHROPIC_API_KEY` in place of my subscription. An `ant auth login` profile can also trigger an auth-conflict prompt.
- **Before every push:** run `npx tsc --noEmit && npm test`.
  - `npm test` runs the unit and deck tests. The database tests run separately (`npm run test:db`), so pushes don't create test users.
  - Vercel's build type-checks the tests and scripts too. `tsconfig.json` excludes the generated `research/` and `evals/` folders.
- **The database schema** lives in `supabase/migrations/0001_init.sql` and is applied in the Supabase SQL editor. For a change mid-build, edit the file first, then re-run only the changed statements. The repo must match the live database at submission.
- **Test users:** the database tests create anonymous users in the one project and delete them when they finish.
- **A bad push late in the build:** use Vercel's Instant Rollback to the last good deployment.
- **After submission:** Supabase pauses free projects after a week without activity. Until the interview, open the live app every few days. A daily Vercel Cron ping is the stretch version.

## 5. Data model

**Where things live**

| What | Where | Why |
| --- | --- | --- |
| The deck (24 cards, with their parties) | `content/planks.ts`, plain data that the app reads only through the `server-only` module `lib/deck.ts`. A test blocks imports of the deck anywhere else | The party never touches the database, so no query can leak it |
| Rounds, answers, the user's party | Supabase Postgres | Each user's state sits behind privileges and row-level security |
| Platform pages | Raw HTML in a local cache (`.cache/sources/`), excluded from git | They are copyrighted, and only the scripts need them |
| Claude's drafts and the leak-check report | `research/` and `evals/` in the repo | Evidence for the interview: what Claude proposed and what I kept |
| Anthropic API key | `.env.local` on my laptop, loaded only by the scripts | Claude runs in the scripts, never in the live app |
| Supabase secret key | The server environment only (Vercel and `.env.local`) | Only the server creates rounds |

**The deck's shape (`Plank`):**

- `id`, for example `card-14`. The browser sees it, so it says nothing about the party;
- `party`: D, R or L;
- `topic`: one of the 12 (§ 7);
- `statement`: the neutral wording;
- `quote`: the original wording, one contiguous passage of 40 words at most;
- `source`: `{ doc, section, url }`;
- `counterType`.

A Zod schema validates it. The browser only ever receives `{id, statement, topic}`.

**Tables**

- **`profiles`:**
  - `user_id`: the primary key, referencing `auth.users` with `on delete cascade`;
  - `stated_party`: `D`, `R`, `L`, `I` or `none`;
  - `created_at`.
- **`rounds`:**
  - `id` (a uuid);
  - `user_id`, referencing `auth.users` with `on delete cascade`;
  - `seed`, in the form `{user_id}:{pair}:{half}`;
  - `plank_ids`: a text array of exactly 12;
  - `created_at`;
  - `revealed_at`: null until the reveal.

  A partial unique index allows only one unrevealed round per user. The server deals at most two rounds per user (§ 2).
- **`answers`:**
  - `id`;
  - `round_id`, referencing `rounds` with `on delete cascade`;
  - `plank_id`;
  - `user_id`, referencing `auth.users` with `on delete cascade` and defaulting to `auth.uid()`;
  - `vote`: `support`, `oppose` or `unsure`;
  - `guess`: `D`, `R` or `L`;
  - `created_at`.

  It is unique on `(round_id, plank_id)`, and `vote` and `guess` have check constraints.

**Row-level security (on from the first minute)**

| Action | Who | Rule |
| --- | --- | --- |
| Set the party | The user | Insert, select and update only their own profile row |
| Read rounds and answers | The user | Select only rows with their own `user_id` |
| Start a round | The server only | There is no insert policy for users. The server action runs the dealer and inserts with the secret key |
| Answer a card | The user | Insert only if the row's `user_id` is theirs, the round is theirs, the card is in its `plank_ids`, and `revealed_at` is null. There are no update or delete policies |
| Reveal | The user, through `reveal_round()` | A `security definer` function that works only for the owner, and only once every card is answered. It stamps `revealed_at` once, and calling it again returns the same stamp. It locks the round's row, so two calls at once get one stamp |
| See a card's party | The server, reading from code | Only for rounds with `revealed_at` set |

**Privileges under the policies.** Row-level security decides which rows a user reaches, and privileges decide which actions exist at all.

- `anon` gets nothing on the three tables.
- `authenticated` gets:
  - select on `rounds`;
  - select and insert on `answers`;
  - select, insert and update on `profiles`.
- So even a wrong policy can't let a user update or delete an answer.
- Only `authenticated` can execute `reveal_round`.

**In short:** the database guards the answers, and the server code guards the party labels.

**Details:**

- **Indexes:** `user_id` on `rounds` and `answers` is indexed, because the policies filter on it.
- **Policy form:** policies use `(select auth.uid())`.
- **Saving by email** keeps the same `user_id`.
- **Results** are calculated on the server, from the user's answers in revealed rounds plus the deck, with no maths in SQL. The round in progress is never included, so nothing calculated from parties can leak mid-round.

## 6. Non-trivial logic: four promises

Each piece exists because the product makes a promise it has to keep.

### 1. No peeking, no take-backs

- **Product reason:** the result means something only if the user judged without the label.
- **Logic:**
  - The party is reached only through the `server-only` module `lib/deck.ts`. The browser only ever receives
    `{id, statement, topic}`.
  - Answers are insert-only, under the caller's own `user_id`, and each card gets one answer per round.
  - `reveal_round()` marks the round as revealed only for its owner, and only once every card is answered. After that,
    the insert policy refuses new answers.
  - The dealt card IDs are stored on the round, so a refresh resumes it.
- **Traps a naive build falls into:**
  - Row-level security filters rows, not columns, so a `party` column would be readable with the browser's key.
  - Passing a full plank object to a client component serializes the party into the page payload.
  - A user's own session token could edit a vote after the reveal.
  - A server action could write with the secret key after trusting `getSession()`, which reads the cookie unchecked, or a user ID sent by the browser.
  - Revealing card by card in a round with fixed party quotas makes the late guesses free (promise 3).
- **Proof:**
  - Database tests try to:
    - read another user's rows;
    - reveal early;
    - answer after the reveal;
    - answer as someone else;
    - edit a vote.

    All of them must fail.
  - A test checks that the card DTO has no party.
  - A test blocks imports of the deck outside `lib/deck.ts`, `scripts/` and `tests/`, and `server-only` fails the build if a client component reaches `lib/deck.ts`.

### 2. Fair rounds

- **Product reason:**
  - If every immigration card were Republican, users would be guessing from the topic, not the policy.
  - Cards that cut against type create the surprises.
  - Round 2 needs fresh cards.
- **Logic:** a seeded dealer splits the 24-card deck into two valid 12-card halves. Each half has:
  - exactly 4 cards per party;
  - no topic more than twice;
  - at least one counter-type card per party.

  Then the dealer shuffles each half's order with the same seed, so a card's position says nothing about its party. A user's rounds 1 and 2 are the two halves of their shuffle, so round 2 never repeats a card. The same seed always gives the same deal, so bugs reproduce. Later, seeding by date alone gives everyone the same daily deck.

  The split depends on the cards' IDs, parties, topics and counter-type flags. Changing any of them reshuffles every user's split, so the deck freezes at submission. Rewording a statement or a quote is safe.
- **Proof:** property tests across 1,000 seeds check:
  - every rule, for both halves;
  - that the halves are disjoint and cover the deck;
  - that the same seed gives the same deal, order included;
  - that card 1 is a counter-type card in under 40% of deals. 25% is expected; without the final shuffle it would be every deal.

### 3. Only what the answers show

- **Product reason:** an app about not being fooled can't overclaim from 12 taps. A "too close to call" verdict is also
  the reason to play round 2.
- **Logic:**
  - **Every counted answer is blind.** Each card is answered once per user, before its reveal, because the two rounds are disjoint halves and there is no third round.
    - If decks overlap later, the first answer is the one that counts.
    - An answer given after the reveal isn't blind, and labels pull votes toward your own party.
  - **Lean:** a support rate per party with an 80% Wilson interval (z = 1.2816). Unsure answers aren't counted. The *leader* is the party with the single highest support rate. The verdict is:
    - *clear* when the leader's interval sits wholly above every other party's;
    - *leaning* when there is a leader but the intervals overlap;
    - *too close to call* when two parties tie for the lead, or nothing was counted.

    A party with nothing counted has the interval [0, 1], so no leader can be clearly ahead of it. Both rounds count together. For example, 3 of 4 against 1 of 4 is *leaning*, and 4 of 4 against 0 of 4 is *clear*.
  - **Stated versus blind:** the party the user named, compared with how they voted blind.
  - **Projection:** among the cards the user supported, how many they guessed were their party's, against how many actually were.
    - Users who pick Independent or Prefer not to say are measured against the party they guessed most often for the cards they supported.
    - If two parties tie for most guessed, or the user backed nothing, the line is hidden.
  - **Guess skill:** an exact binomial test against chance (1 in 3), over every revealed guess. Getting 8 of 12 right gives p ≈ 0.019, and 13 of 24 gives p ≈ 0.028.
    - The test holds because the reveal comes at the end.
    - Under card-by-card reveal with fixed quotas, a player who only counts averages 6.1 of 12 and gets 8 or more 13.9% of the time, not 1.9%. That figure comes from simulating 200,000 rounds on 2026-10-02.
    - This is why reveal-as-you-go is cut.
  - **Most revealing card:** the first card in this round's deal order that meets all of these:
    - the user supported it;
    - they guessed it was their party's (for Independent or Prefer not to say, the party they guessed most);
    - it actually came from another party.

    If there is none, the line is hidden.
- **Proof:** table-driven tests against hand-computed cases. "Unsure" answers never change the support counts.

### 4. Neutral, sourced cards

- **Product reason:** if the wording gives the party away, the blind is broken before the first tap. If an attribution
  is wrong, the reveal lies.
- **Logic:** a Zod schema, plus deck tests that fail the build when:
  - the neutral wording contains a loaded word or name from a small list;
  - a statement isn't 8–20 words, or a quote is over 40 words;
  - average statement length differs by more than 15 characters across parties;
  - a topic that appears has cards from only one party, or has more than 4 cards;
  - a party has fewer than 2 counter-type cards;
  - a card has no section or no `https://` source;
  - the dealer can't split the deck.
- **The LLM layer:** the leak check (§ 8).

**Stretch: how others voted.** One `security definer` SQL function returns per-card crowd stats by stated party and hides
any group smaller than 5, because political opinion is special-category data.

**Not the logic:** the auth template, Zod parsing, rendering counts, and a confusion matrix on its own.

**Interview framing:** for each promise, state it, show the code that keeps it, then try to break it live.

## 7. The Research Desk

A local script (`scripts/research-desk.ts`) drafts the deck inside the timer. I approve every card.

**Sources** (probed 2026-09-29 and re-checked 2026-10-02):

| Party | Source | Extraction (word counts from 2026-10-02) |
| --- | --- | --- |
| Democratic | [2024 platform, American Presidency Project](https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform) | The `.field-docs-content` region (42,864 words) |
| Republican | [2024 platform, American Presidency Project](https://www.presidency.ucsb.edu/documents/2024-republican-party-platform) | The same method (5,374 words) |
| Libertarian | [Platform, lp.org](https://lp.org/platform/) | From "PREAMBLE" to "Join Our Newsletter" (3,446 words) |

- **The Libertarian text is the one that was in force for the 2024 election.**
  - An archived copy from 2024-12-30 (page last modified 2022-06-01) matches today's page apart from heading case, one word ("government" became "governments") and a removed historical note.
  - Cards cite the live URL. "How it works" also links the [archived copy](https://web.archive.org/web/20241230171144/https://www.lp.org/platform/).
- **lp.org's firewall blocks bare scripted requests.**
  - On 2026-10-02, a request with a `Mozilla/5.0` user agent got "Sorry, you have been blocked".
  - A full browser user agent with `Accept` and `Accept-Language` headers passes, from both Node `fetch` and curl.
- **The raw pages are saved before the timer,** in the pre-flight, as `.cache/sources/{D,R,L}.html`. They are excluded from git.
  - The script reads the cache. It fetches only when a page is missing or `--refresh` is passed.
  - Downloading isn't code; the extraction is written inside the timer.
- **Extraction:**
  - Parse the HTML with cheerio.
  - Turn block elements and `<br>` into line breaks, and let cheerio decode entities. The DNC page has 39 `&amp;`.
  - Never return partial text. The script throws on any of these:
    - a missing region or marker;
    - a "you have been blocked" page;
    - fewer than half the expected words.
- The texts stay local. The deck keeps only short quotes, section references and URLs.

**The call, once per platform.** It was type-checked and run offline against `@anthropic-ai/sdk` 0.131.0 on 2026-10-02.

- `client.beta.messages.parse` with:
  - `model: "claude-opus-5-5"`;
  - `max_tokens: 20000`;
  - `betas: ["server-side-fallback-2026-07-01"]`;
  - `fallbacks: "default"`;
  - `output_config: { effort: "high", format: betaZodOutputFormat(schema) }`, with the helper from `@anthropic-ai/sdk/helpers/beta/zod`.
- **Keep `max_tokens` under 21,333.** Above that, the SDK refuses non-streaming requests ("Streaming is required…"). Thinking counts against `max_tokens`, and Opus 5.5 can't turn thinking off.
- **Check `stop_reason` before reading `parsed_output`:**
  - `refusal`: the fallback model has already had its turn, so log `stop_details` and fail that platform loudly;
  - `max_tokens`, or `parsed_output` is null: retry once at effort `medium`, then fail loudly.
- **Log `response.model`.** It shows when a fallback model served the request.
- **Don't send `temperature`, `top_p` or `top_k`.** Opus 5.5 rejects them.
- **Keep the output schema simple:** plain strings, booleans and enums. Word limits live in the prompt and the checks.

**The prompt** lives in its own file, `scripts/prompts/desk.md`, which I write inside the timer.

- The request is "Propose 15 cards from this document."
- The fields are:
  - `statement`;
  - `quote`: one contiguous passage copied exactly, with no ellipses, 40 words at most;
  - `section`;
  - `topic`;
  - `counterType`, with a one-line reason.
- The script labels the party itself.

**Picking rules:**

- Concrete policies a person could vote on. No values statements, and no attacks on the other side.
- At least 3 of the 15 cut against the party's type.
- Cover at least 8 of the 12 topics.

**Wording rules (the neutral voice):**

1. One sentence of 8–20 words, starting with a verb: "Raise…", "End…", "Protect…".
2. No names: no people, parties or slogans.
3. Use the plainest term, never either side's loaded one: "abortion", not "pro-life" or "reproductive freedom".
4. No emotional adjectives such as "disastrous", "radical" or "common-sense".
5. Say what changes, not why. The reasons are where the spin lives.
6. Keep real specifics: numbers, dates and official program names. Write "Affordable Care Act", not "Obamacare".
7. Use one register for all three parties.

**The 12 topics:**

- taxes and spending;
- jobs and trade;
- health care;
- retirement;
- immigration;
- crime, policing and drugs;
- guns;
- energy and climate;
- education;
- defense and foreign policy;
- rights and speech;
- elections and government.

**Gates, in order:**

1. **Quote check (code):** every quote must appear word for word in the source, after normalizing quotes, dashes,
   whitespace and case.
2. **The party comes from the source.**
3. **The deck tests,** run during my review (§ 6, promise 4).
4. **My review.**
   - The Desk writes `research/candidates.json`, with the counts, the check results and which model served.
   - It also writes `research/planks.draft.ts`: the passing cards in the `Plank` shape, grouped by party, with the counter-type cards first.
   - I keep, edit or drop each card, and 24 become `content/planks.ts`.
5. **The leak check,** once the deck exists.

**Counter-type examples, verified word for word.** They were re-verified on 2026-10-02 through the planned extraction and quote check:

- **RNC, promise 14:** "FIGHT FOR AND PROTECT SOCIAL SECURITY AND MEDICARE WITH NO CUTS, INCLUDING NO CHANGES TO
  THE RETIREMENT AGE".
- **DNC, border section:** "additional border patrol agents, immigration judges, asylum officers".
- **LP, section 2.1:** "Eminent domain, civil asset forfeiture, governmental limits on profits, governmental production mandates, and governmental controls on prices of goods and services (including wages, rents, and interest) are abridgements of such fundamental rights." (32 words.)

**Later stages:** an admin page with a review queue, then the daily bill feed from Congress.gov. Bill cards are mostly
Democratic or Republican, so chance on them is 1 in 2.

## 8. The leak check (first to cut)

- **Product reason:** the rules catch loaded words from a list, not subtler cues. If a sharp reader can guess the party
  from the wording alone, so can players.
- **What it can and can't show:**
  - Claude has read these platforms.
  - Some policies give their party away however neutral the wording; "abolish the income tax" reads Libertarian.
  - So Claude is a much stronger guesser than a typical player, and above-chance accuracy on the neutral wording is expected.
  - Guessing from the policy is the game. The check is about the wording.
- **Logic:** a script (`scripts/leak-check.ts`, with its prompt in `scripts/prompts/leak-check.md`) runs before deploy, never during play. It makes the same call as the Desk, at effort `medium` with `max_tokens: 4000`.
  1. **The question:** which party's platform proposed this, and which words point to that party.
  2. **Sureness:** each card runs 5 times, and sureness is how often the most common answer came up. Claude's own stated confidence isn't used.
  3. **Accuracy:** the share of cards where Claude's most common answer was right. A tie counts as a miss.
  4. **Chance:** 1 in 3.
     - With 24 cards, 13 or more right happens by luck 2.8% of the time.
     - That line means "guessable beyond chance", whether from the policy, the wording or both. On its own, it doesn't mean the wording leaks.
  5. **Original versus neutral:** each card also runs on the original quote. The drop between the two versions is how much spin the rewrite removed, and it's the number that judges the wording.
- **Action:** rewrite a card when Claude's answer is right with 4 or more of 5 runs agreeing, and its cues are words rather than the policy. The cues are Claude's own account, so they're a hint rather than proof. I decide.
- **Known limits, stated in the README:**
  - the same model family wrote the wording and tested it;
  - a panel of people would be the real test.
- **Output:** a report in `evals/`, summarized in README §7 and on "How it works".
- **Cost:** about 20 minutes to build, and 240 short calls per run. A full run of both scripts costs about $10.

## 9. Edge cases and tests

**Edge cases**

While playing:

- **Refreshing or closing mid-round** resumes at the first unanswered card.
- **A double tap, or answering in two tabs:** the second answer is refused, and the app moves on.
- **Starting a new round with one unfinished** sends the user back to the unfinished one.
- **Two "start" requests at once:** the one-unrevealed-round index refuses the second, which goes to the first.
- **All "Unsure":** "Too close to call — you marked everything Unsure." A tie is also "too close to call".
- **After round 2:** "You've seen the whole deck", with a link to the results. There is no third round.

Reveal and results:

- **Refreshing on the reveal** gives the same result.
- **A forced reveal with a card unanswered** is refused, and the user goes back to that card.
- **Independent or Prefer not to say:** the projection line uses the party the user guessed most often. If they backed
  nothing, or two parties tie, the line is hidden.
- **Someone else's round URL** shows a 404.
- **Results open in another tab during round 2** use revealed rounds only, so they show nothing about round 2.

Accounts:

- **Clearing cookies as a guest** loses the results. The "Save results" prompt warns about this.
- **An email that already has an account** gets "sign in instead".
- **Signing in from a guest session** switches accounts. The guest's rounds stay with the guest, because v1 has no merging.
- **No session on a game page** sends the visitor back to the landing page.
- **Bots:** rate limits now, a CAPTCHA later.

Build time:

- **A response that doesn't parse** gets one retry at a lower effort, then that platform fails loudly.
- **A quote that isn't word for word in the source** is dropped and logged.
- **A source site that blocks or is down:** the script uses the cached page, or stops loudly if there is none. It never produces half a deck.
- **A party with fewer than 8 approved cards** fails the deck tests, and nothing ships. Rerun that party for more candidates.
- **If the leak check can't run,** it is skipped, and the README says so.

**Tests: each one tries to break a promise**

| Promise | Test | Type |
| --- | --- | --- |
| 1. No peeking, no take-backs | Two anonymous test users, deleted at the end. B can't read A's rows. Nobody can create a round, answer outside their round, answer as someone else, answer twice, answer after the reveal, or edit or delete an answer. The reveal fails at 11 answers and works at 12, and calling it again returns the same stamp. The card DTO has no party. Only `lib/deck.ts`, `scripts/` and `tests/` import the deck | Database and unit |
| 2. Fair rounds | Across 1,000 seeds, both halves: 12 cards, 4 per party, no topic more than twice, a counter-type card per party. The halves are disjoint and cover the deck. The same seed gives the same deal, order included. Card 1 is a counter-type card in under 40% of deals | Property (fast-check) |
| 3. Only what the answers show | Hand-worked cases: clear, leaning, a tie, all Unsure, and a party with nothing counted. 8 of 12 guesses right gives p ≈ 0.019, and 13 of 24 gives p ≈ 0.028. The projection fallbacks and ties. No most revealing card | Unit, table-driven |
| 4. Neutral, sourced cards | 24 cards, 8 per party, at least 2 counter-type cards per party. No loaded words or names. Statements of 8–20 words and quotes of at most 40. Similar lengths across parties. Every topic that appears comes from at least 2 parties and has no more than 4 cards. A section and source on every card. The dealer can split the deck | Deck, on every test run |

**The manual smoke test on prod (1:45–2:00):**

- "How it works" loads without a session.
- Round 1 plays from start to reveal.
- Round 2 has none of round 1's cards, and then "You've seen the whole deck" appears.
- A refresh mid-round resumes.
- Another browser's round URL shows a 404.
- After saving, the header shows "Sign out", and the results appear after signing in on a second browser.
- The page source has no party labels before the reveal.

**Time budget:**

| Slot | Tests |
| --- | --- |
| 0:10–0:20 | The three minimum database checks |
| 0:30–0:55 | The dealer test and the deck-boundary tests |
| 0:55–1:10 | The deck tests, which Claude writes while I review cards |
| 1:10–1:35 | The verdict tests |
| If time allows | The remaining database tests |

## 10. Two-hour schedule

The Research Desk script runs on its own while I build the game against 24 generated placeholder cards, which
never ship. The review happens once the game works.

| Clock | Work | Done means |
| --- | --- | --- |
| 0:00–0:10 | Scaffold from `with-supabase` in `~/Documents/github/`. Copy in `CLAUDE.md` and the saved pages. Create the Supabase project (US East) with anonymous sign-ins on, email confirmation off and the anonymous rate limit raised. Push and deploy, then set the Site URL and redirect URLs | Sign-in works on the Vercel URL |
| 0:10–0:20 | Tables, privileges, RLS, insert-only answers, and `reveal_round()` | User A can't read user B's rows, and nobody can answer after the reveal |
| 0:20–0:30 | Write the Research Desk script and start it. Its first summary line (Libertarian) appears by about 0:33 | It runs unattended and writes `candidates.json` |
| 0:30–0:55 | Game loop on the placeholder cards: the dealer and its property test, the deck boundary, route access, the screens, the server actions and the reveal gate. Meanwhile I write the loaded-word list and the landing words | A full round works locally |
| 0:55–1:10 | Review the drafts and approve 24 cards (8 per party, at least 2 counter-type each) while Claude writes the deck tests and the bare results page | **MVP line: a full round works on prod with the real deck, ending on the card-by-card reveal** |
| 1:10–1:35 | Results: the verdict engine, the findings, round 2, save, sign in and out, share, and the words for "How it works" | The verdict tests are green |
| 1:35–1:45 | The leak check and its report | First thing to cut |
| 1:45–2:00 | The prod smoke test and the README. Stop | |

**Cut order when behind** (the first item goes first):

1. the leak check;
2. the guess-skill stat;
3. the projection line and the most revealing card;
4. the dealer's constraints, falling back to a plain seeded shuffle split in two.

**Clock checks,** decided now so they aren't decided under pressure:

- **0:33:** if there's no Libertarian line in `research/desk.log`, or there's an error, fix the Desk before going on.
- **1:15:** if the MVP isn't on prod, cut the leak check now.
- **1:35:** if the verdict tests aren't green, cut the guess-skill stat, then the projection line and the most revealing card.
- **1:45:** stop feature work, whatever state it's in. Only the smoke test and the README remain.

**Never cut:** sign-in, route access, the blind rules, the quote check, the card-by-card reveal, the honest verdict, the
deploy, the README.

**Tight slots:**

- **0:20–0:30:** the Desk script and its prompt. If it slips, the game-loop slot absorbs it.
- **0:55–1:10:** reviewing 24 cards takes about 40 seconds each. That's why the loaded-word list is already written by then, and why Claude writes the deck tests and the bare results page in parallel.

**Disclosure for the submission note.** These were prepared in advance:

- the concept, this spec and the plan;
- the repo's `CLAUDE.md`;
- the choice of sources and the source probe of 2026-09-29;
- the pre-flight review of 2026-10-02 and its probes: the template layout, the SDK call run offline, Supabase Auth's behavior read from its source, and source access and extraction;
- the counter-type checks;
- the raw platform pages, saved before the timer.

The code, the deck and the shipped copy were written inside the timer.

## 11. README outline and submission note

| # | Section | What goes in it | When it's written |
| --- | --- | --- | --- |
| 1 | Blind Ballot | A one-line pitch, the live link, and "no sign-up, about 3 minutes" | 0:00–0:10 |
| 2 | Why I built it | 3–4 sentences in my words, the same text as the landing page | Task 4 |
| 3 | What works | A checklist, checked against the smoke test | 1:45–2:00 |
| 4 | What's incomplete | Whatever got cut, plus the known limits: 24 cards make 2 rounds; reveal-as-you-go is out, and why; only the 2024-cycle platforms; no crowd stats; no password reset, which needs a custom SMTP server; signing in from a guest session doesn't merge its rounds | 1:45–2:00 |
| 5 | Run it locally | Node 22; `.env.example`; the migration; anonymous sign-ins; `npm run dev`; `npm test`; `npm run test:db` | 0:10–0:20 |
| 6 | How it works | The four promises, one line each, with the file that enforces each | As built |
| 7 | Where Claude fits, and where it doesn't | The Desk's funnel and which model served. The leak-check results against chance and against the original wording, with their limits. The rule that Claude never decides a party and never runs in the live app | 0:55–1:10 and 1:35–1:45 |
| 8 | Tests | What each test proves, and how to run them | As written |
| 9 | Disclosure | Prepared in advance versus written in the 2 hours; the AI tools used | 1:45–2:00 |
| 10 | What I'd build next | The seams in § 12 | 1:45–2:00 |

**Rules:**

- **It grows during the build.** The skeleton goes in at 0:00. The last slot only updates the status and adds the
  disclosure.
- **Lead with the product, not the AI.**

**The Ashby note** is five lines: the live link, the repo link, a pointer to the README, and the one-line disclosure.

## 12. Seams: what grows next

| Seam in v1 | What it grows into |
| --- | --- |
| `source` (a platform section today) | A daily bill from Congress.gov, drafted by the Research Desk and graded by the leak check. This is the daily-use version |
| `answers` across users | Crowd stats per card, with small groups hidden. This is Cohen's study running live |
| One blind answer per card | Blind versus labelled: answer a card blind, then again after its reveal. The change is Cohen's experiment run on the user. The first answer stays the one that counts |
| Reveal at the end | Reveal-as-you-go, which needs a per-round mode, guess stats that leave those rounds out, and rounds without fixed party quotas |
| `Party = 'D' \| 'R' \| 'L'` | More parties, or other countries in the style of Wahl-O-Mat |
| Topic tags | Results on two axes, economic and social: the Nolan chart, drawn by LP co-founder David Nolan |
| The `quote` field (the original wording) | A framing module that shows one plank as each side would sell it |
| The reveal screen | A per-card "this seems slanted" flag, reviewed like the leak check |
| The blind engine | Other decks: music (Blindfold), headlines, art |
| The Research Desk script | An admin page with a review queue |
| The leak-check script | The quality gate for LLM-written summaries |

## 13. Risks

- **Wrong attributions break the premise.** The party comes from the source, every quote is checked word for word, and
  every card cites its section.
- **Neutral wording can leak or slant.** The wording rules, the original wording shown at the reveal, and the leak check all guard against it.
- **Evaluators bring their own politics.** Keep the deck symmetric, put a source on every card, add a method note, and
  don't editorialize.
- **Overclaiming.** Report counts, with a small-sample caveat.
- **Source access.** lp.org's firewall blocks some scripted requests. The raw pages are saved before the timer, and the scripts fetch with browser headers.
- **Email.** Supabase's built-in mailer reaches only the project team, so no v1 flow sends email.
- **Timebox.** Everything prepared in advance is disclosed. The code and the copy are written in the timer.
- **"Every day?"** v1 is a quiz. The daily habit arrives with the bill feed.
