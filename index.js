// Sentinel AI - ACP & x402 Gatekeeper v1.1
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // ACP Compliance Headers
    const headers = {
      "Content-Type": "application/json",
      "X-ACP-Version": "1.0",
      "X-Agent-Class": "Intelligence/Sentinel",
      "Access-Control-Allow-Origin": "*"
    };

    // 1. Define the Alpha Data
    const alphaSignal = {
      agent_id: "Sentinel-AI-v1",
      strategy: "AI-Native Hedge Fund Alpha",
      target: "Monitor GitHub for latest SURVEILLANCE_DATABASE.md",
      status: "Operational"
    };

    // 2. x402 Challenge
    const hasPayment = request.headers.get("X-Sentinel-Payment-Hash");

    if (!hasPayment) {
      return new Response(JSON.stringify({
        status: 402,
        message: "Payment Required: x402 Protocol Active",
        payment_options: {
          usdc_amount: "0.50",
          claw_stake_req: "10,000,000",
          destination_wallet: "0x0b2e5d581019bfa67c41f563eb8b6773b8d818aa"
        }
      }), {
        status: 402,
        headers: { 
          ...headers,
          "X-402-Payment-Required": "Base:0x0b2e5d581019bfa67c41f563eb8b6773b8d818aa:0.50"
        }
      });
    }

    return new Response(JSON.stringify(alphaSignal), { headers });
  }
};
<!--- Buy $CLAW Buttons (Live Mode Toggle) --->
<div class="buy-claw-container">
<h3>🤑 Buy $CLAW & Get Signals</h3>
<div id="snipe-mode">
<button onclick="buyClaw('Snipe')">Snipe Mode (5-25x)</button>
<p id="snipe-status">Live: Connect wallet for swap (mock for now)</p>
</div>
<div id="moon-mode">
<button onclick="buyClaw('Moon')">Make Me Richer (20-100x)</button>
<p id="moon-status">Signals: Email opt-in for alpha</p>
</div>
<script>
function buyClaw(mode) {
  document.getElementById(mode.toLowerCase() + '-status').innerText = mode + ' swap simulated: 100 $CLAW bought! (Real: OnchainKit swap). Signals unlocked.';
}
fetch('https://api.dexscreener.com/latest/dex/tokens/0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b')
.then(r => r.json()).then(data => {
  const price = data.pairs[0]?.priceUsd || 'N/A';
  document.querySelector('h3').innerHTML += `<br>BNKR Live Price: $${price}`;
});
</script>
<style>
.buy-claw-container { border: 1px solid #fee2e2; padding: 16px; border-radius: 8px; }
button { padding: 8px 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; width: 100%; margin: 5px 0; }
p { font-size: 12px; color: #6b7280; }
</style>
