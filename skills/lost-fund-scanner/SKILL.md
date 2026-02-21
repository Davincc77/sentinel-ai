lost-fund-scanner skill
=======================
Purpose:
- Analyze public blockchain data (Etherscan/Base explorer API) for ETH sent to wrong/empty addresses (dust txs, failed sends).
- Report stats and amounts for educational/audit purposes.
- No recovery actions or private-key access.
- Output to workspace and log results to memory for traceability.

What it does:
- Provides a factual summary of dust transactions and failed sends detected on-chain by querying public explorers.
- Generates simple stats (count, total ETH value) and per-address breakdowns when available.
- Avoids any speculative recovery or interaction with private keys.

Output artifacts:
- scripts/ will expose query and count utilities
- memory logs in memory/ lost-fund-scanner entries for auditing

Usage notes:
- Use the query script to fetch recent dust/failed-send events from Base/Etherscan style explorers.
- Use the count script to aggregate results for a given window.
- Log results via the local memory log facility so the main agent can review history.

Security: Do not store API keys in the repository; rely on environment variables or public endpoints only.
