# Blind Ballot

**Live:** https://blind-ballot.vercel.app

## Why I built it

Party labels change how people judge a policy. In Geoffrey Cohen's 2003 study "Party over Policy", people backed whichever welfare policy their own party endorsed, whatever it said, and denied that the label had swayed them. Blind Ballot takes the label off, so you judge the policy itself. At the end, you see each party's own words.

## What works

## What's incomplete

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

## Tests

## Disclosure

## What I'd build next
