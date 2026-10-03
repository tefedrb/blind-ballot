# Blind Ballot

**Live:** https://blind-ballot.vercel.app

## Why I built it

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

## Tests

## Disclosure

## What I'd build next
