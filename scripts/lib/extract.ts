import { load } from "cheerio";
import type { Party } from "@/content/schema";

// Elements that start a new line when the page is read as text.
const BLOCKS =
  "p, div, li, ul, ol, h1, h2, h3, h4, h5, h6, section, article, header, footer, nav, blockquote, table, tr, td, th";

// Returns a platform's plain text, or throws. It never returns part of a page.
export function extractText(party: Party, html: string): string {
  if (/you have been blocked/i.test(html)) {
    throw new Error(`${party}: the page is a "you have been blocked" page`);
  }

  const $ = load(html);
  $("script, style, noscript").remove();
  $("br").replaceWith("\n");
  $(BLOCKS).each((_, el) => {
    $(el).prepend("\n").append("\n");
  });

  if (party === "L") {
    const text = toLines($("body").text());
    const start = text.indexOf("PREAMBLE");
    const end = text.indexOf("Join Our Newsletter");
    if (start === -1) throw new Error("L: no PREAMBLE marker");
    if (end === -1 || end < start) throw new Error("L: no Join Our Newsletter marker after PREAMBLE");
    return text.slice(start, end).trim();
  }

  const regions = $(".field-docs-content");
  if (regions.length !== 1) {
    throw new Error(`${party}: expected one .field-docs-content region, found ${regions.length}`);
  }
  return toLines(regions.text());
}

// One line per block: spaces collapsed, each line trimmed, blank lines dropped.
function toLines(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
