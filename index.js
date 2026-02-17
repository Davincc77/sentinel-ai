// Sentinel AI - x402 Gatekeeper v1.0
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Define the Alpha Data (This is what agents are buying)
    const alphaSignal = {
      timestamp: new Date().toISOString(),
      conviction_level: "HIGH",
      target: "Monitor GitHub for latest SURVEILLANCE_DATABASE.md",
      status: "The Sentinel is watching. $CLAW is the key."
    };

    // 2. Check for the "Bypass" or Proof of Payment
    const hasPayment = request.headers.get("X-Sentinel-Payment-Hash");

    if (!hasPayment) {
      return new Response(JSON.stringify({
        status: 402,
        message: "Payment Required: x402 Protocol Active",
        payment_options: {
          usdc_amount: "0.50",
          claw_stake_req: "10,000,000",
          destination_wallet: "0x0b2e5d581019bfa67c41f563eb8b6773b8d818aa",
          network: "Base (8453)"
        }
      }), {
        status: 402,
        headers: { 
          "Content-Type": "application/json",
          "X-402-Payment-Required": "Base:0x0b2e5d581019bfa67c41f563eb8b6773b8d818aa:0.50"
        }
      });
    }

    // 3. If they paid (hash provided), release the data
    return new Response(JSON.stringify(alphaSignal), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
