#!/usr/bin/env node
// query.mjs — Query public explorer APIs for dust/failed-send transactions
// Uses native fetch (Node 22+). No dependencies.
//
// Environment:
//   ETHERSCAN_KEY  — Etherscan API key (optional, free tier works without for light use)
//   BASESCAN_KEY   — BaseScan API key (optional)
//
// Usage:
//   node scripts/query.mjs [--chain base|ethereum] [--blocks N] [--min-value WEI]

const CHAINS = {
  ethereum: {
    api: "https://api.etherscan.io/api",
    keyEnv: "ETHERSCAN_KEY",
    name: "Ethereum",
    explorer: "https://etherscan.io",
    decimals: 18,
  },
  base: {
    api: "https://api.basescan.org/api",
    keyEnv: "BASESCAN_KEY",
    name: "Base",
    explorer: "https://basescan.org",
    decimals: 18,
  },
};

// ── Helpers ─────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { chain: "base", blocks: 100, minValueWei: "0" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--chain" && args[i + 1]) opts.chain = args[++i];
    if (args[i] === "--blocks" && args[i + 1]) opts.blocks = parseInt(args[++i], 10);
    if (args[i] === "--min-value" && args[i + 1]) opts.minValueWei = args[++i];
  }
  return opts;
}

function weiToEth(wei) {
  return (Number(BigInt(wei)) / 1e18).toFixed(8);
}

// ── Core ────────────────────────────────────────────────────
async function getLatestBlock(api, apiKey) {
  const url = `${api}?module=proxy&action=eth_blockNumber&apikey=${apiKey}`;
  const r = await fetch(url);
  const j = await r.json();
  return parseInt(j.result, 16);
}

/**
 * Fetch internal + normal txs to the zero address (0x000...000)
 * These represent ETH burned / sent to an unrecoverable address.
 */
async function fetchZeroAddressTxs(api, apiKey, startBlock, endBlock) {
  const zeroAddr = "0x0000000000000000000000000000000000000000";
  const url =
    `${api}?module=account&action=txlist` +
    `&address=${zeroAddr}` +
    `&startblock=${startBlock}&endblock=${endBlock}` +
    `&sort=desc&apikey=${apiKey}`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.status !== "1") return [];
  return j.result || [];
}

/**
 * Fetch failed (isError=1) transactions in recent blocks from a sample address.
 * Because Etherscan doesn't support global failed-tx queries we sample the zero address.
 */
async function fetchFailedTxsSample(api, apiKey, startBlock, endBlock) {
  const zeroAddr = "0x0000000000000000000000000000000000000000";
  const url =
    `${api}?module=account&action=txlist` +
    `&address=${zeroAddr}` +
    `&startblock=${startBlock}&endblock=${endBlock}` +
    `&sort=desc&apikey=${apiKey}`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.status !== "1") return [];
  return (j.result || []).filter((tx) => tx.isError === "1");
}

// Dust heuristic: value > 0 but ≤ threshold (default 0.001 ETH = 1e15 wei)
function isDust(tx, thresholdWei = 1_000_000_000_000_000n) {
  const val = BigInt(tx.value || "0");
  return val > 0n && val <= thresholdWei;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs();
  const chain = CHAINS[opts.chain];
  if (!chain) {
    console.error(`Unknown chain: ${opts.chain}. Use ethereum or base.`);
    process.exit(1);
  }

  const apiKey = process.env[chain.keyEnv] || "YourApiKeyToken";
  console.log(`\n🔍 Lost-Fund Scanner — ${chain.name}`);
  console.log(`   Explorer: ${chain.explorer}`);
  console.log(`   Scanning last ${opts.blocks} blocks...\n`);

  let latestBlock;
  try {
    latestBlock = await getLatestBlock(chain.api, apiKey);
  } catch (e) {
    console.error("❌ Failed to get latest block:", e.message);
    process.exit(1);
  }
  const startBlock = Math.max(0, latestBlock - opts.blocks);
  console.log(`   Latest block: ${latestBlock}`);
  console.log(`   Range: ${startBlock} → ${latestBlock}\n`);

  // 1. Txs to zero address
  const zeroTxs = await fetchZeroAddressTxs(chain.api, apiKey, startBlock, latestBlock);
  const dustTxs = zeroTxs.filter((tx) => isDust(tx));
  const failedTxs = await fetchFailedTxsSample(chain.api, apiKey, startBlock, latestBlock);

  // Stats
  const totalZeroAddrETH = zeroTxs.reduce((s, tx) => s + BigInt(tx.value || "0"), 0n);
  const totalDustETH = dustTxs.reduce((s, tx) => s + BigInt(tx.value || "0"), 0n);
  const totalFailedETH = failedTxs.reduce((s, tx) => s + BigInt(tx.value || "0"), 0n);

  console.log("═══════════════════════════════════════════");
  console.log(`📊 Results for ${chain.name} (blocks ${startBlock}–${latestBlock})`);
  console.log("═══════════════════════════════════════════");
  console.log(`  Txs to 0x000…000 address : ${zeroTxs.length}`);
  console.log(`  Total ETH to zero addr   : ${weiToEth(totalZeroAddrETH.toString())} ETH`);
  console.log(`  Dust txs (≤0.001 ETH)    : ${dustTxs.length}`);
  console.log(`  Total dust ETH           : ${weiToEth(totalDustETH.toString())} ETH`);
  console.log(`  Failed txs (sample)      : ${failedTxs.length}`);
  console.log(`  ETH in failed txs        : ${weiToEth(totalFailedETH.toString())} ETH`);
  console.log("═══════════════════════════════════════════\n");

  // Top senders to zero address
  if (zeroTxs.length > 0) {
    const senders = {};
    for (const tx of zeroTxs) {
      senders[tx.from] = (senders[tx.from] || 0n) + BigInt(tx.value || "0");
    }
    const sorted = Object.entries(senders)
      .map(([addr, val]) => ({ addr, val }))
      .sort((a, b) => (b.val > a.val ? 1 : -1))
      .slice(0, 5);
    console.log("Top senders to zero address:");
    for (const s of sorted) {
      console.log(`  ${s.addr} — ${weiToEth(s.val.toString())} ETH`);
    }
    console.log("");
  }

  // Output JSON for piping / memory logging
  const report = {
    chain: opts.chain,
    latestBlock,
    startBlock,
    timestamp: new Date().toISOString(),
    zeroAddrTxCount: zeroTxs.length,
    zeroAddrETH: weiToEth(totalZeroAddrETH.toString()),
    dustTxCount: dustTxs.length,
    dustETH: weiToEth(totalDustETH.toString()),
    failedTxCount: failedTxs.length,
    failedETH: weiToEth(totalFailedETH.toString()),
  };
  console.log("📦 JSON report:");
  console.log(JSON.stringify(report, null, 2));
  return report;
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
