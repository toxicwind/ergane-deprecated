// hephaestos/providers/git.js
// Evidence provider: current git state (branch, unpushed, clean, commit history).
// Modular provider — one concern per file, pure-ish functions taking a repo root.

import { execSync } from "node:child_process";

export function gitState(root = ".") {
  const run = (cmd) => {
    try { return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
    catch (_) { return ""; }
  };
  // "pushed" is judged against the LOCAL upstream/origin tracking ref (offline
  // safe; does not auto-fetch). If the local ref is stale the result reads as
  // unpushed — the caller can `git fetch` for a fresh verdict.
  const branch = run("git rev-parse --abbrev-ref HEAD");
  const upstream = run("git rev-parse --abbrev-ref @{u} 2>/dev/null") || `origin/${branch}`;
  const unpushed = run(`git log --oneline ${upstream}..HEAD 2>/dev/null`);
  return {
    branch,
    upstream,
    head: run("git log --oneline -1"),
    headShort: run("git rev-parse --short HEAD"),
    dirty: run("git status --porcelain"),
    unpushed,
    unpushedNote: unpushed ? "vs local tracking ref (may be stale; git fetch to confirm)" : "none (all pushed)",
    history: run("git log --oneline -12")
  };
}

// Derive a STRUCTURED list of commit-scope lines from history (for the retro).
export function commitLog(root = ".", n = 12) {
  const h = gitState(root).history;
  return h.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, n);
}