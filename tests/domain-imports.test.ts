import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { importsOf } from "./imports";

// The domain core, from the plan's table. A file that doesn't exist yet shows
// as skipped, so the list can name it ahead of time.
const DOMAIN_CORE = [
  "content/schema.ts",
  "content/topics.ts",
  "lib/prng.ts",
  "lib/dealer.ts",
  "lib/verdict.ts",
  "lib/results.ts",
  "lib/share.ts",
  "lib/save.ts",
  "lib/routes.ts",
  "lib/next-step.ts",
  "scripts/lib/quote-check.ts",
  "scripts/lib/extract.ts",
  "scripts/lib/candidates.ts",
  "scripts/lib/leak-summary.ts",
];

// The domain core does no I/O and knows nothing of the framework.
const IMPURE = [
  /^next(\/|$)/,
  /^react(\/|$)/,
  /^@supabase\//,
  /^@anthropic-ai\//,
  /^(node:)?fs(\/|$)/,
  /^app\//,
  /^lib\/supabase\//,
];

describe("the domain core", () => {
  for (const file of DOMAIN_CORE) {
    it.skipIf(!existsSync(file))(`${file} imports nothing impure`, () => {
      const impure = importsOf(file).filter((i) => IMPURE.some((pattern) => pattern.test(i)));
      expect(impure).toEqual([]);
    });
  }
});
