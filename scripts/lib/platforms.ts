import type { Party } from "@/content/schema";

type Platform = {
  // How the Desk names the document to Claude.
  name: string;
  // Prefixes each card's ID, for example rnc-2024-14.
  doc: string;
  // The page each card cites as its source.
  url: string;
  // Words found by the planned extraction on 2026-10-02.
  expectedWords: number;
};

// The three source platforms (spec § 7).
export const PLATFORMS: Record<Party, Platform> = {
  D: {
    name: "the 2024 Democratic Party platform",
    doc: "dnc-2024",
    url: "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform",
    expectedWords: 42864,
  },
  R: {
    name: "the 2024 Republican Party platform",
    doc: "rnc-2024",
    url: "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform",
    expectedWords: 5374,
  },
  L: {
    name: "the Libertarian Party platform in force for the 2024 election",
    doc: "lp-2024",
    url: "https://lp.org/platform/",
    expectedWords: 3446,
  },
};
