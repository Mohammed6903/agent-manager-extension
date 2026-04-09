import { Type } from "@sinclair/typebox";
import { get, post, patch, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "asana";

const INTEGRATION_TOOLS: any[] = [
{ name: "asana_me", description: "Get the authenticated Asana user.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }) }), async execute(_id: string, p: any) { return json(await get("/integrations/asana/users/me", { agent_id: p.agent_id })); } },
{ name: "asana_workspaces_list", description: "List Asana workspaces.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/asana/workspaces/list", p)); } },
{ name: "asana_projects_list", description: "List Asana projects.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), workspace: Type.Optional(Type.String({ description: "Workspace GID" })), archived: Type.Optional(Type.Boolean({ description: "Filter by archived" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/asana/projects/list", p)); } },
{ name: "asana_project_create", description: "Create an Asana project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), workspace: Type.String({ description: "Workspace GID" }), name: Type.String({ description: "Project name" }), notes: Type.Optional(Type.String({ description: "Project description" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/asana/projects/create", p)); } },
{ name: "asana_tasks_list", description: "List tasks in an Asana project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), project_gid: Type.String({ description: "Project GID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/asana/tasks/list", p)); } },
{ name: "asana_task_get", description: "Get an Asana task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), task_gid: Type.String({ description: "Task GID" }) }), async execute(_id: string, p: any) { return json(await get(`/integrations/asana/tasks/${encodeURIComponent(p.task_gid)}`, { agent_id: p.agent_id })); } },
{ name: "asana_task_create", description: "Create an Asana task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), name: Type.String({ description: "Task name" }), projects: Type.Optional(Type.Array(Type.String(), { description: "Project GIDs" })), workspace: Type.Optional(Type.String({ description: "Workspace GID" })), notes: Type.Optional(Type.String({ description: "Task description" })), assignee: Type.Optional(Type.String({ description: "Assignee GID or 'me'" })), due_on: Type.Optional(Type.String({ description: "Due date YYYY-MM-DD" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/asana/tasks/create", p)); } },
{ name: "asana_task_update", description: "Update an Asana task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), task_gid: Type.String({ description: "Task GID" }), name: Type.Optional(Type.String({ description: "Updated name" })), completed: Type.Optional(Type.Boolean({ description: "Mark completed" })), notes: Type.Optional(Type.String({ description: "Updated notes" })), due_on: Type.Optional(Type.String({ description: "Updated due date" })) }), async execute(_id: string, p: any) { const { task_gid, ...body } = p; return json(await patch(`/integrations/asana/tasks/${encodeURIComponent(task_gid)}`, body)); } },
{ name: "asana_task_delete", description: "Delete an Asana task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), task_gid: Type.String({ description: "Task GID" }) }), async execute(_id: string, p: any) { return json(await del(`/integrations/asana/tasks/${encodeURIComponent(p.task_gid)}`, { agent_id: p.agent_id })); } },
{ name: "asana_sections_list", description: "List sections in an Asana project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Asana integration" }), project_gid: Type.String({ description: "Project GID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/asana/sections/list", p)); } }
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
