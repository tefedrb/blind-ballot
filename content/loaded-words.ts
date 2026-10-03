// Words and names that give a card's party away, or that one side uses and
// the other doesn't (spec § 7, the wording rules). The deck tests fail on any
// statement containing one, matched case-insensitively on whole words. The
// list is small on purpose: the leak check (§ 8) looks for subtler cues.
export const LOADED_WORDS = [
  // Parties.
  "Democrat",
  "Democrats",
  "Democratic",
  "Republican",
  "Republicans",
  "GOP",
  "Libertarian",
  "Libertarians",

  // Candidates, leaders and slogans of the 2024 cycle.
  "Biden",
  "Bidenomics",
  "Harris",
  "Walz",
  "Trump",
  "Vance",
  "Chase Oliver",
  "Obama",
  "MAGA",
  "Make America Great Again",
  "America First",
  "Project 2025",
  "Green New Deal",

  // Abortion: "abortion" is the plain term.
  "pro-life",
  "pro-choice",
  "reproductive freedom",
  "reproductive rights",
  "unborn",
  "abortion on demand",
  "late-term",

  // Health care: "Affordable Care Act" is the official name.
  "Obamacare",

  // Immigration.
  "illegal alien",
  "illegal aliens",
  "illegals",
  "invasion",
  "open borders",
  "amnesty",
  "undocumented",
  "migrant crime",

  // Guns.
  "gun violence",
  "gun safety",
  "assault weapons",
  "weapons of war",

  // Energy and climate.
  "climate crisis",
  "energy dominance",
  "drill, baby, drill",

  // Taxes and the economy.
  "death tax",
  "fair share",
  "the wealthy",
  "ultra-rich",

  // Elections and government.
  "election integrity",
  "stolen election",
  "rigged",
  "voter suppression",
  "deep state",
  "weaponization",

  // Rights, speech and schools.
  "woke",
  "gender ideology",
  "gender-affirming",
  "parental rights",
  "book bans",
  "critical race theory",

  // Crime and policing.
  "law and order",
  "defund the police",
  "mass incarceration",
  "victimless crimes",

  // Libertarian framing.
  "taxation is theft",
  "statist",
  "non-aggression",

  // Emotional adjectives (wording rule 4).
  "disastrous",
  "radical",
  "extreme",
  "extremist",
  "common-sense",
  "dangerous",
  "failed",
  "corrupt",
] as const;
