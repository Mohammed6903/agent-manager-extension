/**
 * Public-Q&A session guardrail.
 *
 * Wraps `api.registerTool` so that every tool this plugin registers is
 * automatically hidden from sessions running on the synthetic
 * `public-qa` message channel — except for a small allowlist of
 * read-only knowledge-lookup tools.
 *
 * Why this exists
 * ---------------
 * Q&A-typed agents are reachable via the unauthenticated public
 * endpoint on OpenClawApi (`/api/public/qa/{agentId}/chat`). That
 * path goes through `qa_chat_service`, which sends
 * `x-openclaw-message-channel: public-qa` on every gateway call. The
 * gateway translates that header into `ctx.messageChannel` at tool-
 * resolution time.
 *
 * Plugin tool factories can inspect `ctx` and return `null` to skip
 * registration for that specific session. We use the factory-form of
 * `api.registerTool` to hide every write-path tool (task_create,
 * task_update, every integration write, garage_post, deliver_chat_
 * message, secrets_set, etc.) and every integration READ tool (Gmail,
 * Drive, Slack — they would expose the founder's private third-party
 * data). Only a small allowlist of knowledge-lookup tools survives on
 * the public-qa channel.
 *
 * Founder's authenticated chat path (chat_service) does NOT send the
 * header, so `ctx.messageChannel` is undefined there and ALL tools
 * register normally — full functionality preserved.
 *
 * Reversibility: removing the header on the Python side, or deleting
 * the `public-qa` branch here, restores full tool access on the Q&A
 * path without any data migration.
 *
 * Allowlist rationale
 * -------------------
 * The Q&A agent's job is to answer visitor questions from the
 * founder's CURATED knowledge base. `context_search` is the primary
 * retrieval mechanism. `context_content`, `context_agent_list`,
 * `context_list`, and `context_get` are read-only lookups over manual
 * context documents the founder explicitly assigned. None of these
 * expose third-party data (Gmail, Drive, Slack inboxes, etc.) — those
 * live behind integration tools which are BLOCKED on public-qa.
 */

export const PUBLIC_QA_CHANNEL = "public-qa";

/**
 * Tool names permitted on the public-qa channel. Everything else —
 * including integration READS — is hidden. Keep this list tight:
 * adding a tool here exposes it to unauthenticated internet visitors.
 */
const PUBLIC_QA_ALLOWED_TOOLS: ReadonlySet<string> = new Set([
  "context_search",
  "context_content",
  "context_agent_list",
  "context_list",
  "context_get",
]);

type ToolContextLike = {
  messageChannel?: string;
} & Record<string, unknown>;

type AnyTool = { name: string; [key: string]: unknown };

type ToolFactory = (
  ctx: ToolContextLike,
) => AnyTool | AnyTool[] | null | undefined;

type RegisterToolArg = AnyTool | ToolFactory;

function isPublicQaContext(ctx: ToolContextLike | undefined): boolean {
  return ctx?.messageChannel === PUBLIC_QA_CHANNEL;
}

function keepTool(toolName: string, ctx: ToolContextLike | undefined): boolean {
  if (!isPublicQaContext(ctx)) return true;
  return PUBLIC_QA_ALLOWED_TOOLS.has(toolName);
}

/**
 * Wrap `api.registerTool` in-place so every subsequent call is
 * filtered through the public-qa guard.
 *
 * Supports both registration forms:
 *   - plain object:  `api.registerTool({ name, description, ... })`
 *   - factory fn:    `api.registerTool((ctx) => ({...}))`
 *
 * For plain objects, we swap in a factory that returns either the
 * original tool or null depending on context. For existing factories,
 * we compose: call the original factory, then filter its output.
 *
 * Call this ONCE at the top of the plugin's `register(api)` entry,
 * BEFORE any `registerXxx(api)` calls, so the wrapped version is in
 * place by the time sub-modules start registering.
 */
export function installPublicQaGuard(api: any): void {
  // Guard against double-wrapping if register(api) runs more than once.
  if (api.__publicQaGuardInstalled) return;
  api.__publicQaGuardInstalled = true;

  const original = api.registerTool.bind(api);

  api.registerTool = (toolOrFactory: RegisterToolArg, opts?: unknown) => {
    if (typeof toolOrFactory === "function") {
      // Compose: keep the original factory's logic, then post-filter its
      // output so anything it emits is still subject to the public-qa
      // allowlist.
      const userFactory = toolOrFactory as ToolFactory;
      const wrapped: ToolFactory = (ctx) => {
        let result: AnyTool | AnyTool[] | null | undefined;
        try {
          result = userFactory(ctx);
        } catch {
          return null;
        }
        if (!result) return result;
        if (!isPublicQaContext(ctx)) return result;
        const list = Array.isArray(result) ? result : [result];
        const kept = list.filter((t) => PUBLIC_QA_ALLOWED_TOOLS.has(t.name));
        if (kept.length === 0) return null;
        return Array.isArray(result) ? kept : kept[0];
      };
      return original(wrapped, opts);
    }

    // Plain object form — most registrations in this plugin use this.
    const tool = toolOrFactory as AnyTool;
    const factory: ToolFactory = (ctx) =>
      keepTool(tool.name, ctx) ? tool : null;
    return original(factory, opts);
  };
}
