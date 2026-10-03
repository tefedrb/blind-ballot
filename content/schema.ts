import { z } from "zod";
import { TOPICS } from "./topics";

export const PartySchema = z.enum(["D", "R", "L"]);
export type Party = z.infer<typeof PartySchema>;

// The party the player says they identify with, asked once before round 1.
// I is Independent; none is Prefer not to say.
export const StatedPartySchema = z.enum(["D", "R", "L", "I", "none"]);
export type StatedParty = z.infer<typeof StatedPartySchema>;

export const VoteSchema = z.enum(["support", "oppose", "unsure"]);
export type Vote = z.infer<typeof VoteSchema>;

export const TopicSchema = z.enum(TOPICS);
export type Topic = z.infer<typeof TopicSchema>;

// A plank is the full record, party included. The player only ever sees a
// card: toCard() in lib/deck.ts.
export const PlankSchema = z.object({
  id: z.string().min(1),
  party: PartySchema,
  topic: TopicSchema,
  statement: z.string().min(1),
  quote: z.string().min(1),
  source: z.object({
    doc: z.string().min(1),
    section: z.string().min(1),
    url: z.string().startsWith("https://"),
  }),
  counterType: z.boolean(),
});
export type Plank = z.infer<typeof PlankSchema>;

// What the player sees: no party, no quote and no source. It lives here, not in
// lib/deck.ts, so client components can use the type without importing the deck.
export type Card = Pick<Plank, "id" | "statement" | "topic">;

// What the Research Desk asks Claude for. Plain strings, booleans and the topic
// enum only: the word limits live in the prompt and the checks. There's no
// party field, because the party comes from the source platform.
export const CandidateSchema = z.object({
  statement: z.string(),
  quote: z.string(),
  section: z.string(),
  topic: TopicSchema,
  counterType: z.boolean(),
  counterReason: z.string(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// Structured output needs an object at the top level.
export const CandidatesSchema = z.object({ cards: z.array(CandidateSchema) });

// What the leak check asks Claude for, once per run: which party's platform
// proposed the text, and which words point to that party.
export const LeakAnswerSchema = z.object({
  party: PartySchema,
  cues: z.array(z.string()),
});
export type LeakAnswer = z.infer<typeof LeakAnswerSchema>;
