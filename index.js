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
