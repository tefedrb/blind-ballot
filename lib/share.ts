import { PARTY_NAMES } from "./labels";
import type { Lean } from "./verdict";

// The line the Share button copies. It gives the totals and the lean only:
// never a card, a card's party or a round. It links to the home page.
export function shareLine({
  lean,
  right,
  total,
  homeUrl,
}: {
  lean: Lean;
  right: number;
  total: number;
  homeUrl: string;
}): string {
  return ["Blind Ballot", `guessed ${right}/${total}`, `blind lean: ${leanWords(lean)}`, homeUrl].join(
    " · ",
  );
}

function leanWords(lean: Lean): string {
  if (lean.verdict === "too_close") return "too close to call";
  return `${lean.verdict === "clear" ? "clearly" : "leaning"} ${PARTY_NAMES[lean.leader]}`;
}
