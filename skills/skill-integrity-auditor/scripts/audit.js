#!/usr/bin/env node
/**
 * Skill Integrity Auditor v1.0.0
 * Scans installed OpenClaw skills for known malicious indicators.
 * Read-only. No network requests. Pure local regex scanning.
 */

const fs = require('fs');
const path = require('path');

// --- Config ---
const IOC_FILE = path.join(__dirname, 'ioc-patterns.json');
const SCAN_EXTENSIONS = ['.js', '.ts', '.py', '.sh', '.bash', '.mjs', '.cjs', '.json', '.md', '.yaml', '.yml', '.toml'];
const MAX_FILE_SIZE = 512 * 1024; // 512KB per file

// --- Parse args ---
const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--skills-dir' && args[i + 1]) flags.skillsDir = args[++i];
  else if (args[i] === '--skill' && args[i + 1]) flags.singleSkill = args[++i];
  else if (args[i] === '--json') flags.json = true;
  else if (args[i] === '--verbose') flags.verbose = true;
  else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`Usage: node audit.js [--skills-dir DIR | --skill DIR] [--json] [--verbose]`);
    process.exit(0);
  }
}

if (!flags.skillsDir && !flags.singleSkill) {
  flags.skillsDir = path.join(process.env.HOME || '/home/user', '.openclaw', 'workspace', 'skills');
}

// --- Load IOCs ---
let iocs;
try {
  iocs = JSON.parse(fs.readFileSync(IOC_FILE, 'utf8'));
} catch (e) {
  console.error(`[ERROR] Cannot load IOC patterns: ${e.message}`);
  process.exit(1);
}

// --- Build compiled regexes ---
function buildPatterns(arr) {
  return (arr || []).map(p => {
    try { return new RegExp(p, 'gi'); }
    catch { return null; }
  }).filter(Boolean);
}

const patterns = {
  c2: iocs.c2_ips.map(ip => new RegExp(ip.replace(/\./g, '\\.'), 'g')),
  credential: buildPatterns(iocs.credential_patterns),
  reverseShell: buildPatterns(iocs.reverse_shell_patterns),
  obfuscation: buildPatterns(iocs.obfuscation_patterns),
  exfil: buildPatterns(iocs.exfil_patterns),
  suspiciousDomains: (iocs.suspicious_domains_blocklist || []).map(d => new RegExp(d.replace(/\./g, '\\.'), 'gi')),
};

const legitimateNames = new Set(iocs.legitimate_skill_names || []);

// --- Levenshtein for typosquat detection ---
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
      );
  return dp[m][n];
}

function checkTyposquat(name) {
  if (legitimateNames.has(name)) return null;
  for (const legit of legitimateNames) {
    const dist = levenshtein(name.toLowerCase(), legit.toLowerCase());
    if (dist > 0 && dist <= 2) {
      return { type: 'TYPOSQUAT', severity: 'HIGH', detail: `Name "${name}" is ${dist} edit(s) from legitimate skill "${legit}"` };
    }
  }
  return null;
}

// --- Scan a single file ---
function scanFile(filePath, content) {
  const findings = [];
  const lines = content.split('\n');

  function check(category, severity, regexes) {
    for (const re of regexes) {
      re.lastIndex = 0;
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        re.lastIndex = 0;
        const match = re.exec(lines[lineNum]);
        if (match) {
          // Skip if this is inside the auditor itself or IOC definitions
          const line = lines[lineNum].trim();
          if (line.startsWith('//') || line.startsWith('#') || line.startsWith('*')) continue;
          findings.push({
            type: category,
            severity,
            file: filePath,
            line: lineNum + 1,
            match: match[0].substring(0, 80),
            context: lines[lineNum].trim().substring(0, 120)
          });
        }
      }
    }
  }

  check('C2_IP', 'CRITICAL', patterns.c2);
  check('CREDENTIAL_ACCESS', 'HIGH', patterns.credential);
  check('REVERSE_SHELL', 'CRITICAL', patterns.reverseShell);
  check('OBFUSCATION', 'HIGH', patterns.obfuscation);
  check('DATA_EXFIL', 'CRITICAL', patterns.exfil);
  check('SUSPICIOUS_DOMAIN', 'MEDIUM', patterns.suspiciousDomains);

  return findings;
}

