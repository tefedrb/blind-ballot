import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startRound } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { Party, StatedParty } from "@/content/schema";
import { allPlanks } from "@/lib/deck";
import { PARTY_NAMES, STATED_PARTY_NAMES, VOTE_NAMES } from "@/lib/labels";
import { nextStep, type NextStep } from "@/lib/next-step";
import { getPlayerState, getRevealedAnswers, getRound } from "@/lib/player";
import { type Results, resultsFor } from "@/lib/results";
import { shareLine } from "@/lib/share";
import { createClient } from "@/lib/supabase/server";
import type { Lean } from "@/lib/verdict";
import { ShareButton } from "./share-button";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

const BIG = "h-12 w-full text-base";
const PARTIES = Object.keys(PARTY_NAMES) as Party[];

// The share line links to the production home page, never to a round.
const HOME_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/`
  : "http://localhost:3000/";

// "the Democrats", "the Republicans", "the Libertarians".
const plural = (p: Party) => `the ${PARTY_NAMES[p]}s`;
const cards = (n: number) => (n === 1 ? "1 card" : `${n} cards`);

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const round = await getRound(id);
  if (!round) notFound();
  // The parties stay hidden until the round is revealed.
  if (!round.revealed_at) redirect(`/round/${id}`);

  const supabase = await createClient();
  const [answers, state, { data }] = await Promise.all([
    getRevealedAnswers(),
    getPlayerState(),
    supabase.auth.getClaims(),
  ]);
  // Every player names a party before round 1 (lib/next-step.ts).
  const statedParty = state.statedParty ?? "none";
  const results = resultsFor(answers, allPlanks(), statedParty, round.plank_ids);
  const { right, total } = results.guesses;
  const line = shareLine({ lean: results.lean, right, total, homeUrl: HOME_URL });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-10 px-4 py-8">
      <Headline results={results} />
      <Findings results={results} statedParty={statedParty} />
      <CardByCard results={results} />
      <Actions step={nextStep(state)} guest={data?.claims.is_anonymous === true} line={line} />
    </main>
  );
}

// The verdict with its confidence, then the support counts behind it.
function Headline({ results: { lean, support } }: { results: Results }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{verdictWords(lean)}</h1>
        <p className="text-sm text-muted-foreground">{confidenceWords(lean)}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {PARTIES.map((p) => {
          const { supported, counted } = support[p];
          return (
            <li key={p} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>{PARTY_NAMES[p]} cards</span>
                <span>{counted ? `Supported ${supported} of ${counted}` : "None counted"}</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded bg-foreground"
                  style={{ width: `${counted ? (100 * supported) / counted : 0}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">Unsure answers aren&apos;t counted.</p>
    </section>
  );
}

function verdictWords(lean: Lean): string {
  if (lean.verdict === "too_close") {
    return lean.reason === "all_unsure"
      ? "Too close to call — you marked everything Unsure."
      : "Too close to call.";
  }
  const most = `Blind, you voted most like ${plural(lean.leader)}`;
  return lean.verdict === "clear" ? `${most}.` : `${most}, but it's not clear yet.`;
}

function confidenceWords(lean: Lean): string {
  if (lean.verdict === "too_close") {
    return lean.reason === "tie"
      ? "Your support is tied at the top."
      : "Unsure answers aren't counted, so there's nothing to compare yet.";
  }
  return lean.verdict === "clear"
    ? "Clear: your support for their cards is above the other parties' by more than chance would explain."
    : "Leaning: their cards got your highest support, but not by enough to rule out chance.";
}

function Findings({
  results: { lean, projection, guesses, mostRevealing },
  statedParty,
}: {
  results: Results;
  statedParty: StatedParty;
}) {
  const measured = statedParty === "I" || statedParty === "none";

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">What your answers show</h2>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">You said</dt>
        <dd>{STATED_PARTY_NAMES[statedParty]}</dd>
        <dt className="text-muted-foreground">Blind</dt>
        <dd>
          {lean.verdict === "too_close" ? "Too close to call" : `Most like ${plural(lean.leader)}`}
        </dd>
      </dl>

      {projection && (
        <p>
          Of the {cards(projection.supported)} you supported, you guessed {projection.assumed} came
          from {plural(projection.party)}
          {measured && ", the party you guessed most"}. {projection.actual} did.
        </p>
      )}

      <p>
        You guessed the party right on {guesses.right} of {guesses.total} cards. Guessing at random
        gets about {guesses.total / 3}. The chance of {guesses.right} or more by luck alone:{" "}
        {guesses.p < 0.01 ? "under 1%" : `${Math.round(guesses.p * 100)}%`}.
      </p>

      {mostRevealing && (
        <p>
          <span className="font-semibold">Most revealing card: </span>
          you supported &ldquo;{mostRevealing.plank.statement}&rdquo; and guessed it came from{" "}
          {plural(mostRevealing.guess)}. It came from {plural(mostRevealing.plank.party)}.
        </p>
      )}
    </section>
  );
}

// This round's 12 cards, in deal order, with each party's own words.
function CardByCard({ results }: { results: Results }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Card by card</h2>
      <ol className="flex flex-col gap-4">
        {results.rows.map(({ plank, vote, guess }, i) => (
          <li key={plank.id} className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Card {i + 1}</span>
              <span>{plank.topic}</span>
            </div>
            <p className="font-medium">{plank.statement}</p>
            <p className="font-semibold">{PARTY_NAMES[plank.party]}</p>
            <blockquote className="border-l-2 pl-3 text-sm">
              <span className="text-muted-foreground">As they put it: </span>
              <span className="italic">“{plank.quote}”</span>
            </blockquote>
            <a
              href={plank.source.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline underline-offset-4"
            >
              Source: {plank.source.section}
            </a>
            <p className="text-sm">
              You: {VOTE_NAMES[vote]} · guessed {PARTY_NAMES[guess]}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Actions({ step, guest, line }: { step: NextStep; guest: boolean; line: string }) {
  return (
    <section className="flex flex-col gap-3">
      {/* A revealed round exists, so a deal here is always round 2. Bound to
          undefined: as a bare form action, startRound would get the form data. */}
      {step.kind === "deal" && (
        <form action={startRound.bind(null, undefined)}>
          <Button size="lg" className={BIG}>
            Play round 2
          </Button>
        </form>
      )}
      {step.kind === "resume" && (
        <Button asChild size="lg" className={BIG}>
          <Link href={`/round/${step.roundId}`}>Finish your round</Link>
        </Button>
      )}
      {step.kind === "deck-done" && (
        <p className="text-center font-semibold">You&apos;ve seen the whole deck.</p>
      )}
      {guest && (
        <>
          <Button asChild variant="outline" size="lg" className={BIG}>
            <Link href="/save">Save results</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            As a guest, your results live in this browser. Clearing its cookies loses them.
          </p>
        </>
      )}
      <ShareButton line={line} />
    </section>
  );
}
