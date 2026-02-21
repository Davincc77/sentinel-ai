# MEV Shield Agent Skill

This skill provides MEV protection for transactions on the Base network. It enables secure transaction execution using Flashbots bundles and private RPCs to avoid sandwich attacks and front-running.

## Tools

- `mev_send_private_tx`: Send a transaction via a private RPC (MEV-Blocker/Flashbots) to avoid the public mempool.
- `mev_simulate_bundle`: Simulate a bundle of transactions against the latest block.
- `mev_send_bundle`: Send a bundle of transactions to Flashbots/builders.

## Setup

1.  Requires a private key environment variable `ETH_PRIVATE_KEY` (or similar secure storage).
2.  Requires an RPC URL for Base (e.g., Alchemy, Infura, or a public endpoint).
3.  Optional: Flashbots Relay URL for Base (if different from default).

## Usage

Use `mev_send_private_tx` for standard swaps or transfers that need protection.
Use `mev_send_bundle` for complex sequences or atomic arbitrage requiring strict ordering.
