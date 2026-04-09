import { Type } from "@sinclair/typebox";
import { post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "telegram_request",
    description:
      "Execute an API request against Telegram Bot. Telegram Bot API (send messages, photos, documents, manage webhooks, get updates). " +
      "Provide the HTTP method, path, and optional params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Telegram Bot integration" }),
      method: Type.String({ description: "HTTP method: GET, POST, PUT, PATCH, DELETE" }),
      path: Type.String({ description: "API path" }),
      params: Type.Optional(Type.Any({ description: "Query parameters object" })),
      json_body: Type.Optional(Type.Any({ description: "JSON request body" })),
      data: Type.Optional(Type.Any({ description: "Form-encoded request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/telegram/request", p));
    },
  });
}
