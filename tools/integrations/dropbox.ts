import { Type } from "@sinclair/typebox";
import { post, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "dropbox";

const INTEGRATION_TOOLS: any[] = [
{
    name: "dropbox_request",
    description:
      "Execute an API request against Dropbox. Dropbox file storage (list, search, create, move, delete files/folders). " +
      "Provide the HTTP method, path, and optional params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Dropbox integration" }),
      method: Type.String({ description: "HTTP method: GET, POST, PUT, PATCH, DELETE" }),
      path: Type.String({ description: "API path (e.g. /users/me, /issue, /search)" }),
      params: Type.Optional(Type.Any({ description: "Query parameters object" })),
      json_body: Type.Optional(Type.Any({ description: "JSON request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/dropbox/request", p));
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
