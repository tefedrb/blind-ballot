# Blind Ballot

Twelve promises to voters, with the party labels removed. Say whether you'd support each one, and guess who proposed it. Then see who you actually agree with.

**Live:** https://blind-ballot.vercel.app (no sign-up, about 3 minutes)

## Why I built it

Party labels change how people judge a policy. In Geoffrey Cohen's 2003 study "Party over Policy", people backed whichever welfare policy their own party endorsed, whatever it said, and denied that the label had swayed them. Blind Ballot takes the label off, so you judge the policy itself. At the end, you see each party's own words.

## What works

Checked on prod in a fresh incognito window on 3 October 2026:

- [x] Start as a guest, with no sign-up, and name your party, or choose Independent or Prefer not to say.
- [x] Round 1 deals 12 cards, 4 from each party. For each card: Support, Oppose or Unsure, then a guess at who proposed it.
- [x] Refreshing mid-round resumes at the first unanswered card.
- [x] After the reveal, the results show the verdict (clear, leaning or too close to call), support per party, your guesses against luck, the projection line and the most revealing card.
- [x] Card by card, the results show each card's party and the platform's own words, with its section and a link to the source.
- [x] Round 2 deals the other 12 cards. The results count both rounds, then say "You've seen the whole deck".
- [x] Share copies a line with your totals and your lean, and nothing else.
- [x] Save results adds an email and a password to the guest account. Signing in on another browser shows the same results.
- [x] Someone else's round URL gives a 404.
- [x] During a round, the page source contains no party.
- [x] `/how-it-works` covers the sources, the wording rules, how results are worked out, the leak check and privacy.
- [x] `npm test` (143 tests) and `npm run test:db` (6 database checks) pass.

## What's incomplete

- **The leak check's card-by-card review.** The check flagged 21 of the 24 cards (see "Where Claude fits, and where it doesn't"). Their cues haven't yet been sorted into wording and policy, so no card has been rewritten because of the check. The deck ships as I approved it.
- **Two rounds per player.** 24 cards make two rounds of 12. After that, the deck is done until more cards arrive.
- **The reveal comes at the end of a round.** Each round has 4 cards per party, so revealing card by card would let you count your way to the last guesses, and the comparison with luck would no longer hold.
- **Only the 2024 platforms.**
- **No crowd stats.** You see your own answers, not how other players answered each card.
- **No password reset.** It needs email, and Supabase's built-in mailer reaches only the project team. A custom SMTP server would fix it.
- **Signing in from a guest session doesn't merge rounds.** The guest's rounds stay with the guest account.
- **Small samples.** A round has 4 cards per party, so a verdict rests on few answers. The 80% intervals and "too close to call" say so, but a verdict is a sketch, not a measurement.

## Run it locally

You need Node 22 and a Supabase project.

