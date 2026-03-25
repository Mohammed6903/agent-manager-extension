import { Type } from "@sinclair/typebox";
import { get, post, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "integration_list",
    description: "List all hardcoded integrations available in the system.",
    parameters: Type.Object({
      user_id: Type.String({ description: "User ID — required for scoping connected_agents" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations", { user_id: p.user_id }));
    },
  });

  api.registerTool({
    name: "integration_get",
    description: "Get the full definition of a specific integration.",
    parameters: Type.Object({
      integration_name: Type.String({ description: "Name of the integration" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/${encodeURIComponent(p.integration_name)}`));
    },
  });

  api.registerTool({
    name: "integration_assign",
    description: "Assign an integration to an agent by providing the required credentials.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to assign the integration to" }),
      integration_name: Type.String({ description: "Name of the integration to assign" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
      credentials: Type.Optional(
        Type.Record(Type.String(), Type.String(), {
          description:
            "Key-value credential map matching the integration's auth_fields. Not required for Google OAuth integrations.",
        }),
      ),
    }),
    async execute(_id: string, p: any) {
      const { user_id, ...body } = p;
      return json(await post("/integrations/assign", body, { user_id }));
    },
  });

  api.registerTool({
    name: "integration_agent_list",
    description: "List all integrations assigned to a specific agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/agent/${encodeURIComponent(p.agent_id)}`, { user_id: p.user_id }));
    },
  });

  api.registerTool({
    name: "integration_logs",
    description: "Get recent API call logs for an integration.",
    parameters: Type.Object({
      integration_name: Type.String({ description: "Name of the integration" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/${encodeURIComponent(p.integration_name)}/logs`));
    },
  });

  api.registerTool({
    name: "integration_unassign",
    description: "Remove an integration assignment from an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      integration_name: Type.String({ description: "Name of the integration to unassign" }),
      user_id: Type.String({ description: "User ID — required for ownership verification" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del("/integrations/unassign", {
        agent_id: p.agent_id,
        integration_name: p.integration_name,
        user_id: p.user_id,
      }));
    },
  });
}
