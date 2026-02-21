# predict-market-poller

Purpose: Poll odds, liquidity, and volatility across Polymarket and Azuro on Base to generate trading signals.

What it does:
- Fetch market odds, 24h volume, and liquidity from Polymarket (gamma-api.polymarket.com) and Azuro (SDK endpoints) on Base.
- Detect significant moves (odds shift > x%, volume spikes > y).
- Output signals with market identifiers, odds, volume, and a confidence score.

Inputs:
- None (scheduled or on-demand trigger)
- Config: thresholds for odds move, volume spike, confidence target

Outputs:
- JSON signal objects: { market, event, odds, volume, timestamp, confidence }

---

# azuro-bet-optimizer

Purpose: Low-risk bet sizing for Azuro on Base; leverage Bankr for USDC staking where available.

What it does:
- Connect to Azuro SDK for Base to fetch available games and odds.
- Compute bet sizing using conservative risk model (Kelly criterion-like, reduced stake for high-variance games).
- Interface with Bankr to allocate USDC stake pools and manage bets.
- Place bets via Azuro SDK, handling approvals and error cases.

Inputs:
- Bankr API/SDK access (USDC staking capability)
- Azuro SDK access (Base chain)
- Config: risk tolerance, bankroll, odds thresholds

Outputs:
- Bet placement results: { gameId, betId, amount, odds, potentialPayout, status }
