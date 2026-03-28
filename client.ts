/**
 * Shared HTTP client for the Agent Manager API.
 *
 * Initialised from the plugin's injected config (api.config.baseUrl)
 * with a fallback to the AGENT_MANAGER_URL env var and finally localhost.
 */

let BASE_URL = (process.env.AGENT_MANAGER_URL || "http://localhost:8000/api").replace(/\/+$/, "");

/**
 * Called once from the plugin entry point to apply config from OpenClaw.
 */
export function configure(config: { baseUrl?: string }) {
  if (config.baseUrl) {
    BASE_URL = config.baseUrl.replace(/\/+$/, "");
  }
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
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
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
