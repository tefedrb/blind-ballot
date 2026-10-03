import Link from "next/link";
import { redirect } from "next/navigation";
import { startRound } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { StatedParty } from "@/content/schema";
import { STATED_PARTY_NAMES } from "@/lib/labels";
import { nextStep } from "@/lib/next-step";
import { getPlayerState } from "@/lib/player";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

const BIG = "h-12 w-full text-base";
const STATED_PARTIES = Object.keys(STATED_PARTY_NAMES) as StatedParty[];

export default async function StartPage() {
  const step = nextStep(await getPlayerState());
  if (step.kind === "resume") redirect(`/round/${step.roundId}`);

  if (step.kind === "deck-done") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
        <h1 className="text-2xl font-semibold">You&apos;ve seen the whole deck</h1>
        <Button asChild size="lg" className={BIG}>
          <Link href={`/round/${step.roundId}/results`}>Your results</Link>
        </Button>
      </main>
    );
  }

  if (step.kind === "choose-party") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Which party do you identify with?</h1>
          <p className="text-sm text-muted-foreground">
            Only you see this; we compare it with how you vote blind.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {STATED_PARTIES.map((party) => (
            <form key={party} action={startRound.bind(null, party)}>
              <Button variant="outline" size="lg" className={BIG}>
                {STATED_PARTY_NAMES[party]}
              </Button>
            </form>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-12">
      {/* Bound to undefined: as a bare form action, startRound would get the form data. */}
      <form action={startRound.bind(null, undefined)}>
        <Button size="lg" className={BIG}>
          Deal round {step.round}
        </Button>
      </form>
    </main>
  );
}
