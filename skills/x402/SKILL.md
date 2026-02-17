# SKILL: x402 Machine Payments 🛰️💳

## Description: 
Enables the Sentinel Agent to participate in the "Machine Economy" by handling HTTP 402 (Payment Required) protocols. This skill allow the agent to autonomously purchase external APIs, compute, and data feeds, as well as gate its own intelligence behind x402 micropayments.

## Logic Flow:
1. **Request:** Agent hits an x402-enabled endpoint (e.g., `GET alpha.sentinel-ai.com/signals`).
2. **Challenge:** Server responds with `HTTP 402` and a header containing the payment requirement (Network, Amount, Address).
3. **Settlement:** Agent uses Bankr to execute the payment in USDC.e or $CLAW on the Base network.
4. **Retry:** Agent retries the request with the transaction hash as proof-of-payment.
5. **Unlock:** Server verifies the hash and releases the data.

## Implementation:
This skill utilizes a Cloudflare Worker as the 'Gatekeeper' for the Sentinel's local `SURVEILLANCE_DATABASE.md`.

---
**Status:** DEVELOPING
**Rail:** Base (L2)
**Currency:** USDC / $CLAW
