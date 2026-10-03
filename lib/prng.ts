// A seeded random number generator, so the same seed always gives the same deal.

// Returns a function that gives numbers in [0, 1), the same sequence for the same seed.
export function seededRandom(seed: string): () => number {
  return mulberry32(hashString(seed));
}

// FNV-1a: turns a string into a 32-bit number.
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32: a small, fast generator with a 32-bit state.
function mulberry32(state: number): () => number {
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
