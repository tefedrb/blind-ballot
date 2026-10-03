// Reads the repo's import statements, for the tests that guard who imports what.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SKIP = new Set(["node_modules", ".git", ".next", ".cache", ".vercel"]);
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

// `from "x"`, `import "x"`, `import("x")` and `require("x")`.
const SPECIFIER = /(?:from|import|require)\s*\(?\s*["']([^"']+)["']/g;

// Every code file in the repo, as a path from the repo root.
export function sourceFiles(dir = "."): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP.has(entry.name) ? [] : sourceFiles(file);
    return CODE.test(entry.name) ? [file] : [];
  });
}

// What a file imports. Local imports come back as paths from the repo root,
// without an extension, so `@/lib/deck` and `../lib/deck.ts` both read
// `lib/deck`. Packages come back as written.
export function importsOf(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(SPECIFIER)].map(([, specifier]) => {
    const resolved = specifier.startsWith("@/")
      ? specifier.slice(2)
      : specifier.startsWith(".")
        ? path.posix.join(path.posix.dirname(file), specifier)
        : specifier;
    return resolved.replace(CODE, "");
  });
}

export function isClientComponent(file: string): boolean {
  return /^["']use client["']/m.test(readFileSync(file, "utf8"));
}
