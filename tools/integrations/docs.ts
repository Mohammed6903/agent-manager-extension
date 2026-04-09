
import { Type } from "@sinclair/typebox";
import { get, post, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "google_docs";

const INTEGRATION_TOOLS: any[] = [
{
    name: "docs_create_document",
    description: "Create a new Google Docs document.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent creating the document" }),
      title: Type.String({ description: "Title of the new document" }),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, title } = p;
      return json(await post("/integrations/docs/documents", { agent_id, title }));
    },
  },
{
    name: "docs_get_document",
    description: "Get the full structure of a Google Docs document.",
    parameters: Type.Object({
      document_id: Type.String({ description: "ID of the document" }),
      agent_id: Type.String({ description: "The agent performing the request" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/docs/documents/${encodeURIComponent(p.document_id)}`, {
          agent_id: p.agent_id,
        })
      );
    },
  },
{
    name: "docs_append_text",
    description: "Append text to the end of a Google Docs document.",
    parameters: Type.Object({
      document_id: Type.String({ description: "ID of the document" }),
      agent_id: Type.String({ description: "The agent performing the request" }),
      text: Type.String({ description: "Text to append" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post(`/integrations/docs/documents/${encodeURIComponent(p.document_id)}/append`, {
          agent_id: p.agent_id,
          text: p.text,
        })
      );
    },
  },
{
    name: "docs_batch_update",
    description: "Apply multiple updates (formatting, insertions, deletions) to a Google Docs document.",
    parameters: Type.Object({
      document_id: Type.String({ description: "ID of the document" }),
      agent_id: Type.String({ description: "The agent performing the request" }),
      requests: Type.Array(Type.Object({}, { description: "Update requests" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post(`/integrations/docs/documents/${encodeURIComponent(p.document_id)}/batchUpdate`, {
          agent_id: p.agent_id,
          requests: p.requests,
        })
      );
    },
  }
];

export function register(api: any) {
  // Per-agent tool factory: only expose these tools to agents that have
  // the integration assigned. See client.ts for the cache strategy.
  api.registerTool((ctx: any) => {
    const cached = getAgentIntegrationsSync(ctx?.agentId);
    // Cold start (cache not warm yet) → fail-open with all tools.
    if (cached === null) return INTEGRATION_TOOLS;
    return cached.has(INTEGRATION_NAME) ? INTEGRATION_TOOLS : null;
  });
}
