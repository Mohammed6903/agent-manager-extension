
import { Type } from "@sinclair/typebox";
import { get, post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
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
  });

  api.registerTool({
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
  });

  api.registerTool({
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
  });

  api.registerTool({
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
  });
}
