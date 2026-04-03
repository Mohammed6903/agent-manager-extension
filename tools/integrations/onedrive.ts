import { Type } from "@sinclair/typebox";
import { post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "onedrive_request",
    description:
      "Execute an API request against OneDrive via Microsoft Graph. " +
      "Files, folders, upload, download, search, sharing links. " +
      "Provide the HTTP method, path, and optional params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with OneDrive integration" }),
      method: Type.String({ description: "HTTP method: GET, POST, PUT, PATCH, DELETE" }),
      path: Type.String({ description: "Graph API path (e.g. /me/drive/root/children)" }),
      params: Type.Optional(Type.Any({ description: "Query parameters" })),
      json_body: Type.Optional(Type.Any({ description: "JSON request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/onedrive/request", p));
    },
  });
}
