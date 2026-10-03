import type { Party, Plank, Topic } from "./schema";

// 24 placeholder planks for building the game loop and testing the dealer.
// They pass every deck rule (spec § 6, promise 4), and they never ship.
//   - 8 per party, 2 of them counter-type;
//   - each of the 12 topics used twice, by two different parties.
const ROWS: [Party, Topic, boolean][] = [
  // Topics shared by D and R.
  ["D", "Taxes and spending", true],
  ["R", "Taxes and spending", false],
  ["D", "Jobs and trade", false],
  ["R", "Jobs and trade", false],
  ["D", "Health care", false],
  ["R", "Health care", false],
  ["D", "Retirement", false],
  ["R", "Retirement", true],
  // Topics shared by D and L.
  ["D", "Immigration", false],
  ["L", "Immigration", true],
  ["D", "Crime, policing and drugs", false],
  ["L", "Crime, policing and drugs", false],
  ["D", "Guns", true],
  ["L", "Guns", false],
  ["D", "Energy and climate", false],
  ["L", "Energy and climate", false],
  // Topics shared by R and L.
  ["R", "Education", true],
  ["L", "Education", false],
  ["R", "Defense and foreign policy", false],
  ["L", "Defense and foreign policy", false],
  ["R", "Rights and speech", false],
  ["L", "Rights and speech", false],
  ["R", "Elections and government", false],
  ["L", "Elections and government", true],
];

export const PLANKS: Plank[] = ROWS.map(([party, topic, counterType], i) => ({
  id: `fixture-${i + 1}`,
  party,
  topic,
  statement: `Placeholder card ${i + 1} about ${topic.toLowerCase()}, used only while the game loop is built`,
  quote: `Placeholder quote for card ${i + 1}.`,
  source: { doc: "fixture", section: "Placeholder section", url: "https://example.com/fixture" },
  counterType,
}));
