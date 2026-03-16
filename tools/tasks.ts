import { Type } from "@sinclair/typebox";
import { get, post, patch, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const SubTask = Type.Object({
  text: Type.String({ description: "Description of the sub-task" }),
  done: Type.Optional(Type.Boolean({ description: "Whether this sub-task is completed (default false)" })),
});

const ContextPage = Type.Object({
  context_name: Type.String({ description: "Name of the relevant document or page" }),
  context_id: Type.String({ description: "Unique identifier for the context" }),
});

const TaskIssue = Type.Object({
  description: Type.String({ description: "Description of the issue or blocker" }),
  resolved: Type.Optional(Type.Boolean({ description: "Whether the issue has been resolved (default false)" })),
});

export function register(api: any) {
  api.registerTool({
    name: "task_create",
    description: "Create a task to track multi-step work and give the user live visibility into progress.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent responsible for this task" }),
      user_id: Type.String({ description: "User creating the task" }),
      session_id: Type.String({ description: "Session identifier" }),
      title: Type.String({ description: "Short descriptive title for the task" }),
      description: Type.Optional(Type.String({ description: "Detailed description of what will be done and why" })),
      status: Type.Optional(
        Type.Union([
          Type.Literal("assigned"),
          Type.Literal("in_progress"),
          Type.Literal("completed"),
          Type.Literal("error"),
        ], { description: "Initial status (default: assigned)" }),
      ),
      difficulty: Type.Optional(
        Type.Union([
          Type.Literal("low"),
          Type.Literal("medium"),
          Type.Literal("high"),
        ], { description: "Task difficulty (default: medium)" }),
      ),
      sub_tasks: Type.Optional(Type.Array(SubTask, { description: "Ordered list of sub-tasks" })),
      context_pages: Type.Optional(Type.Array(ContextPage, { description: "Related documents or pages" })),
      integrations: Type.Optional(Type.Array(Type.String(), { description: "Integration names used by this task" })),
      issues: Type.Optional(Type.Array(TaskIssue, { description: "Known issues or blockers" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/tasks", p));
    },
  });

  api.registerTool({
    name: "task_list",
    description: "List tasks to see current work status, optionally filtered by agent or status.",
    parameters: Type.Object({
      user_id: Type.String({ description: "User ID — required by API" }),
      agent_id: Type.Optional(Type.String({ description: "Filter by agent ID" })),
      status: Type.Optional(Type.String({ description: "Filter by status (assigned, in_progress, completed, error)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/tasks", p));
    },
  });

  api.registerTool({
    name: "task_get",
    description: "Get the full details and current status of a specific task.",
    parameters: Type.Object({
      task_id: Type.String({ description: "The task's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/tasks/${encodeURIComponent(p.task_id)}`));
    },
  });

  api.registerTool({
    name: "task_update",
    description: "Update a task's status, sub-tasks, or report issues as work progresses.",
    parameters: Type.Object({
      task_id: Type.String({ description: "The task's unique identifier" }),
      user_id: Type.String({ description: "User updating the task" }),
      session_id: Type.String({ description: "Session identifier" }),
      title: Type.Optional(Type.String({ description: "Updated title" })),
      description: Type.Optional(Type.String({ description: "Updated description" })),
      status: Type.Optional(
        Type.Union([
          Type.Literal("assigned"),
          Type.Literal("in_progress"),
          Type.Literal("completed"),
          Type.Literal("error"),
        ], { description: "New status" }),
      ),
      difficulty: Type.Optional(
        Type.Union([
          Type.Literal("low"),
          Type.Literal("medium"),
          Type.Literal("high"),
        ], { description: "Updated difficulty" }),
      ),
      sub_tasks: Type.Optional(Type.Array(SubTask, { description: "Full updated sub-task list" })),
      context_pages: Type.Optional(Type.Array(ContextPage, { description: "Updated context pages" })),
      integrations: Type.Optional(Type.Array(Type.String(), { description: "Updated integration names" })),
      issues: Type.Optional(Type.Array(TaskIssue, { description: "Updated issues list" })),
    }),
    async execute(_id: string, p: any) {
      const { task_id, ...body } = p;
      return json(await patch(`/tasks/${encodeURIComponent(task_id)}`, body));
    },
  });

  api.registerTool({
    name: "task_delete",
    description: "Remove a task that is no longer relevant or was created by mistake.",
    parameters: Type.Object({
      task_id: Type.String({ description: "The task's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/tasks/${encodeURIComponent(p.task_id)}`));
    },
  });

  api.registerTool({
    name: "task_resolve_issue",
    description: "Mark a specific issue on a task as resolved after a blocker has been addressed.",
    parameters: Type.Object({
      task_id: Type.String({ description: "The task's unique identifier" }),
      issue_index: Type.Integer({ description: "Zero-based index of the issue to resolve" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await patch(
          `/tasks/${encodeURIComponent(p.task_id)}/issues/${p.issue_index}/resolve`,
        ),
      );
    },
  });
}