# Pre-Trade Security Check Skill

This skill provides a comprehensive pre-trade security check for crypto assets, focusing on identifying rug pull and MEV risks. It integrates technical analysis, honeypot verification, and gas estimation for safe transaction execution.

## Features

*   **Rug Pull & Honeypot Detection:** Scans tokens for common rug pull indicators and honeypot characteristics using on-chain data and external API integrations.
*   **MEV Risk Assessment:** Analyzes potential MEV vulnerabilities, such as sandwich attacks and front-running, and provides gas estimations for safe execution.
*   **Technical Analysis (Triad):** Integrates Volume, RSI, and other indicators to assess market sentiment and potential trends.
*   **Zero-Knowledge (ZK) Honeypot Verification:** Utilizes ZK-proofs where applicable for enhanced, privacy-preserving honeypot verification.

## Tools & Dependencies

*   **Honeypot/Rug Check APIs:** Integrates with services like Sharpe AI, QuillCheck, RugDoc, and Honeypot.is.
*   **Technical Analysis Libraries:** Utilizes JavaScript libraries such as `trading-signals` for RSI, Volume, and other indicators.
*   **MEV Protection Tools:** Integrates with private RPCs (e.g., MEV-Blocker, Flashbots) and gas estimation services.
*   **ZK-Snark/STARK Libraries:** (If applicable for advanced ZK verification).

## Workflow

1.  **Input:** Token address, blockchain network, and desired transaction type.
2.  **Token Analysis:**
    *   Fetch token contract data.
    *   Perform basic checks: contract verification, creator, ownership.
    *   Query external APIs for honeypot/rug pull flags.
    *   Analyze buy/sell taxes and transfer restrictions.
3.  **Technical Analysis:**
    *   Fetch historical price and volume data.
    *   Calculate RSI and other key indicators.
    *   Assess current trading volume and trends.
4.  **MEV Risk Analysis:**
    *   Estimate gas costs for the intended transaction.
    *   Check for known MEV vulnerability patterns.
    *   Simulate transaction with MEV protection enabled.
5.  **Output:** A security score and detailed report including:
    *   Honeypot/Rug pull risk level.
    *   MEV risk level and gas estimation for safe execution.
    *   Technical analysis summary (vol/RSI).
    *   Any detected ZK honeypot indicators.

## Setup

*   Requires API keys for integrated services (if not public).
*   Requires access to blockchain RPC endpoints.
*   Requires installation of JavaScript technical analysis libraries (e.g., `npm install trading-signals`).

## Usage Example

```bash
# Hypothetical command line usage
pre-trade-security-check --token 0x... --chain ethereum --tx-type swap --rpc https://mainnet.infura.io/v3/...
```

## TODO

*   Implement ZK honeypot verification mechanism.
*   Integrate with more comprehensive on-chain analysis tools.
*   Develop user-friendly CLI or API interface.
*   Add support for additional blockchain networks.
