import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works · Blind Ballot" };

// The method note (spec § 3, screen 6): static and public. The links are
// copied from scripts/lib/platforms.ts, so Play doesn't import the Desk.
const SOURCES = [
  {
    party: "Democratic",
    name: "2024 platform",
    url: "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform",
    host: "American Presidency Project",
  },
  {
    party: "Republican",
    name: "2024 platform",
    url: "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform",
    host: "American Presidency Project",
  },
  {
    party: "Libertarian",
    name: "platform in force for the 2024 election",
    url: "https://lp.org/platform/",
    host: "lp.org",
  },
];

const ARCHIVED_LP = "https://web.archive.org/web/20241230171144/https://www.lp.org/platform/";

const LINK = "underline underline-offset-4";

export default function HowItWorks() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">How it works</h1>
        <p>
          Blind Ballot shows you promises from the three parties&apos; platforms with the party
          labels removed. You say whether you&apos;d support each one and guess who proposed it.
          Only then do you see whose it was, in the party&apos;s own words.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Where the cards come from</h2>
        <p>Every card is a promise from one of these platforms:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {SOURCES.map((s) => (
            <li key={s.party}>
              {s.party}:{" "}
              <a href={s.url} target="_blank" rel="noreferrer" className={LINK}>
                {s.name}
              </a>{" "}
              ({s.host})
            </li>
          ))}
        </ul>
        <p>
          Cards cite lp.org&apos;s live page. An{" "}
          <a href={ARCHIVED_LP} target="_blank" rel="noreferrer" className={LINK}>
            archived copy from 30 December 2024
          </a>{" "}
          shows the same text during the 2024 election, apart from heading case, one word, and a
          historical note since removed.
        </p>
        <p>
          Platforms, not bills: no Libertarian sits in Congress, so bills can&apos;t speak for all
          three parties.
        </p>
        <p>
          The deck has 24 cards, 8 from each party. Each round deals 12: 4 from each party, with no
          topic more than twice. Three cards per party cut against the party&apos;s usual type, so
          the obvious guess isn&apos;t always right.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">How the cards are written</h2>
        <p>
          Claude, an AI model, drafted the cards offline, one platform at a time. It never runs in
          this app, and it never decides a card&apos;s party: a card&apos;s party is always the
          platform it came from.
        </p>
        <p>
          Each card keeps a quote in the platform&apos;s own words, which you see after the reveal.
          A script checks that every quote appears word for word in its source. I reviewed and
          approved every card.
        </p>
        <p>The statements follow the same rules for all three parties:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>one sentence of 8 to 20 words, starting with a verb;</li>
          <li>no names of people, parties or slogans;</li>
          <li>
            the plainest term, never either side&apos;s: &ldquo;abortion&rdquo;, not
            &ldquo;pro-life&rdquo; or &ldquo;reproductive freedom&rdquo;;
          </li>
          <li>no emotional adjectives;</li>
          <li>what changes, not why, because the reasons are where the spin lives;</li>
          <li>real numbers, dates and official program names.</li>
        </ul>
        <p>
          Tests block the deck if a statement uses a word from a list of loaded words and names,
          breaks the length limits, or if one party&apos;s statements run noticeably longer than
          another&apos;s.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">How your results are worked out</h2>
        <p>
          For each party, your results count how many of its cards you supported, out of the ones
          you answered Support or Oppose. Unsure answers aren&apos;t counted. Those are the three
          bars.
        </p>
        <p>
          A round has only 4 cards per party, so chance plays a big part. Each party&apos;s count
          gets a range of likely support rates (an 80% Wilson interval), and the verdict is:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>clear, when one party&apos;s range sits wholly above the other two;</li>
          <li>leaning, when one party has your highest rate but the ranges overlap;</li>
          <li>too close to call, when two parties tie for the top, or nothing was counted.</li>
        </ul>
        <p>
          Both rounds count together, so round 2 makes the verdict sharper. It always reads
          &ldquo;Blind, you voted most like…&rdquo;: it describes your answers, not who you are.
        </p>
        <p>
          Your guesses are compared with luck. Guessing at random gets 1 in 3 right, and your
          results give the chance of doing as well as you did, or better, by luck alone (an exact
          binomial test).
        </p>
        <p>
          The projection line takes the cards you supported and compares how many you guessed came
          from your party with how many actually did. If you chose Independent or Prefer not to
          say, it uses the party you guessed most often.
        </p>
        <p>
          The parties are revealed only at the end of a round. Seeing them card by card would let
          you count your way to better guesses, and the comparison with luck would no longer hold.
          Each card is answered once, before any party is shown, and answers can&apos;t be
          changed.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Has the wording been tested?</h2>
        <p>
          A leak check asks Claude to guess each card&apos;s party five times from the statement,
          then five times from the original quote, and each time to say which words pointed there.
          If Claude does much better on the quotes, the rewrite took out spin. When Claude names a
          card&apos;s party from the statement in 4 or more of 5 runs, the card is flagged, and the
          words it pointed to are the ones to review for a rewrite.
        </p>
        <p>
          On 3 October 2026, Claude named the right party for 21 of the 24 statements, each time
          with at least 4 of 5 runs agreeing, and for all 24 quotes. Guessing at random gets 1 in 3
          right, so both scores are far beyond luck.
        </p>
        <p>
          That was expected. Claude has read these platforms, and some policies give their party
          away however plainly they&apos;re worded. Guessing from the policy is the game, so the
          wording is judged by the difference: the rewrite took Claude from 100% to 88%. The 3
          statements it got wrong all come from cards that cut against their party&apos;s type.
        </p>
        <p>
          The words Claude pointed to mostly restate the policy itself. Sorting out any that are
          wording, and rewriting those cards, is still to do: the cards are unchanged.
        </p>
        <p>
          The limits: the same family of AI models wrote the statements and tested them, and the
          words Claude points to are its own account, a hint rather than proof. A panel of people
          would be the real test.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            Start signs you in as a guest, with no name and no email. The app stores the party you
            named, your rounds and your answers, tied to that guest account.
          </li>
          <li>
            Through the app, only you can read your answers: the database&apos;s rules block
            everyone else.
          </li>
          <li>
            As a guest, your results live in this browser. Clearing its cookies loses them. Saving
            your results adds an email and a password to the same account, and sends no email.
          </li>
          <li>
            The share line holds only your totals and your lean: no cards, no answers and no link
            to your round.
          </li>
        </ul>
      </section>
    </main>
  );
}