// --- Recursively get files ---
function getFiles(dir) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      if (entry.isDirectory()) {
        results.push(...getFiles(full));
      } else if (SCAN_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
        results.push(full);
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

// --- Scan a skill directory ---
function scanSkill(skillDir) {
  const skillName = path.basename(skillDir);
  const files = getFiles(skillDir);
  let allFindings = [];

  // Skip scanning ourselves
  if (skillName === 'skill-integrity-auditor') {
    return { name: skillName, status: 'SKIP', findings: [], filesScanned: 0, note: 'Self (auditor)' };
  }

  for (const file of files) {
    try {
      const stat = fs.statSync(file);
      if (stat.size > MAX_FILE_SIZE) continue;
      const content = fs.readFileSync(file, 'utf8');
      const relPath = path.relative(skillDir, file);
      const findings = scanFile(relPath, content);
      allFindings.push(...findings);
      if (flags.verbose) {
        console.error(`  [scan] ${relPath} — ${findings.length} finding(s)`);
      }
    } catch (e) { /* skip unreadable files */ }
  }

  // Typosquat check
  const typo = checkTyposquat(skillName);
  if (typo) allFindings.push(typo);

  // Determine status
  let status = 'CLEAN';
  if (allFindings.some(f => f.severity === 'CRITICAL')) status = 'CRITICAL';
  else if (allFindings.some(f => f.severity === 'HIGH')) status = 'WARN';
  else if (allFindings.length > 0) status = 'INFO';

  return { name: skillName, status, findings: allFindings, filesScanned: files.length };
}

// --- Main ---
function main() {
  let skillDirs = [];

  if (flags.singleSkill) {
    skillDirs = [path.resolve(flags.singleSkill)];
  } else {
    try {
      const entries = fs.readdirSync(flags.skillsDir, { withFileTypes: true });
      skillDirs = entries
        .filter(e => e.isDirectory())
        .map(e => path.join(flags.skillsDir, e.name));
    } catch (e) {
      console.error(`[ERROR] Cannot read skills directory: ${e.message}`);
      process.exit(1);
    }
  }

  const results = [];
  for (const dir of skillDirs) {
    if (flags.verbose) console.error(`\nScanning: ${path.basename(dir)}`);
    results.push(scanSkill(dir));
  }

  // Output
  if (flags.json) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), scanned: results.length, results }, null, 2));
  } else {
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║   SKILL INTEGRITY AUDIT REPORT           ║`);
    console.log(`║   ${new Date().toISOString().slice(0, 19)}                ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);

    const critCount = results.filter(r => r.status === 'CRITICAL').length;
    const warnCount = results.filter(r => r.status === 'WARN').length;
    const cleanCount = results.filter(r => r.status === 'CLEAN').length;
    const skipCount = results.filter(r => r.status === 'SKIP').length;

    for (const r of results) {
      const icon = r.status === 'CRITICAL' ? '🔴' : r.status === 'WARN' ? '🟡' : r.status === 'SKIP' ? '⏭️' : '🟢';
      const tag = `[${r.status}]`.padEnd(12);
      console.log(`${icon} ${tag} ${r.name} — ${r.findings.length} finding(s), ${r.filesScanned} files scanned`);

      if (r.findings.length > 0 && r.status !== 'SKIP') {
        for (const f of r.findings.slice(0, 10)) {
          const loc = f.file ? `${f.file}:${f.line}` : 'name-check';
          console.log(`   └─ ${f.severity} ${f.type}: ${f.detail || f.match} (${loc})`);
        }
        if (r.findings.length > 10) {
          console.log(`   └─ ... and ${r.findings.length - 10} more`);
        }
      }
    }

    console.log(`\n── Summary ──────────────────────────────`);
    console.log(`   Total skills: ${results.length}`);
    console.log(`   🔴 Critical:  ${critCount}`);
    console.log(`   🟡 Warning:   ${warnCount}`);
    console.log(`   🟢 Clean:     ${cleanCount}`);
    console.log(`   ⏭️  Skipped:   ${skipCount}`);
    console.log(`─────────────────────────────────────────\n`);

    if (critCount > 0) {
      console.log(`⚠️  ACTION REQUIRED: ${critCount} skill(s) flagged CRITICAL. Review and remove immediately.`);
    }
  }

  process.exit(critCount > 0 ? 2 : warnCount > 0 ? 1 : 0);
}

const critCount = 0; // Will be set in main
main();
