import { Type } from "@sinclair/typebox";
import { get, post, patch, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  // ── Global Skills ───────────────────────────────────────────────

  api.registerTool({
    name: "skill_create",
    description: "Create a new global skill definition that agents can install.",
    parameters: Type.Object({
      name: Type.String({ description: "Kebab-case skill name (e.g. my-skill)" }),
      content: Type.Optional(Type.String({ description: "Markdown content for the skill (uses default template if omitted)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/skills", p));
    },
  });

  api.registerTool({
    name: "skill_list",
    description: "List all globally available skill definitions.",
    parameters: Type.Object({}),
    async execute() {
      return json(await get("/skills"));
    },
  });

  api.registerTool({
    name: "skill_get",
    description: "Get a global skill's metadata and path information.",
    parameters: Type.Object({
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/skills/${encodeURIComponent(p.skill_name)}`));
    },
  });

  api.registerTool({
    name: "skill_content",
    description: "Read the full markdown content of a global skill.",
    parameters: Type.Object({
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/skills/${encodeURIComponent(p.skill_name)}/content`));
    },
  });

  api.registerTool({
    name: "skill_update",
    description: "Update a global skill's markdown content.",
    parameters: Type.Object({
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
      content: Type.String({ description: "New markdown content" }),
    }),
    async execute(_id: string, p: any) {
      const { skill_name, ...body } = p;
      return json(await patch(`/skills/${encodeURIComponent(skill_name)}`, body));
    },
  });

  api.registerTool({
    name: "skill_sync",
    description: "Re-sync a global skill with its default template to restore original content.",
    parameters: Type.Object({
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post(`/skills/${encodeURIComponent(p.skill_name)}/sync`));
    },
  });

  api.registerTool({
    name: "skill_delete",
    description: "Remove a global skill definition.",
    parameters: Type.Object({
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/skills/${encodeURIComponent(p.skill_name)}`));
    },
  });

  // ── Agent-scoped Skills ─────────────────────────────────────────

  api.registerTool({
    name: "agent_skill_status",
    description: "Check which skills are installed for a specific agent and their install status.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/agents/${encodeURIComponent(p.agent_id)}/skills/status`));
    },
  });

  api.registerTool({
    name: "agent_skill_install",
    description: "Install a global skill into an agent's workspace so the agent can use it.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      skill_name: Type.String({ description: "The global skill to install" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post(
          `/agents/${encodeURIComponent(p.agent_id)}/skills/install/${encodeURIComponent(p.skill_name)}`,
        ),
      );
    },
  });

  api.registerTool({
    name: "agent_skill_create",
    description: "Create a custom skill directly in an agent's workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      name: Type.String({ description: "Kebab-case skill name" }),
      content: Type.Optional(Type.String({ description: "Markdown content (uses default template if omitted)" })),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, ...body } = p;
      return json(await post(`/agents/${encodeURIComponent(agent_id)}/skills`, body));
    },
  });

  api.registerTool({
    name: "agent_skill_list",
    description: "List all skills available in a specific agent's workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/agents/${encodeURIComponent(p.agent_id)}/skills`));
    },
  });

  api.registerTool({
    name: "agent_skill_get",
    description: "Get metadata for a specific skill in an agent's workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(
          `/agents/${encodeURIComponent(p.agent_id)}/skills/${encodeURIComponent(p.skill_name)}`,
        ),
      );
    },
  });

  api.registerTool({
    name: "agent_skill_content",
    description: "Read the full markdown content of a skill in an agent's workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(
          `/agents/${encodeURIComponent(p.agent_id)}/skills/${encodeURIComponent(p.skill_name)}/content`,
        ),
      );
    },
  });

  api.registerTool({
    name: "agent_skill_update",
    description: "Update the markdown content of a skill in an agent's workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
      content: Type.String({ description: "New markdown content" }),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, skill_name, ...body } = p;
      return json(
        await patch(
          `/agents/${encodeURIComponent(agent_id)}/skills/${encodeURIComponent(skill_name)}`,
          body,
        ),
      );
    },
  });

  api.registerTool({
    name: "agent_skill_sync",
    description: "Re-sync an agent skill with the default template to restore original content.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post(
          `/agents/${encodeURIComponent(p.agent_id)}/skills/${encodeURIComponent(p.skill_name)}/sync`,
        ),
      );
    },
  });

  api.registerTool({
    name: "agent_skill_delete",
    description: "Remove a skill from an agent's workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      skill_name: Type.String({ description: "The skill's kebab-case name" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(
          `/agents/${encodeURIComponent(p.agent_id)}/skills/${encodeURIComponent(p.skill_name)}`,
        ),
      );
    },
  });
}
