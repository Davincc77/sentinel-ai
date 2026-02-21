#!/usr/bin/env node
// count.mjs — Aggregate stats from multiple query runs stored in a JSONL log file.
// Usage: node scripts/count.mjs [--log path/to/log.jsonl]

import { readFileSync } from "fs";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { log: "lost-fund-scanner-log.jsonl" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--log" && args[i + 1]) opts.log = args[++i];
  }
  return opts;
}

function main() {
  const opts = parseArgs();
  let raw;
  try {
    raw = readFileSync(opts.log, "utf-8");
  } catch {
    console.error(`No log file found at ${opts.log}. Run query.mjs first to generate data.`);
    process.exit(1);
  }

  const lines = raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  if (lines.length === 0) {
    console.log("No entries in log.");
    return;
  }

  // Aggregate by chain
  const chains = {};
  for (const entry of lines) {
    const c = entry.chain || "unknown";
    if (!chains[c])
      chains[c] = {
        runs: 0,
        zeroAddrTxCount: 0,
        zeroAddrETH: 0,
        dustTxCount: 0,
        dustETH: 0,
        failedTxCount: 0,
        failedETH: 0,
        firstTs: entry.timestamp,
        lastTs: entry.timestamp,
      };
    const s = chains[c];
    s.runs++;
    s.zeroAddrTxCount += entry.zeroAddrTxCount || 0;
    s.zeroAddrETH += parseFloat(entry.zeroAddrETH || 0);
    s.dustTxCount += entry.dustTxCount || 0;
    s.dustETH += parseFloat(entry.dustETH || 0);
    s.failedTxCount += entry.failedTxCount || 0;
    s.failedETH += parseFloat(entry.failedETH || 0);
    if (entry.timestamp < s.firstTs) s.firstTs = entry.timestamp;
    if (entry.timestamp > s.lastTs) s.lastTs = entry.timestamp;
  }

  console.log("═══════════════════════════════════════════");
  console.log("📊 Lost-Fund Scanner — Aggregate Report");
  console.log(`   ${lines.length} scan(s) in log`);
  console.log("═══════════════════════════════════════════\n");

  for (const [chain, s] of Object.entries(chains)) {
    console.log(`Chain: ${chain} (${s.runs} runs, ${s.firstTs} → ${s.lastTs})`);
    console.log(`  Zero-addr txs : ${s.zeroAddrTxCount}  (${s.zeroAddrETH.toFixed(8)} ETH)`);
    console.log(`  Dust txs      : ${s.dustTxCount}  (${s.dustETH.toFixed(8)} ETH)`);
    console.log(`  Failed txs    : ${s.failedTxCount}  (${s.failedETH.toFixed(8)} ETH)`);
    console.log("");
  }
}

main();
