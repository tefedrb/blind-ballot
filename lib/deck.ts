import "server-only";
import { PLANKS } from "@/content/planks";
import type { Card, Plank } from "@/content/schema";

// The gate: the only way Play reaches the deck. Every plank carries its party,
// so this module stays on the server, and the browser only gets toCard().

export function allPlanks(): Plank[] {
  return PLANKS;
}

export function getPlank(id: string): Plank {
  const plank = PLANKS.find((p) => p.id === id);
  if (!plank) throw new Error(`No plank with ID ${id}`);
  return plank;
}

export function toCard(p: Plank): Card {
  return { id: p.id, statement: p.statement, topic: p.topic };
}
