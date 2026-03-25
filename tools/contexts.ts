import { Type } from "@sinclair/typebox";
import { get, post, patch, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "context_create",
    description: "Create a new knowledge context document that agents can reference for background knowledge.",
    parameters: Type.Object({
      name: Type.String({ description: "Unique name for this context (e.g. coding-guidelines)" }),
      content: Type.String({ description: "The knowledge content text" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/contexts", p));
    },
  });

  api.registerTool({
    name: "context_list",
    description: "List all global knowledge contexts available in the system.",
    parameters: Type.Object({}),
    async execute() {
      return json(await get("/contexts"));
    },
  });

  api.registerTool({
    name: "context_get",
    description: "Get a specific knowledge context by its ID.",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context's UUID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/contexts/${encodeURIComponent(p.context_id)}`));
    },
  });

  api.registerTool({
    name: "context_update",
    description: "Update a knowledge context's name or content.",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context's UUID" }),
      name: Type.Optional(Type.String({ description: "New context name" })),
      content: Type.Optional(Type.String({ description: "New content text" })),
    }),
    async execute(_id: string, p: any) {
      const { context_id, ...body } = p;
      return json(await patch(`/contexts/${encodeURIComponent(context_id)}`, body));
    },
  });

  api.registerTool({
    name: "context_delete",
    description: "Remove a knowledge context that is no longer needed.",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context's UUID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/contexts/${encodeURIComponent(p.context_id)}`));
    },
  });

  api.registerTool({
    name: "context_assign",
    description: "Assign a knowledge context to an agent so the agent can reference it.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to assign the context to" }),
      context_id: Type.String({ description: "The context's UUID to assign" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      const { user_id, ...body } = p;
      return json(await post("/contexts/assign", body, { user_id }));
    },
  });

  api.registerTool({
    name: "context_unassign",
    description: "Remove a context assignment from an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      context_id: Type.String({ description: "The context's UUID to unassign" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(
          `/contexts/unassign/${encodeURIComponent(p.agent_id)}/${encodeURIComponent(p.context_id)}`,
          { user_id: p.user_id },
        ),
      );
    },
  });

  api.registerTool({
    name: "context_agent_list",
    description: "List all knowledge contexts currently assigned to a specific agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/contexts/agent/${encodeURIComponent(p.agent_id)}`, { user_id: p.user_id }));
    },
  });

  api.registerTool({
    name: "context_content",
    description: "Read the full content of an assigned knowledge context.",
    parameters: Type.Object({
      context_id: Type.String({ description: "The context's UUID" }),
      agent_id: Type.String({ description: "The requesting agent's ID (must have the context assigned)" }),
    }),
    async execute(_id: string, p: any) {
      const { context_id, agent_id } = p;
      return json(await get(`/contexts/${encodeURIComponent(context_id)}/content`, { agent_id }));
    },
  });
}
