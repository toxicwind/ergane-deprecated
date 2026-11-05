#!/usr/bin/env bun
// ergane retro — weave a deep-linked retrospective from raw evidence.
// Extends Ergane (the weaver) with a retrospective/report capability.
//
// Usage:
//   bun retro/retro.mjs                 # report for the CWD repo (git+audit)
//   bun retro/retro.mjs --live          # + live TV player snapshot (via CDP)
//   bun retro/retro.mjs --output out.md # output path (default ./ERGANE-RETRO.md)
//   bun retro/retro.mjs --scope nuvio   # scope in the stamp + deep-links

import { gitState, commitLog } from "./providers/git.js";
import { auditRules } from "./providers/audit.js";
import { liveSnapshot } from "./providers/live.js";
import { sectionLink, ruleLink, stamp, slug } from "./deeplinks.js";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function arg(name, dflt = null) { const i = process.argv.indexOf(name); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt; }
function has(name) { return process.argv.includes(name); }

const ROOT = process.cwd();
const SCOPE = arg("--scope", "repo");
const OUT = resolve(arg("--output", "./ERGANE-RETRO.md"));
const STAMP = stamp(new Date(), SCOPE);

const git = gitState(ROOT);
const history = commitLog(ROOT);
const audit = auditRules(ROOT);
const live = has("--live") ? await liveSnapshot() : { ok: false, note: "skipped (no --live)" };

const sections = [];
const sec = (s, heading, body, rules = []) => sections.push({ slugName: s, heading, body, rules, index: sections.length });

sec("summary", "TL;DR", [
  `Ergane retro ${STAMP}`,
  `Working tree: ${git.dirty ? "DIRTY" : "clean"} · HEAD: ${git.headShort} (${git.branch})`,
]);
sec("git-state", "Evidence — git", [
  `Branch: ${git.branch}`,
  `HEAD:   ${git.head}`,
  `Unpushed: ${git.unpushed ? `\n${git.unpushed}\n(${git.unpushedNote})` : "none (all pushed)"}`,
  `History:\n${history.map((c) => "  " + c).join("\n")}`,
]);
sec("audit-rules", "Contract audit", audit.rules.map((r) => `* [${r.pass ? "PASS" : "FAIL"}] ${r.name} — ${r.detail}`));
sec("live-state", "Live snapshot", [
  live.ok ? `playing:${live.playing} muted:${live.muted} time:${live.time}s/${live.dur}s` : `no probe (${live.error || live.note})`,
  (live.body || "").slice(0, 80),
]);

const L = [];
L.push(`# Ergane — Deep-Linked Retrospective\n`);
for (const s of sections) {
  L.push(`\n## ${s.heading}`);
  L.push(`Link: \`${sectionLink(STAMP, s.index, s.slugName)}\``);
  L.push("");
  const body = Array.isArray(s.body) ? s.body.join("\n") : String(s.body);
  L.push(body);
  if (s.slugName === "audit-rules") {
    audit.rules.forEach((r, i) => {
      L.push(`- \`${ruleLink(STAMP, s.index, s.slugName, r.id)}\` ${r.pass ? "PASS" : "FAIL"} ${r.name}`);
    });
  }
  L.push("");
}
writeFileSync(OUT, L.join("\n"));
console.log(`[ergane-retro] wrote ${OUT}`);
console.log(`[ergane-retro] all-pass(core): ${audit.allPass}`);
console.log(`[ergane-retro] link: ${sectionLink(STAMP, 0, "summary")}`);