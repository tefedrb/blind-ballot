import { notFound, redirect } from "next/navigation";
import { getPlank, toCard } from "@/lib/deck";
import { nextCard } from "@/lib/next-step";
import { getRound } from "@/lib/player";
import { CardForm } from "./card-form";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

export default async function RoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const round = await getRound(id);
  if (!round) notFound();

  const next = nextCard(
    round.plank_ids,
    round.answers.map((a) => a.plank_id),
  );
  if (!next) redirect(`/round/${id}/reveal`);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      {/* The key gives each card a fresh form. Only toCard() crosses to the browser. */}
      <CardForm
        key={next.plankId}
        roundId={id}
        card={toCard(getPlank(next.plankId))}
        number={next.number}
        total={round.plank_ids.length}
      />
    </main>
  );
}
