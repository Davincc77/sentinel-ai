#!/usr/bin/env node
// log-to-memory.mjs — Append a JSON report line to the JSONL log file
// Reads JSON from stdin or a --json argument
// Usage:
//   node scripts/query.mjs --chain base | node scripts/log-to-memory.mjs
//   node scripts/log-to-memory.mjs --json '{"chain":"base",...}'

import { appendFileSync } from "fs";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { log: "lost-fund-scanner-log.jsonl", json: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--log" && args[i + 1]) opts.log = args[++i];
    if (args[i] === "--json" && args[i + 1]) opts.json = args[++i];
  }
  return opts;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

async function main() {
  const opts = parseArgs();
  let jsonStr;
  if (opts.json) {
    jsonStr = opts.json;
  } else {
    const raw = await readStdin();
    // Extract JSON block from output (last { ... } in output)
    const match = raw.match(/\{[\s\S]*\}\s*$/);
    if (!match) {
      console.error("No JSON found in stdin.");
      process.exit(1);
    }
    jsonStr = match[0];
  }

  const obj = JSON.parse(jsonStr);
  const line = JSON.stringify(obj) + "\n";
  appendFileSync(opts.log, line);
  console.log(`✅ Logged to ${opts.log}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
