import { Type } from "@sinclair/typebox";
import { post, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "youtube";

const INTEGRATION_TOOLS: any[] = [
{
    name: "youtube_request",
    description:
      "Execute a YouTube API request via Google SDK. YouTube Data API (channels, videos, playlists, search, comments). " +
      "Provide resource path, method name, and params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with YouTube integration" }),
      resource: Type.String({ description: "API resource (e.g. presentations, forms, channels, properties)" }),
      method: Type.String({ description: "Method to call (e.g. get, list, create, batchUpdate)" }),
      params: Type.Optional(Type.Any({ description: "Parameters for the method call" })),
      body: Type.Optional(Type.Any({ description: "Request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/youtube/request", p));
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
