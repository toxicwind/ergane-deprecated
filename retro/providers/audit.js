// hephaestos/providers/audit.js
// Evidence provider: contract/doctrine checks against the estate rules.
// Modular — this owns "did we commit+push, clean tree, no dead code, pushed".

import { gitState } from "./git.js";

// Evaluate the estance non-negotiables from git state alone (deterministic).
export function auditRules(root = ".") {
  const s = gitState(root);
  const checks = [];
  checks.push({
    id: "tree-clean",
    name: "Working tree clean",
    pass: (s.dirty || "").length === 0,
    detail: s.dirty ? `dirty: ${s.dirty.split("\n").slice(0, 3).join(" | ")}` : "clean"
  });
  checks.push({
    id: "pushed",
    name: "Commits pushed to origin",
    pass: (s.unpushed || "").length === 0,
    detail: s.unpushed ? `unpushed:\n${s.unpushed}` : "all pushed"
  });
  checks.push({
    id: "branch",
    name: "On a real branch (not detached)",
    pass: !!s.branch && s.branch !== "HEAD",
    detail: s.branch
  });
  return { rules: checks, allPass: checks.every((c) => c.pass) };
}