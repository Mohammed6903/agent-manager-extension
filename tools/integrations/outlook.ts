import { Type } from "@sinclair/typebox";
import { post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "outlook_request",
    description:
      "Execute an API request against Outlook via Microsoft Graph. " +
      "Email (messages, send, reply, folders), Calendar (events CRUD), Contacts. " +
      "Provide the HTTP method, path, and optional params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Outlook integration" }),
      method: Type.String({ description: "HTTP method: GET, POST, PATCH, DELETE" }),
      path: Type.String({ description: "Graph API path (e.g. /me/messages, /me/sendMail)" }),
      params: Type.Optional(Type.Any({ description: "Query parameters ($select, $filter, $top, etc.)" })),
      json_body: Type.Optional(Type.Any({ description: "JSON request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/outlook/request", p));
    },
  });
}
