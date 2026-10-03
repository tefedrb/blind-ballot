# Blind Ballot

**Live:** https://blind-ballot.vercel.app

## Why I built it

Party labels change how people judge a policy. In Geoffrey Cohen's 2003 study "Party over Policy", people backed whichever welfare policy their own party endorsed, whatever it said, and denied that the label had swayed them. Blind Ballot takes the label off, so you judge the policy itself. At the end, you see each party's own words.

## What works

## What's incomplete

- **The leak check's card-by-card review.** The check flagged 21 of the 24 cards (see "Where Claude fits, and where it doesn't"). Their cues haven't yet been sorted into wording and policy, so no card has been rewritten because of the check. The deck ships as I approved it.

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

## Disclosure

## What I'd build next
