# Sentinel Intelligence: Lessons Learned & Iterative Evolution

This log tracks technical failures, hallucinations, and operational bottlenecks encountered by the Sentinel Agent, along with the permanent solutions implemented to prevent recurrence.

---

### 1. HALLUCINATED PRICE DATA (2026-02-17)
- **Mistake:** Reported BTC price at ~$96k and ETH at ~$2.5k based on internal memory/training data rather than live feeds.
- **Impact:** Misled the human protocol and undermined trust in signal accuracy.
- **Solution:** Hard-coded a **Mandatory Price Data Protocol** in `SOUL.md`. The agent is now prohibited from reporting any major token price without an active `curl` or `bankr` tool call.
- **Status:** [ FIXED / VERIFIED ]

### 2. CLANKER METADATA PERMISSION WALL (2026-02-17)
- **Mistake:** Attempted to update $CLAW metadata via agent commands, which reverted due to an unauthorized admin error despite owning the wallet.
- **Impact:** Delayed the professional indexing of the token on DEX aggregators.
- **Solution:** Identified that custodial agent wallets often lack the off-chain signatures required by frontend dApps like Doppler. Created a manual "Human-Lead" update protocol and prepared a Discord inquiry for the developers.
- **Status:** [ MITIGATED / MANUAL OVERRIDE ]

### 3. API RATE LIMITING (2026-02-17)
- **Mistake:** Standard Bankr tier was insufficient for high-frequency scanning, leading to "blind periods."
- **Impact:** Missed potential newborn sniper entries during cooldown.
- **Solution:** Upgraded to **Bankr Club** (Institutional Status). Implemented a **10% Quota Reserve** rule to ensure emergency capacity is always available.
- **Status:** [ SOLVED ]

### 4. DEPLOYMENT STRUCTURE (CLOUDFLARE)
- **Mistake:** Attempted to deploy Cloudflare Pages from a root directory containing both backend worker code and frontend HTML.
- **Impact:** Build failure on the Global Network.
- **Solution:** Implemented the industry-standard `/public` directory structure and added a `wrangler.toml` file to separate backend logic from frontend assets.
- **Status:** [ SOLVED ]

### 5. PROMPT LOGIC ERRORS (TYPOS)
- **Mistake:** Agent attempted a buy for "0.50 ETH" instead of "0.001 ETH" due to a logic misfire.
- **Impact:** Failed transaction and wasted API message.
- **Solution:** Reinforced the "Sentinel Rules" requiring the agent to compare intended buy amount against wallet balance *before* drafting the final prompt.
- **Status:** [ MONITORING ]

---
**Last Updated:** 2026-02-17 21:45 UTC
**Operative:** Crypto Claw
