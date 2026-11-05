// hephaestos/providers/live.js
// Evidence provider: live TV / player state via authoritative CDP Runtime.evaluate.
// Modular — this provider owns "what is actually happening on the TV right now".

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Resolve the Nuvio page's CDP websocket URL from the run/port files.
function nuvioWs() {
  let port = "";
  try { port = readFileSync("/tmp/lg-cdp.port", "utf8").trim(); } catch (_) {}
  if (!port) return null;
  let targets;
  try { targets = JSON.parse(execSync(`curl -s http://127.0.0.1:${port}/json`, { encoding: "utf8" })); }
  catch (_) { return null; }
  const t = targets.find((x) => x.type === "page" && /space\.nuvio/.test(x.url || ""));
  return t ? t.webSocketDebuggerUrl : null;
}

// Evaluate a JS expression on the Nuvio page (authoritative page context).
export function evalOnTv(expression, timeoutMs = 8000) {
  const wsUrl = nuvioWs();
  if (!wsUrl) return { error: "no-nuvio-tab" };
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => { try { ws.close(); } catch (_) {} resolve({ error: "timeout" }); }, timeoutMs);
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression, returnByValue: true } }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(String(ev.data));
      if (m.id !== 1) return;
      clearTimeout(timer);
      try { ws.close(); } catch (_) {}
      const val = m.result && m.result.result ? m.result.result.value : null;
      resolve(parseJson(val));
    };
    ws.onerror = () => { clearTimeout(timer); resolve({ error: "ws-error" }); };
  });
}

function parseJson(s) {
  if (typeof s !== "string") return s;
  try { return JSON.parse(s); } catch (_) { return s; }
}

// Snapshot the player + screen state for the retro's "live ground-truth" stamp.
export async function liveSnapshot() {
  const probe = await evalOnTv(
    'JSON.stringify((function(){var v=document.querySelector("video");return {playing:!!(v&&!v.paused),muted:v?v.muted:null,time:v&&!isNaN(v.currentTime)?Math.round(v.currentTime):-1,dur:v&&!isNaN(v.duration)?Math.round(v.duration):-1,body:(document.body.innerText||"").slice(0,80)};})())'
  );
  if (probe.error) return { ok: false, ...probe };
  return { ok: true, ...probe };
}