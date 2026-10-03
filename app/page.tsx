import Link from "next/link";
import { beginAnonymous } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { nextStep, type NextStep } from "@/lib/next-step";
import { getPlayerState } from "@/lib/player";
import { createClient } from "@/lib/supabase/server";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

const BIG = "h-12 w-full text-base";

export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const state = user ? await getPlayerState() : null;
  const step = state ? nextStep(state) : null;
  const latestRevealed = state?.revealedRoundIds.at(-1);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Blind Ballot</h1>
        <p className="text-lg">
          Twelve promises to voters, with the party labels removed. Say whether you&apos;d support
          each one, and guess who proposed it. Then see who you actually agree with.
        </p>
      </div>

      <SampleCard />

      <div className="flex flex-col gap-3">
        <PrimaryAction step={step} />
        {latestRevealed && step?.kind !== "deck-done" && (
          <Link href={`/round/${latestRevealed}/results`} className="text-center underline">
            Your results
          </Link>
        )}
        {!user && (
          <p className="text-center text-sm text-muted-foreground">No sign-up. About 3 minutes.</p>
        )}
      </div>

      <section className="flex flex-col gap-2 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">Why</h2>
        <p>
          Party labels change how people judge a policy. In Geoffrey Cohen&apos;s 2003 study
          &ldquo;Party over Policy&rdquo;, people backed whichever welfare policy their own party
          endorsed, whatever it said, and denied that the label had swayed them. Blind Ballot takes
          the label off, so you judge the policy itself. At the end, you see each party&apos;s own
          words.
        </p>
      </section>
    </main>
  );
}

// One button, for wherever the player is (lib/next-step.ts).
function PrimaryAction({ step }: { step: NextStep | null }) {
  if (step?.kind === "resume") {
    return (
      <Button asChild size="lg" className={BIG}>
        <Link href={`/round/${step.roundId}`}>Finish your round</Link>
      </Button>
    );
  }
  if (step?.kind === "deck-done") {
    return (
      <Button asChild size="lg" className={BIG}>
        <Link href={`/round/${step.roundId}/results`}>Your results</Link>
      </Button>
    );
  }
  // A new visitor, a player choosing a party, or one ready for round 2.
  // beginAnonymous signs in a new visitor, then goes to /start.
  return (
    <form action={beginAnonymous}>
      <Button size="lg" className={BIG}>
        {step?.kind === "deal" && step.round === 2 ? "Play round 2" : "Start"}
      </Button>
    </form>
  );
}

// The shape of the game, face down: no policy on it.
function SampleCard() {
  return (
    <div
      aria-hidden
      className="flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted"
    >
      <span className="text-5xl font-bold text-muted-foreground">?</span>
      <span className="text-sm text-muted-foreground">Card 1 of 12</span>
    </div>
  );
}
