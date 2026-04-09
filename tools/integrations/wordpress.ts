import { Type } from "@sinclair/typebox";
import { post, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "wordpress";

const INTEGRATION_TOOLS: any[] = [
{
    name: "wordpress_request",
    description:
      "Execute an API request against WordPress. WordPress.com (sites, posts, pages, comments, media). " +
      "Provide the HTTP method, path, and optional params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with WordPress integration" }),
      method: Type.String({ description: "HTTP method: GET, POST, PUT, PATCH, DELETE" }),
      path: Type.String({ description: "API path" }),
      params: Type.Optional(Type.Any({ description: "Query parameters object" })),
      json_body: Type.Optional(Type.Any({ description: "JSON request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/wordpress/request", p));
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
