# SentinelAI Human Terminal

This is the human-facing dApp for the Sentinel AI network, built with **Base OnchainKit** and **Next.js**.

## Features
- **Wallet Connection:** Native Base/Coinbase Smart Wallet integration.
- **Alpha Feed:** Real-time access to the Sentinel's surveillance logs.
- **x402 Integration:** Micropayment gating for premium signals.
- **Burn Tracker:** Live visualization of the $CLAW deflationary loop.

## Deployment
This dApp is designed to be hosted on **Cloudflare Pages**.

1. Connect your GitHub repository to Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the build output directory to `.next`.
4. Add your Coinbase Developer Platform (CDP) API key to the environment variables.

## Technical Stack
- Framework: Next.js 14
- Components: OnchainKit (Coinbase)
- Messaging: x402 Protocol
