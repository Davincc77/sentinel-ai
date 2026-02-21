// query.js - fetch dust/failed-send like events from a public explorer API
// This is a lightweight placeholder demonstrating structure.
const fetch = require("node-fetch");
async function main(){
  const base = process.env.EXPLORER_API || "https://api.etherscan.io/api";
  const apiKey = process.env.ETHERSCAN_KEY || "YourApiKeyToken";
  const module = process.env.MODULE || "account";
  // Simple dust-like heuristic: P2PKH style empty-to addresses with 0 value? Here we just fetch normal txs to zero addresses example
  const url = `${base}?module=${module}&action=txlist&address=0x0000000000000000000000000000000000000000&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
  console.log("Fetching:", url);
  const r = await fetch(url);
  const j = await r.json();
  console.log(JSON.stringify(j,null,2).slice(0,1000));
}
main().catch(e=>console.error(e));
