import { Type } from "@sinclair/typebox";
import { get, post, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "secret_store",
    description: "Store or update encrypted credentials for an external service (e.g. a Notion API key).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to store secrets for" }),
      service_name: Type.String({ description: "Service identifier (e.g. notion, slack)" }),
      secret_data: Type.Record(Type.String(), Type.Any(), { description: "Key-value credential data to encrypt and store" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/secrets/", p));
    },
  });

  api.registerTool({
    name: "secret_list",
    description: "List the names of all stored secret services for an agent (no secret data is returned).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose secrets to list" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/secrets/${encodeURIComponent(p.agent_id)}`));
    },
  });

  api.registerTool({
    name: "secret_get",
    description: "Retrieve the decrypted credentials for a specific service.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose secret to retrieve" }),
      service_name: Type.String({ description: "Service identifier (e.g. notion)" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(
          `/secrets/${encodeURIComponent(p.agent_id)}/${encodeURIComponent(p.service_name)}`,
        ),
      );
    },
  });

  api.registerTool({
    name: "secret_delete",
    description: "Remove stored credentials for a service.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose secret to delete" }),
      service_name: Type.String({ description: "Service identifier to remove" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(
          `/secrets/${encodeURIComponent(p.agent_id)}/${encodeURIComponent(p.service_name)}`,
        ),
      );
    },
  });
}
