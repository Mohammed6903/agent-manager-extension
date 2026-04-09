import { Type } from "@sinclair/typebox";
import { post, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "todoist";

const INTEGRATION_TOOLS: any[] = [
{ name: "todoist_projects_list", description: "List all Todoist projects.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/projects/list", p)); } },
{ name: "todoist_project_create", description: "Create a Todoist project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), name: Type.String({ description: "Project name" }), parent_id: Type.Optional(Type.String({ description: "Parent project ID" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/projects/create", p)); } },
{ name: "todoist_tasks_list", description: "List active Todoist tasks.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), project_id: Type.Optional(Type.String({ description: "Filter by project" })), label: Type.Optional(Type.String({ description: "Filter by label" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/tasks/list", p)); } },
{ name: "todoist_task_create", description: "Create a Todoist task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), content: Type.String({ description: "Task title" }), project_id: Type.Optional(Type.String({ description: "Project ID" })), description: Type.Optional(Type.String({ description: "Task description" })), due_string: Type.Optional(Type.String({ description: "Natural language due date (e.g. 'tomorrow')" })), priority: Type.Optional(Type.Integer({ description: "1=normal 4=urgent" })), labels: Type.Optional(Type.Array(Type.String(), { description: "Label names" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/tasks/create", p)); } },
{ name: "todoist_task_close", description: "Complete/close a Todoist task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), task_id: Type.String({ description: "Task ID" }) }), async execute(_id: string, p: any) { return json(await post(`/integrations/todoist/tasks/${encodeURIComponent(p.task_id)}/close`, undefined, { agent_id: p.agent_id })); } },
{ name: "todoist_task_reopen", description: "Reopen a completed Todoist task.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), task_id: Type.String({ description: "Task ID" }) }), async execute(_id: string, p: any) { return json(await post(`/integrations/todoist/tasks/${encodeURIComponent(p.task_id)}/reopen`, undefined, { agent_id: p.agent_id })); } },
{ name: "todoist_comments_list", description: "List comments on a Todoist task or project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), task_id: Type.Optional(Type.String({ description: "Task ID" })), project_id: Type.Optional(Type.String({ description: "Project ID" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/comments/list", p)); } },
{ name: "todoist_comment_create", description: "Create a comment on a Todoist task or project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), content: Type.String({ description: "Comment content (markdown)" }), task_id: Type.Optional(Type.String({ description: "Task ID" })), project_id: Type.Optional(Type.String({ description: "Project ID" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/comments/create", p)); } },
{ name: "todoist_labels_list", description: "List all Todoist labels.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/labels/list", p)); } },
{ name: "todoist_sections_list", description: "List sections in a Todoist project.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Todoist integration" }), project_id: Type.String({ description: "Project ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/todoist/sections/list", p)); } }
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
