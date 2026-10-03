// The leak check: asks Claude which party's platform proposed each card, 5
// times on its neutral statement and 5 times on its original quote, then writes
// the summary to evals/. Run with `npm run leak-check`.

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PLANKS } from "@/content/planks";
import { LeakAnswerSchema, type LeakAnswer, type Plank } from "@/content/schema";
import {
  summarize,
  type Accuracy,
  type CardRuns,
  type LeakSummary,
  type VersionResult,
} from "./lib/leak-summary";

const MODEL = "claude-opus-5-5";
const RUNS = 5;
const CONCURRENCY = 8;
const JSON_PATH = "evals/leak-report.json";
const MD_PATH = "evals/leak-report.md";
// Opus 5.5's list prices, in dollars per million tokens.
const PRICE_PER_MILLION = { input: 4, output: 20 };

type Version = "neutral" | "original";
const VERSIONS: Version[] = ["neutral", "original"];

type Call = { plank: Plank; version: Version };
type Run = { answer: LeakAnswer; model: string; inputTokens: number; outputTokens: number };
type RunInfo = {
  date: string;
  models: Record<string, number>;
  tokens: { input: number; output: number };
  cost: number;
};

async function main() {
  const client = new Anthropic();
  const system = readFileSync("scripts/prompts/leak-check.md", "utf8");

  // Each card, each version (the neutral statement, then the original quote),
  // 5 runs: 240 calls for 24 cards.
  const calls: Call[] = PLANKS.flatMap((plank) =>
    VERSIONS.flatMap((version) => Array.from({ length: RUNS }, () => ({ plank, version }))),
  );
  let done = 0;
  const results = await pool(
    calls.map(({ plank, version }) => async () => {
      const run = await ask(client, system, version === "neutral" ? plank.statement : plank.quote);
      if (++done % 24 === 0) console.log(`${done}/${calls.length} calls`);
      return run;
    }),
    CONCURRENCY,
  );

  // The party comes from the deck, never from Claude.
  const answersFor = (plankId: string, version: Version) =>
    calls.flatMap((call, i) =>
      call.plank.id === plankId && call.version === version ? [results[i].answer] : [],
    );
  const runs: CardRuns[] = PLANKS.map((plank) => ({
    plankId: plank.id,
    party: plank.party,
    neutral: answersFor(plank.id, "neutral"),
    original: answersFor(plank.id, "original"),
  }));
  const summary = summarize(runs);

  // Which model served each call, since a refusal can fall back to another.
  const models: Record<string, number> = {};
  for (const { model } of results) models[model] = (models[model] ?? 0) + 1;

  // What the run used. Thinking counts as output. Attempts that were retried
  // aren't counted.
  const tokens = {
    input: results.reduce((sum, run) => sum + run.inputTokens, 0),
    output: results.reduce((sum, run) => sum + run.outputTokens, 0),
  };
  const cost =
    (tokens.input * PRICE_PER_MILLION.input + tokens.output * PRICE_PER_MILLION.output) / 1_000_000;

  const info: RunInfo = { date: new Date().toISOString().slice(0, 10), models, tokens, cost };
  mkdirSync("evals", { recursive: true });
  writeFileSync(JSON_PATH, JSON.stringify({ ...info, summary, runs }, null, 2) + "\n");
  writeFileSync(MD_PATH, reportMarkdown(summary, info));

  console.log(`neutral: ${line(summary.neutral)}`);
  console.log(`original: ${line(summary.original)}`);
  console.log(`drop: ${points(summary.drop)} · flagged: ${summary.flagged.join(", ") || "none"}`);
  console.log(`tokens: ${count(tokens.input)} in / ${count(tokens.output)} out · cost: ${dollars(cost)}`);
}