1. Install: `npm install`.
2. Copy `.env.example` to `.env.local`, and fill in the Supabase URL, the publishable key and the secret key. The Anthropic key is only for the scripts in `scripts/`; the app runs without it.
3. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`.
4. In Supabase's Authentication settings, turn on anonymous sign-ins and turn off "Confirm email".
5. Run the app: `npm run dev`, then open http://localhost:3000.

Tests:

- `npm test` runs the unit and deck tests. They need no network.
- `npm run test:db` runs the database checks against your Supabase project. They create two guest users and delete them at the end.

## How it works

The app keeps four promises. Each line names the files that enforce it:

1. **No peeking, no take-backs.** The browser only ever gets a card's ID, statement and topic, never its party (`lib/deck.ts`, which is `server-only`). The database makes answers insert-only, one per card, and reveals a round only once all 12 cards are answered (`supabase/migrations/0001_init.sql`).
2. **Fair rounds.** A seeded shuffle splits the deck into two rounds of 12 for each player: 4 cards per party, no topic more than twice, and a card per party that cuts against its type (`lib/dealer.ts`).
3. **Only what your answers show.** The verdict, the guess score and the projection come from revealed rounds only, with Unsure answers left out (`lib/verdict.ts`, `lib/results.ts`).
4. **Neutral, sourced cards.** Every quote is checked word for word against its source (`scripts/lib/quote-check.ts`), and the deck tests enforce the wording and balance rules on every test run (`tests/deck.test.ts`).

## Calls I made

- **Platforms, not bills.** No Libertarian sits in Congress, so bills can't speak for all three parties. Bills are the daily version, later.
- **The reveal waits for the end of the round.** Each round has exactly 4 cards per party, so revealing card by card lets the later guesses be made by elimination. I simulated 200,000 rounds with a player who ignores the wording and only counts what's left: they averaged 6.1 of 12, and scored 8 or more 13.9% of the time, against 1.9% by luck.
- **Every counted answer is blind.** Each card is answered once, before its reveal, so a label never pulls a vote that counts. That's why there are two rounds and no third.
- **Claude never decides a party.** A card's party is the platform it came from, and every quote must appear word for word in that platform.
- **Three counter-type cards per party.** The obvious guess isn't always right, and the surprises don't lean toward one party.
- **The leak check judges the wording by the drop, not by accuracy.** Claude knows these platforms, and some policies give their party away however plainly they're worded, so accuracy above chance proves nothing on its own.
- **No flow sends email.** Saving results adds an email and a password to the guest account without sending a message, because Supabase's built-in mailer reaches only the project team.

The calls made during the build, with the options and my reasons, are in `docs/plans/judgment-calls.md`.

## Where Claude fits, and where it doesn't

Claude never runs in the live app, and it never decides a card's party. It drafts the deck offline, in the Research Desk (`scripts/research-desk.ts`). The Desk gives Claude one party's platform and asks for 15 cards from it. The script labels each card with the party of the platform it came from. It keeps a card only if its quote appears word for word in the source and runs to 40 words at most.

From the 45 drafts, 24 cards were chosen: 8 per party, 3 of them against the party's type. Seven statements were reworded to meet the wording rules, and the quotes are untouched. I reviewed and approved each card.

| Party | Source | Proposed | Passed the quote check | Approved | Model that served |
| --- | --- | --- | --- | --- | --- |
| Democratic | [2024 platform](https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform) | 15 | 15 | 8 | Claude Opus 5.5 (`claude-opus-5-5`) |
| Republican | [2024 platform](https://www.presidency.ucsb.edu/documents/2024-republican-party-platform) | 15 | 15 | 8 | Claude Opus 5.5 (`claude-opus-5-5`) |
| Libertarian | [Platform in force for 2024](https://lp.org/platform/) | 15 | 15 | 8 | Claude Opus 5.5 (`claude-opus-5-5`) |

Every call ran at effort `high`, and none fell back to another model. The full record is in `research/candidates.json` and `research/desk.log`.

The leak check (`scripts/leak-check.ts`) tests the wording. It asks Claude which party's platform proposed each card: five times from the neutral statement, then five times from the original quote. That's 240 calls, run by hand before deploy, at effort `medium`. The answers never set a card's party.

| Version | Right | Accuracy | Chance of doing as well by luck |
| --- | --- | --- | --- |
| Neutral statement | 21/24 | 88% | < 0.001 |
| Original quote | 24/24 | 100% | < 0.001 |

Accuracy above chance on the statements was expected. Claude has read these platforms, and some policies give their party away however plainly they're worded: "repeal the federal income tax" reads Libertarian. The number that judges the wording is the drop from the quotes to the statements: 13 points. Claude missed 3 cards from the statement and placed all 3 from the quote: card-03, card-06 and card-19, all counter-type cards.

The other 21 cards are flagged: right from the statement, with at least 4 of 5 runs agreeing. Their cues mostly restate the policy, such as "Raise the federal minimum wage". Sorting wording cues from policy cues is under "What's incomplete". The full results are in `evals/leak-report.md`, and every answer is in `evals/leak-report.json`.

The run on 3 October 2026 used 123,830 input tokens and 21,014 output tokens, thinking included: $0.92 at Opus 5.5's list prices. Claude Opus 5.5 served every call, and none needed a retry.

The limits:

- the same model family wrote the statements and tested them;
- the cues are Claude's own account, a hint rather than proof;
- a panel of people would be the real test.

## Tests

`npm test` runs everything except the database checks, with no network. `npm run test:db` runs the database checks against your Supabase project. Each test tries to break a promise:

| Promise | What the tests try | Files |
| --- | --- | --- |
| 1. No peeking, no take-backs | One user reads or answers in another's round; answering after the reveal; editing or deleting an answer; revealing with 11 answers; a third round. A party in the card sent to the browser, and deck imports outside `lib/deck.ts`, `scripts/` and `tests/` | `tests/db/rls.test.ts`, `tests/deck-dto.test.ts`, `tests/deck-imports.test.ts` |
| 2. Fair rounds | Across 1,000 seeds: 12 cards and 4 per party in each round, no topic more than twice, a counter-type card per party, two rounds that never overlap and cover the deck, the same deal for the same seed, and card 1 a counter-type card in under 40% of deals | `tests/dealer.test.ts` (property tests, fast-check) |
| 3. Only what your answers show | Hand-worked cases: clear, leaning, a tie, all Unsure. 8 of 12 guesses right gives p ≈ 0.019, and 13 of 24 gives p ≈ 0.028. The projection's fallbacks and ties, and no most revealing card | `tests/verdict.test.ts`, `tests/results.test.ts` |
| 4. Neutral, sourced cards | 24 cards, 8 per party, at least 2 counter-type cards per party. No loaded words or names. Statements of 8–20 words, quotes of at most 40, and similar lengths across parties. Every topic from at least 2 parties, with at most 4 cards. A section and a source on every card. A quote that isn't in the source is dropped | `tests/deck.test.ts`, `tests/quote-check.test.ts`, `tests/candidates.test.ts` |

The rest cover the plumbing: route access, where to send a player next, the share line, the save form, text extraction from the platform pages, the leak check's summary, and a check that the game's rules import no framework or I/O code.

## Disclosure

**Prepared in advance:**

- the spec and the build plan, in `docs/plans/`;
- the accounts: GitHub, Vercel, a Supabase project, and an Anthropic API key with prepaid credits;
- the three platform pages, saved locally, because lp.org blocks some scripted requests;
- checks that the Claude call shape works, that Supabase can upgrade a guest to an email account, that the sources can be read, and that the statistics in the test tables are right.

**Written during the build:** Claude Code (Claude Opus 5.5) ran the scaffold and wrote the code, the tests, the scripts and the copy. It picked the 24 cards from the Research Desk's drafts and reworded seven statements. I reviewed and approved each piece. I applied the database migration, changed the Supabase and Vercel settings, made the cut calls and ran the smoke test.

**AI tools:** Claude Code, with Claude Opus 5.5. Claude Opus 5.5 also runs in two offline scripts, through the API: the Research Desk and the leak check. The live app never calls Claude.

## What I'd build next

- **A daily bill.** One bill a day from Congress.gov, drafted by the Research Desk and graded by the leak check. This is the version people would come back to.
- **Crowd stats per card,** with small groups hidden. That's Cohen's study running live.
- **Blind versus labelled.** Answer a card blind, then again after its reveal. The first answer stays the one that counts.
- **The leak check's review,** then a "this seems slanted" flag on each card, reviewed the same way.
- **Results on two axes,** economic and social: the Nolan chart, drawn by LP co-founder David Nolan.
- **An admin page** with a review queue for the Desk's drafts.
