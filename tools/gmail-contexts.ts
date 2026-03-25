import { Type } from "@sinclair/typebox";
import { get, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "thirdparty_context_list",
    description: "List all third party contexts assigned to an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's ID to list contexts for" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/contexts/third-party", { agent_id: p.agent_id, user_id: p.user_id }));
    },
  });

  api.registerTool({
    name: "thirdparty_context_get",
    description: "Get a specific Third Party context by its ID with status information.",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context UUID" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/contexts/third-party/${encodeURIComponent(p.context_id)}`, { user_id: p.user_id }));
    },
  });

  api.registerTool({
    name: "thirdparty_context_delete",
    description: "Delete a Third Party context and its associated data (S3, Qdrant, DB).",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context UUID to delete" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/contexts/third-party/${encodeURIComponent(p.context_id)}`, { user_id: p.user_id }));
    },
  });

  api.registerTool({
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
  });

  api.registerTool({
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
  });

  api.registerTool({
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
  });
}
