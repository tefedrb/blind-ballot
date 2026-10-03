import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { quoteFound } from "@/scripts/lib/quote-check";
import { getSource } from "@/scripts/lib/sources";

// The raw pages live in .cache/sources/, which isn't in git. On a fresh clone
// these checks skip rather than fetch.
const cached = ["D", "R", "L"].every((party) => existsSync(`.cache/sources/${party}.html`));

// The spec's counter-type examples, verified word for word on 2026-10-02.
const VERIFIED_QUOTES = [
  [
    "R",
    "FIGHT FOR AND PROTECT SOCIAL SECURITY AND MEDICARE WITH NO CUTS, INCLUDING NO CHANGES TO THE RETIREMENT AGE",
  ],
  ["D", "additional border patrol agents, immigration judges, asylum officers"],
  [
    "L",
    "Eminent domain, civil asset forfeiture, governmental limits on profits, governmental production mandates, and governmental controls on prices of goods and services (including wages, rents, and interest) are abridgements of such fundamental rights.",
  ],
] as const;

describe.skipIf(!cached)("getSource on the cached platforms", () => {
  it.each(VERIFIED_QUOTES)("%s keeps its verified quote intact", async (party, quote) => {
    expect(quoteFound(quote, await getSource(party))).toBe(true);
  });
});
