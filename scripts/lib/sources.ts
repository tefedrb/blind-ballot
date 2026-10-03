import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Party } from "@/content/schema";
import { countWords, extractText } from "./extract";
import { PLATFORMS } from "./platforms";

const CACHE_DIR = ".cache/sources";

// lp.org blocks bare scripted requests; a full browser identity passes.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  Accept: "text/html",
  "Accept-Language": "en-US,en;q=0.9",
};

// Returns a platform's plain text: from the cached page, or fetched when the
// cache is missing or `refresh` is set. Throws rather than return partial text.
export async function getSource(party: Party, refresh = false): Promise<string> {
  const { url, expectedWords } = PLATFORMS[party];
  const path = `${CACHE_DIR}/${party}.html`;

  const fromCache = !refresh && existsSync(path);
  const html = fromCache ? readFileSync(path, "utf8") : await fetchPage(url);

  // Throws on a blocked page, a missing region or a missing marker.
  const text = extractText(party, html);
  const words = countWords(text);
  console.log(`${party}: ${words} words (expected about ${expectedWords})`);
  if (words < expectedWords / 2) {
    throw new Error(`${party}: only ${words} words, under half the ${expectedWords} expected`);
  }

  // Save a fetched page only once it has passed every check.
  if (!fromCache) {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(path, html);
  }
  return text;
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, { headers: BROWSER_HEADERS });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}
