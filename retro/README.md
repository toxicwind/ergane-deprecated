# Ergane · retro — deep-linked retrospective capability

Ergane, the weaver, gains a **retrospective/report** capability: it fuses
raw evidence (git state, contract/doctrine audit, and optionally a live TV
player snapshot) into a **deep-linkable** Markdown report. Every section and
audit rule carries a stable `ergane://retro/<stamp>#s<i>-<slug>[:rule]` id, so
any part of a retrospective can be referenced, opened, or driven by another
tool (agent, CI gate, docs surface).

## Why it lives here

The workshop already had "hephaistos" (the Smith, MCP core). The retrospective-
weaving tool is the **weaver's** job — hence it extends `ergane` rather than
spawning a colliding "hephaestos" product. Fits the ticket/run-report lineage
(`src/report/renderReport.ts` is the in-package HTML report producer; `retro/`
is the evidence-weaving sibling).

## Architecture (modular)

```
retro/
  retro.mjs            # CLI entry — weave providers -> deep-linked report
  deeplinks.js         # ergane:// section/rule id model
  providers/
    git.js             # evidence: branch/head/unpushed/history
    audit.js           # contract: tree-clean / pushed / branch rules
    live.js            # evidence: live TV player snapshot via CDP (optional)
```

- **One concern per provider** — swap/add a provider without touching the core.
- **Deep-linkable** — `sectionLink()/ruleLink()` give every section/rule an id.
- **Evidence-first** — the report stamps live/probe state; the `unpushed`
  indicator is honest about comparing against the *local* tracking ref (no
  auto-fetch — `git fetch` for a fresh verdict).

## Usage

```bash
# git + audit retrospective for the CWD repo
bun retro/retro.mjs --output retro.md
#        ^ or: bun run retro   (from the ergane package root)

# add the live TV player snapshot (needs the LG CDP tunnel up)
bun retro/retro.mjs --live --scope nuvio-webos

# via the published bin
ergane-retro --live --scope nuvio-webos
```

## Example deep-links

- `ergane://retro/2026-11-01-nuvio-webos#s0-summary`
- `ergane://retro/2026-11-01-nuvio-webos#s3-audit-rules:pushed`

## Reading it

Single-page Markdown; sections are self-contained and addressable by the
`ergane://` link in each `##` block. Rules (from the contract audit provider)
carry `ergane://...#s<i>-<slug>:<rule>` links for per-rule references.