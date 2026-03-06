import { Type } from "@sinclair/typebox";
import { get, post } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "integration_list",
    description: "List all hardcoded integrations available in the system.",
    parameters: Type.Object({}),
    async execute() {
      return json(await get("/integrations"));
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
      credentials: Type.Optional(
        Type.Record(Type.String(), Type.String(), {
          description:
            "Key-value credential map matching the integration's auth_fields. Not required for Google OAuth integrations.",
        }),
      ),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/assign", p));
    },
  });

  api.registerTool({
    name: "integration_agent_list",
    description: "List all integrations assigned to a specific agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/agent/${encodeURIComponent(p.agent_id)}`));
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
}
