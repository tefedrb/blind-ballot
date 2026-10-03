import type { Party, StatedParty, Vote } from "@/content/schema";

// The words on the buttons. Type-only imports, so client components can use
// these without bundling the schemas.

export const PARTY_NAMES: Record<Party, string> = {
  D: "Democrat",
  R: "Republican",
  L: "Libertarian",
};

export const STATED_PARTY_NAMES: Record<StatedParty, string> = {
  ...PARTY_NAMES,
  I: "Independent",
  none: "Prefer not to say",
};

export const VOTE_NAMES: Record<Vote, string> = {
  support: "Support",
  oppose: "Oppose",
  unsure: "Unsure",
};
