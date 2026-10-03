// Gate 1 of the Research Desk: every quote must appear word for word in its
// source. Both sides are normalized first, so typography alone can't fail a
// quote, but different words always do.

function normalize(text: string): string {
  return (
    text
      // NFKC also turns a non-breaking space into a space, and "…" into "...".
      .normalize("NFKC")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

export function quoteFound(quote: string, sourceText: string): boolean {
  const q = normalize(quote);
  // Every text contains the empty string, so a blank quote proves nothing.
  if (q === "") return false;
  // A quote must be one contiguous passage, and an ellipsis marks a cut.
  if (q.includes("...")) return false;
  return normalize(sourceText).includes(q);
}