// One run. Like the Desk: one retry, at lower effort, when the output is cut
// off or doesn't parse.
async function ask(client: Anthropic, system: string, text: string): Promise<Run> {
  for (const effort of ["medium", "low"] as const) {
    let response;
    try {
      response = await client.beta.messages.parse({
        model: MODEL,
        // Thinking counts against it.
        max_tokens: 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort, format: betaZodOutputFormat(LeakAnswerSchema) },
        system,
        messages: [{ role: "user", content: text }],
      });
    } catch (error) {
      // HTTP and connection errors are real failures; the SDK has already
      // retried them. Any other SDK error here means parse() couldn't read the
      // output: cut off at max_tokens, or not matching the schema.
      if (error instanceof Anthropic.APIError || !(error instanceof Anthropic.AnthropicError)) throw error;
      console.warn(`output unusable at effort ${effort}: ${error.message}`);
      continue;
    }

    // Check the stop reason before reading the output.
    if (response.stop_reason === "refusal") {
      // The fallback model has already had its turn, so there's no one left to ask.
      throw new Error(`refused: ${JSON.stringify(response.stop_details)}`);
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      console.warn(`no usable output at effort ${effort}`);
      continue;
    }
    return {
      answer: response.parsed_output,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
  throw new Error("no usable output at effort medium or low");
}

// Runs the tasks at most `limit` at a time. The results keep the tasks' order.
async function pool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

function reportMarkdown(summary: LeakSummary, info: RunInfo): string {
  const statement = (plankId: string) => PLANKS.find((p) => p.id === plankId)!.statement;
  const served = Object.entries(info.models)
    .map(([model, count]) => `${model} (${count} calls)`)
    .join(", ");
  const flagged = summary.cards.filter((card) => summary.flagged.includes(card.plankId));
  const majority = (r: VersionResult) =>
    `${r.majority ?? "tie"}, ${r.sureness}`;

  return [
    "# Leak check",
    "",
    `Generated by \`scripts/leak-check.ts\` on ${info.date}. Served by ${served}.`,
    `Each card ran ${RUNS} times per version. Chance is 1 in 3, and a tie counts as a miss.`,
    "",
    `Tokens: ${count(info.tokens.input)} in, ${count(info.tokens.output)} out, thinking included. ` +
      `Cost: ${dollars(info.cost)} at Opus 5.5's list prices ($4 in, $20 out per million tokens), ` +
      "not counting attempts that were retried.",
    "",
    "| Version | Right | Accuracy | p against chance |",
    "| --- | --- | --- | --- |",
    `| Neutral statement | ${fraction(summary.neutral)} | ${percent(summary.neutral.accuracy)} | ${pValue(summary.neutral.pValue)} |`,
    `| Original quote | ${fraction(summary.original)} | ${percent(summary.original.accuracy)} | ${pValue(summary.original.pValue)} |`,
    "",
    `The drop from the original quote to the neutral statement: ${points(summary.drop)}.`,
    "",
    "## Flagged cards",
    "",
    "Right on the neutral statement, with 4 or more of 5 runs agreeing. The cues are Claude's own account.",
    "",
    ...(flagged.length === 0
      ? ["None."]
      : [
          "| Card | Party | Statement | Sureness | Cues |",
          "| --- | --- | --- | --- | --- |",
          ...flagged.map(
            (card) =>
              `| ${card.plankId} | ${card.party} | ${statement(card.plankId)} | ${card.neutral.sureness} | ${card.neutral.cues.join("; ") || "(none)"} |`,
          ),
        ]),
    "",
    "## Every card",
    "",
    "The majority answer and its sureness, per version.",
    "",
    "| Card | Party | Neutral | Original |",
    "| --- | --- | --- | --- |",
    ...summary.cards.map(
      (card) => `| ${card.plankId} | ${card.party} | ${majority(card.neutral)} | ${majority(card.original)} |`,
    ),
    "",
  ].join("\n");
}

const fraction = (a: Accuracy) => `${a.right}/${a.total}`;
const percent = (x: number) => `${Math.round(x * 100)}%`;
const points = (x: number) => `${Math.round(x * 100)} points`;
const count = (n: number) => n.toLocaleString("en-US");
const dollars = (x: number) => `$${x.toFixed(2)}`;
const pValue = (p: number) => (p < 0.001 ? "< 0.001" : p.toFixed(3));
const line = (a: Accuracy) => `${fraction(a)} right (${percent(a.accuracy)}), p ${pValue(a.pValue)}`;

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
