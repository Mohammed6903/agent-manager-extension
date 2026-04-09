import { Type } from "@sinclair/typebox";
import { get, del, getAgentIntegrationsSync } from "../client";

const GMAIL_INTEGRATION = "gmail";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// Generic third-party context tools — always available regardless of which
// integrations the agent has connected. The agent uses these to discover
// and manage any third-party context (Gmail, Slack, etc.).
const ALWAYS_ON_CONTEXT_TOOLS = [
  {
    name: "thirdparty_context_list",
    description: "List all third party contexts assigned to an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's ID to list contexts for" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/contexts/third-party", { agent_id: p.agent_id, user_id: p.user_id }));
    },
  },
  {
    name: "thirdparty_context_get",
    description: "Get a specific Third Party context by its ID with status information.",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context UUID" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/contexts/third-party/${encodeURIComponent(p.context_id)}`, { user_id: p.user_id }));
    },
  },
  {
    name: "thirdparty_context_delete",
    description: "Delete a Third Party context and its associated data (S3, Qdrant, DB).",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context UUID to delete" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/contexts/third-party/${encodeURIComponent(p.context_id)}`, { user_id: p.user_id }));
    },
  },
];

// Gmail-specific search tools — only exposed to agents with the gmail
// integration assigned. These exist alongside the tools in
// tools/integrations/gmail.ts and use the same gmail integration name.
const GMAIL_SEARCH_TOOLS = [
  {
    name: "gmail_search_semantic",
    description: "Semantic search over all stored Gmail embeddings. Returns ranked, deduplicated results by message.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's ID" }),
      query: Type.String({ description: "The search query" }),
      top_k: Type.Optional(Type.Integer({ description: "Number of results to return (default: 10)" })),
      only_unread: Type.Optional(Type.Boolean({ description: "Only search unread emails (default: false)" })),
      has_attachment: Type.Optional(Type.Boolean({ description: "Only search emails with attachments (default: false)" })),
    }),
    async execute(_id: string, p: any) {
      const params = new URLSearchParams({
        agent_id: p.agent_id,
        query: p.query,
      });
      if (p.top_k !== undefined) params.append("top_k", String(p.top_k));
      if (p.only_unread !== undefined) params.append("only_unread", String(p.only_unread));
      if (p.has_attachment !== undefined) params.append("has_attachment", String(p.has_attachment));
      return json(await get(`/integrations/gmail/search/semantic?${params}`));
    },
  },
  {
    name: "gmail_search_snapshot",
    description: "Lightweight recent email summary for agent session context.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's ID" }),
      hours: Type.Optional(Type.Integer({ description: "Look back this many hours (default: 24)" })),
    }),
    async execute(_id: string, p: any) {
      const params = new URLSearchParams({ agent_id: p.agent_id });
      if (p.hours !== undefined) params.append("hours", String(p.hours));
      return json(await get(`/integrations/gmail/search/snapshot?${params}`));
    },
  },
  {
    name: "gmail_search_full",
    description: "Fetch full email body from S3 by message_id. Only call when agent needs complete content.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's ID" }),
      message_id: Type.String({ description: "The message ID to fetch" }),
    }),
    async execute(_id: string, p: any) {
      const params = new URLSearchParams({
        agent_id: p.agent_id,
        message_id: p.message_id,
      });
      return json(await get(`/integrations/gmail/search/full?${params}`));
    },
  },
];

export function register(api: any) {
  // Always-on generic context tools
  for (const tool of ALWAYS_ON_CONTEXT_TOOLS) {
    api.registerTool(tool);
  }

  // Gmail-specific search tools — gated on gmail integration assignment.
  api.registerTool((ctx: any) => {
    const cached = getAgentIntegrationsSync(ctx?.agentId);
    if (cached === null) return GMAIL_SEARCH_TOOLS;
    return cached.has(GMAIL_INTEGRATION) ? GMAIL_SEARCH_TOOLS : null;
  });
}
