// ergane/retro/deeplinks.js
// Deep-link model: every section/rule in an Ergane retro report gets a stable
// `ergane://retro/<stamp>#<sec>` id so it can be referenced, opened, or driven
// programmatically. Building the id is a pure function of (stamp, key).

export const SCHEME = "ergane";

// Build the report stamp ("2026-11-01-nuvio-webos") from a date + scope.
export function stamp(date = new Date(), scope = "repo") {
  return `${date.toISOString().slice(0, 10)}-${scope}`;
}

// Deep-link for a section rule: ergane://retro/<stamp>#s<index>-<slug>
export function sectionLink(stampValue, index, slug) {
  return `${SCHEME}://retro/${stampValue}#s${index}-${slug}`;
}

export function ruleLink(stampValue, index, slug, ruleId) {
  return `${SCHEME}://retro/${stampValue}#s${index}-${slug}:${ruleId}`;
}

// Normalize a slug for use in a link (safe chars only).
export function slug(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "sec";
}