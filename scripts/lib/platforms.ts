import type { Party } from "@/content/schema";

type Platform = {
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
    doc: "dnc-2024",
    url: "https://www.presidency.ucsb.edu/documents/2024-democratic-party-platform",
    expectedWords: 42864,
  },
  R: {
    doc: "rnc-2024",
    url: "https://www.presidency.ucsb.edu/documents/2024-republican-party-platform",
    expectedWords: 5374,
  },
  L: {
    doc: "lp-2024",
    url: "https://lp.org/platform/",
    expectedWords: 3446,
  },
};
