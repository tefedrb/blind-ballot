import { notFound, redirect } from "next/navigation";
import { revealRound } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { nextCard } from "@/lib/next-step";
import { getRound } from "@/lib/player";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

export default async function RevealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const round = await getRound(id);
  if (!round) notFound();
  if (round.revealed_at) redirect(`/round/${id}/results`);
  // Cards still to answer: the page would be lying, so go back to them.
  if (nextCard(round.plank_ids, round.answers.map((a) => a.plank_id))) redirect(`/round/${id}`);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-12 text-center">
      <p className="text-2xl font-semibold">All 12 answers are locked. Ready?</p>
      <form action={revealRound.bind(null, id)}>
        <Button size="lg" className="h-12 w-full text-base">
          Reveal
        </Button>
      </form>
    </main>
  );
}
