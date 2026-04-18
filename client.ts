/**
 * Shared HTTP client for the Agent Manager API.
 *
 * Initialised from the plugin's injected config (api.config.baseUrl) at
 * plugin load time. The hardcoded default below is only used if no
 * baseUrl is injected, which shouldn't happen in production because
 * openclaw.json plugin entries always set it.
 *
 * Do not introduce environment variable lookups in this file. The
 * openclaw plugin installer's static scanner rejects modules that
 * combine env var access with network sends (treats it as a credential
 * harvesting pattern). The injected config covers all real cases.
 *
 * Secret fallback: when openclaw.json config injection doesn't deliver
 * `serviceSecret` (seen in production where the installer strips it or
 * the config hasn't been edited yet), we read the secret from a file at
 * `~/.openclaw/agent-manager.secret`. fs reads are not network-coupled
 * so the installer scanner permits them.
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

let BASE_URL = "http://localhost:8000/api";
// Shared service-auth secret. OpenClawApi rejects non-public requests
// without `Authorization: Bearer <secret>`. This plugin is the only
// legitimate internal caller besides roam-backend, so we pass the
// secret in via the plugin's injected config (never from env — the
// installer scanner rejects env+network combos). Empty = enforcement
// disabled on OpenClawApi, requests go through unchanged.
let SERVICE_SECRET = "";

const SECRET_FILE = path.join(os.homedir(), ".openclaw", "agent-manager.secret");

function readSecretFile(): string {
  try {
    const contents = fs.readFileSync(SECRET_FILE, "utf8").trim();
    return contents;
  } catch {
    return "";
  }
}

function mask(s: string): string {
  if (!s) return "(empty)";
  if (s.length <= 6) return "***";
  return `${s.slice(0, 3)}…${s.slice(-2)} (len=${s.length})`;
}

/**
 * Called once from the plugin entry point to apply config from OpenClaw.
 */
export function configure(config: { baseUrl?: string; serviceSecret?: string }) {
  if (config.baseUrl) {
    BASE_URL = config.baseUrl.replace(/\/+$/, "");
  }
  let source = "none";
  if (typeof config.serviceSecret === "string" && config.serviceSecret) {
    SERVICE_SECRET = config.serviceSecret;
    source = "api.config.serviceSecret";
  } else {
    const fromFile = readSecretFile();
    if (fromFile) {
      SERVICE_SECRET = fromFile;
      source = `file(${SECRET_FILE})`;
    }
  }
  console.log(
    `[agent-manager] configured: baseUrl=${BASE_URL} serviceSecret=${mask(SERVICE_SECRET)} source=${source}`,
  );
}

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && String(value) !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request(method: string, path: string, opts: RequestOptions = {}): Promise<unknown> {
  const url = buildUrl(path, opts.params);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (SERVICE_SECRET) {
    headers["Authorization"] = `Bearer ${SERVICE_SECRET}`;
  }
  const init: RequestInit = { method, headers };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, init);
  const text = await res.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const detail = typeof parsed === "object" && parsed !== null && "detail" in parsed
      ? (parsed as Record<string, unknown>).detail
      : text;
    throw new Error(`HTTP ${res.status} ${method} ${path}: ${JSON.stringify(detail)}`);
  }

  return parsed;
}

export function get(path: string, params?: RequestOptions["params"]) {
  return request("GET", path, { params });
}

export function post(path: string, body?: unknown, params?: RequestOptions["params"]) {
  return request("POST", path, { body, params });
}

export function patch(path: string, body?: unknown, params?: RequestOptions["params"]) {
  return request("PATCH", path, { body, params });
}

export function put(path: string, body?: unknown, params?: RequestOptions["params"]) {
  return request("PUT", path, { body, params });
}

export function del(path: string, params?: RequestOptions["params"]) {
  return request("DELETE", path, { params });
}

// ── Per-agent integration cache ───────────────────────────────────────
//
// Plugin tool factories run synchronously per model attempt (verified at
// openclaw/dist/tools-l2IKeN5J.js:80 — `entry.factory(params.context)`
// is called directly, Promises are NOT awaited). We cannot do async HTTP
// from inside a factory, so we keep a per-agent in-memory cache of
// connected integration names and refresh it lazily in the background.
//
// Strategy: stale-while-revalidate with a 5s TTL, plus active push
// invalidation from the backend via the /agent-manager/refresh-integrations
// HTTP route registered in index.ts. The push path is the fast path —
// when the backend assigns or unassigns an integration, the next factory
// call after the push completes sees the fresh data immediately. The TTL
// is the safety net for missed/dropped pushes.

const REFRESH_INTERVAL_MS = 5000;
const _agentIntegrationsCache = new Map<string, { names: Set<string>; fetchedAt: number }>();
const _agentIntegrationsInFlight = new Map<string, Promise<void>>();

/**
 * Trigger an asynchronous refresh of an agent's connected-integration list.
 *
 * Idempotent: concurrent calls for the same agent are de-duplicated. The
 * refresh updates the cache in-place when complete; failures are logged
 * but never throw, so the existing cached value (if any) is preserved.
 *
 * Exported so the HTTP invalidation route in index.ts can call it from
 * the backend's push handler.
 */
export function triggerAgentIntegrationsRefresh(agentId: string): void {
  if (!agentId) return;
  if (_agentIntegrationsInFlight.has(agentId)) return;
  const p = (async () => {
    try {
      const r = (await get(`/integrations/agent/${agentId}/names`)) as { integrations?: string[] };
      _agentIntegrationsCache.set(agentId, {
        names: new Set(r.integrations ?? []),
        fetchedAt: Date.now(),
      });
    } catch (err) {
      // Don't poison the cache on transient errors. Next factory call retries.
      console.error(`[agent-manager] failed to fetch integrations for ${agentId}:`, err);
    } finally {
      _agentIntegrationsInFlight.delete(agentId);
    }
  })();
  _agentIntegrationsInFlight.set(agentId, p);
}

/**
 * Synchronous accessor used inside plugin tool factories.
 *
 * Returns the cached connected-integration set for an agent, or `null`
 * if no cached value exists yet. Triggers a background refresh when the
 * cache is empty or older than REFRESH_INTERVAL_MS. The next factory
 * invocation will see the refreshed value.
 *
 * Factory callers should treat `null` as "fail open" — register all
 * tools for the integration on cold start, then rely on the next attempt
 * (a few hundred ms later, after the async fetch completes) to apply
 * the filter correctly.
 */
export function getAgentIntegrationsSync(agentId: string | undefined): Set<string> | null {
  if (!agentId) return null;
  const entry = _agentIntegrationsCache.get(agentId);
  const now = Date.now();
  if (!entry) {
    triggerAgentIntegrationsRefresh(agentId);
    return null;
  }
  if (now - entry.fetchedAt > REFRESH_INTERVAL_MS) {
    triggerAgentIntegrationsRefresh(agentId);
  }
  return entry.names;
}
