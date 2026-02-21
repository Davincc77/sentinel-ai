---
name: skill-integrity-auditor
description: Scans installed OpenClaw skills for known malicious indicators — C2 IPs, credential exfiltration patterns, obfuscated code, reverse shells, and typosquat signatures from the ClawHavoc campaign (Feb 2026). Outputs a per-skill risk report.
version: 1.0.0
author: Vince's Agent
---

# Skill Integrity Auditor

**Post-install security scanner for OpenClaw skills.**

ClawHub's marketplace was hit with 1,184+ malicious skills in the ClawHavoc campaign (Feb 2026). ClawHub now runs VirusTotal on *new* submissions, but nothing protects skills **already installed** on your machine. This skill fills that gap.

## What It Detects

| Category | Examples |
|----------|---------|
| **C2 Infrastructure** | Known malicious IPs (91.92.242.30, etc.), suspicious outbound connections |
| **Credential Harvesting** | Reads of `~/.openclaw/config`, env var exfil (`PRIVATE_KEY`, `API_KEY`, `SSH`) |
| **Reverse Shells** | `nc -e`, `bash -i >& /dev/tcp`, `python -c 'import socket'` patterns |
| **Obfuscation** | Base64-encoded payloads, `eval(atob(...))`, hex-encoded strings > 100 chars |
| **Typosquatting** | Levenshtein distance < 3 from known legitimate skill names |
| **Data Exfiltration** | `curl`/`wget`/`fetch` to non-allowlisted domains with sensitive data piping |

## Usage

```bash
# Scan all installed skills
node scripts/audit.js --skills-dir ~/.openclaw/workspace/skills

# Scan a specific skill
node scripts/audit.js --skill ~/.openclaw/workspace/skills/some-skill

# JSON output for agent consumption
node scripts/audit.js --skills-dir ~/.openclaw/workspace/skills --json

# Verbose mode (shows every file scanned)
node scripts/audit.js --skills-dir ~/.openclaw/workspace/skills --verbose
```

## Output

Returns a per-skill risk assessment:

```
[CLEAN]    bankr — 0 findings
[WARN]     some-tool — 2 findings (obfuscated string, outbound fetch)
[CRITICAL] fake-wallet — 5 findings (C2 IP match, credential read, reverse shell)
```

## Integration

Run this after installing any new skill, or on a cron/heartbeat schedule:

```bash
# In HEARTBEAT.md or cron
node ~/workspace/skills/skill-integrity-auditor/scripts/audit.js --skills-dir ~/workspace/skills --json
```

## Security Notes

- This tool is **read-only** — it never modifies scanned skills
- Does not phone home or make network requests
- All pattern matching runs locally via regex
- IOC list can be extended in `scripts/ioc-patterns.json`
