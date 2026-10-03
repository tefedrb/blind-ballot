import { notFound, redirect } from "next/navigation";
import { getPlank } from "@/lib/deck";
import { PARTY_NAMES, VOTE_NAMES } from "@/lib/labels";
import { getRound } from "@/lib/player";

// Every player sees their own state, so this page reads the session and renders
// per request instead of prerendering (Cache Components).
export const instant = false;

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const round = await getRound(id);
  if (!round) notFound();
  // The parties stay hidden until the round is revealed.
  if (!round.revealed_at) redirect(`/round/${id}`);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Card by card</h1>
      <ol className="flex flex-col gap-4">
        {round.plank_ids.map((plankId, i) => {
          const plank = getPlank(plankId);
          const answer = round.answers.find((a) => a.plank_id === plankId);
          // The database reveals a round only once every card is answered.
          if (!answer) throw new Error(`Round ${id} has no answer for ${plankId}`);

          return (
            <li key={plankId} className="flex flex-col gap-2 rounded-lg border p-4">
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
                You: {VOTE_NAMES[answer.vote]} · guessed {PARTY_NAMES[answer.guess]}
              </p>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
