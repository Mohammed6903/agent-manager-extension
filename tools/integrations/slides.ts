import { Type } from "@sinclair/typebox";
import { post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "google_slides_request",
    description:
      "Execute a Google Slides API request via Google SDK. Google Slides (presentations, slides, batchUpdate for modifications). " +
      "Provide resource path, method name, and params/body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Google Slides integration" }),
      resource: Type.String({ description: "API resource (e.g. presentations, forms, channels, properties)" }),
      method: Type.String({ description: "Method to call (e.g. get, list, create, batchUpdate)" }),
      params: Type.Optional(Type.Any({ description: "Parameters for the method call" })),
      body: Type.Optional(Type.Any({ description: "Request body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slides/request", p));
    },
  });
}
