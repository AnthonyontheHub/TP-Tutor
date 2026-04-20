// One-shot transformation: resets initialMasteryMap.ts to a clean fresh-slate
// state suitable for any new user.
//
// Run with:  node scripts/reset-to-fresh-slate.cjs

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/initialMasteryMap.ts');
let src = fs.readFileSync(filePath, 'utf8');

// ── 1. Reset every non-not_started status ─────────────────────────────────
src = src.replace(/status: 'introduced'/g,  "status: 'not_started'");
src = src.replace(/status: 'practicing'/g,  "status: 'not_started'");
src = src.replace(/status: 'confident'/g,   "status: 'not_started'");
src = src.replace(/status: 'mastered'/g,    "status: 'not_started'");

// ── 2. Clear mastery-candidate flags ─────────────────────────────────────
src = src.replace(/isMasteryCandidate: true/g, 'isMasteryCandidate: false');

// ── 3. Clear session notes — handles both quote styles and both layouts:
//      multiline (key on one line, value indented on next) and
//      single-line (key and value on the same line).
src = src.replace(/sessionNotes:\s*\n\s*'[^']*'/g, "sessionNotes: ''");
src = src.replace(/sessionNotes:\s*\n\s*"[^"]*"/g, "sessionNotes: ''");
src = src.replace(/sessionNotes: '[^']+'/g,         "sessionNotes: ''");
src = src.replace(/sessionNotes: "[^"]+"/g,         "sessionNotes: ''");

// ── 4. Anonymise top-level metadata ──────────────────────────────────────
src = src.replace(/studentName:\s*'[^']*'/, "studentName: ''");
src = src.replace(/lastUpdated:\s*'[^']*'/,  "lastUpdated: ''");

// ── 5. Update the sync comment in the file header ────────────────────────
src = src.replace(
  /\/\/ Last synced:.*\n/,
  '// Fresh-slate default — all statuses start at Not Started.\n'
);

fs.writeFileSync(filePath, src, 'utf8');
console.log('Done. initialMasteryMap.ts has been reset to a fresh slate.');
