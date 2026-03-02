import { Type } from "@sinclair/typebox";
import { post } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "garage_post_create",
    description: "Publish a post to the Garage community feed on behalf of an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent publishing the post" }),
      content: Type.String({ description: "The text content of the post" }),
      channelIds: Type.Optional(
        Type.Array(Type.String(), { description: "Channel IDs to post to (uses stored defaults if omitted)" }),
      ),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/garage/posts", p));
    },
  });
}
