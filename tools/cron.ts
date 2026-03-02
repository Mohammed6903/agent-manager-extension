import { Type } from "@sinclair/typebox";
import { get, post, patch, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const PipelineTask = Type.Object({
  name: Type.String({ description: "Short name for this pipeline step" }),
  description: Type.String({ description: "Operational detail: exact API call, headers, body shape, and success criterion" }),
  status: Type.Optional(Type.String({ description: "Initial status (default: pending)" })),
  integrations: Type.Optional(Type.Array(Type.String(), { description: "Integration names this step uses" })),
  context_sources: Type.Optional(Type.Array(Type.String(), { description: "Context sources for this step" })),
});

const PipelineTemplate = Type.Object({
  tasks: Type.Array(PipelineTask, { description: "Ordered list of pipeline steps" }),
  global_integrations: Type.Optional(Type.Array(Type.String(), { description: "Integrations available to all steps" })),
  global_context_sources: Type.Optional(Type.Array(Type.String(), { description: "Context sources available to all steps" })),
});

const TemplateVariable = Type.Object({
  key: Type.String({ description: "Variable key used in the payload_message template" }),
  label: Type.String({ description: "Human-readable label for the variable" }),
  required: Type.Optional(Type.Boolean({ description: "Whether this variable must be provided (default true)" })),
  default: Type.Optional(Type.String({ description: "Default value if not provided" })),
});

export function register(api: any) {
  // ── Cron Jobs ───────────────────────────────────────────────────

  api.registerTool({
    name: "cron_create",
    description: "Schedule a recurring or one-time job that an agent will execute on the defined schedule.",
    parameters: Type.Object({
      name: Type.String({ description: "Human-readable job name shown in the dashboard" }),
      agent_id: Type.String({ description: "Which agent will execute this job" }),
      schedule_kind: Type.Union([
        Type.Literal("at"),
        Type.Literal("every"),
        Type.Literal("cron"),
      ], { description: "Schedule type: 'at' (one-time ISO timestamp), 'every' (interval like 5m/1h), 'cron' (cron expression)" }),
      schedule_expr: Type.String({ description: "Schedule expression matching the kind (ISO timestamp, duration string, or cron expression)" }),
      payload_message: Type.String({ description: "Full operational prompt the agent receives — must be self-contained with exact steps, API calls, and success criteria" }),
      user_id: Type.String({ description: "Owner user ID for dashboard visibility" }),
      session_id: Type.String({ description: "Owner session ID for dashboard visibility" }),
      schedule_tz: Type.Optional(Type.String({ description: "IANA timezone for cron kind (e.g. Asia/Kolkata)" })),
      schedule_human: Type.Optional(Type.String({ description: "Human-readable schedule description (e.g. 'Every Monday at 9AM')" })),
      session_target: Type.Optional(
        Type.Union([Type.Literal("main"), Type.Literal("isolated")], {
          description: "Session type: 'isolated' (default, no tools) or 'main' (full tool access for integration jobs)",
        }),
      ),
      delivery_mode: Type.Optional(
        Type.Union([Type.Literal("webhook"), Type.Literal("none")], {
          description: "How results are delivered (default: webhook)",
        }),
      ),
      enabled: Type.Optional(Type.Boolean({ description: "Whether the job starts enabled (default true)" })),
      delete_after_run: Type.Optional(Type.Boolean({ description: "Auto-delete after first execution (default false, useful for 'at' jobs)" })),
      pipeline_template: Type.Optional(PipelineTemplate),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/crons", p));
    },
  });

  api.registerTool({
    name: "cron_list",
    description: "List all scheduled jobs, optionally filtered by owner user or session.",
    parameters: Type.Object({
      user_id: Type.Optional(Type.String({ description: "Filter by owner user ID" })),
      session_id: Type.Optional(Type.String({ description: "Filter by owner session ID" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/crons", p));
    },
  });

  api.registerTool({
    name: "cron_get",
    description: "Get the configuration and current status of a specific cron job.",
    parameters: Type.Object({
      job_id: Type.String({ description: "The cron job's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/crons/${encodeURIComponent(p.job_id)}`));
    },
  });

  api.registerTool({
    name: "cron_update",
    description: "Update the schedule, payload, or enabled status of an existing cron job.",
    parameters: Type.Object({
      job_id: Type.String({ description: "The cron job's unique identifier" }),
      schedule_kind: Type.Optional(
        Type.Union([Type.Literal("at"), Type.Literal("every"), Type.Literal("cron")], {
          description: "New schedule type",
        }),
      ),
      schedule_expr: Type.Optional(Type.String({ description: "New schedule expression" })),
      schedule_tz: Type.Optional(Type.String({ description: "New IANA timezone" })),
      payload_message: Type.Optional(Type.String({ description: "New operational prompt" })),
      enabled: Type.Optional(Type.Boolean({ description: "Enable or disable the job" })),
    }),
    async execute(_id: string, p: any) {
      const { job_id, ...body } = p;
      return json(await patch(`/crons/${encodeURIComponent(job_id)}`, body));
    },
  });

  api.registerTool({
    name: "cron_delete",
    description: "Remove a scheduled job that is no longer needed.",
    parameters: Type.Object({
      job_id: Type.String({ description: "The cron job's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/crons/${encodeURIComponent(p.job_id)}`));
    },
  });

  api.registerTool({
    name: "cron_trigger",
    description: "Immediately execute a cron job without waiting for its next scheduled run.",
    parameters: Type.Object({
      job_id: Type.String({ description: "The cron job's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post(`/crons/${encodeURIComponent(p.job_id)}/trigger`));
    },
  });

  api.registerTool({
    name: "cron_runs",
    description: "View the execution history and results for a cron job.",
    parameters: Type.Object({
      job_id: Type.String({ description: "The cron job's unique identifier" }),
      limit: Type.Optional(Type.Integer({ description: "Max runs to return (default 20)" })),
    }),
    async execute(_id: string, p: any) {
      const { job_id, ...params } = p;
      return json(await get(`/crons/${encodeURIComponent(job_id)}/runs`, params));
    },
  });

  api.registerTool({
    name: "cron_detail",
    description: "Get full details of a cron job including its configuration and recent run history.",
    parameters: Type.Object({
      job_id: Type.String({ description: "The cron job's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/crons/${encodeURIComponent(p.job_id)}/detail`));
    },
  });

  // ── Cron Templates ─────────────────────────────────────────────

  api.registerTool({
    name: "cron_template_create",
    description: "Create a reusable cron job template with variables that can be filled in at instantiation time.",
    parameters: Type.Object({
      user_id: Type.String({ description: "Creator's user ID" }),
      name: Type.String({ description: "Template name" }),
      schedule_kind: Type.Union([
        Type.Literal("at"),
        Type.Literal("every"),
        Type.Literal("cron"),
      ], { description: "Schedule type" }),
      schedule_expr: Type.String({ description: "Schedule expression" }),
      payload_message: Type.String({ description: "Prompt template — may contain {{variable}} placeholders" }),
      description: Type.Optional(Type.String({ description: "Template description" })),
      category: Type.Optional(Type.String({ description: "Category for organization" })),
      is_public: Type.Optional(Type.Boolean({ description: "Whether other users can see and use this template (default false)" })),
      required_integrations: Type.Optional(Type.Array(Type.String(), { description: "Integration IDs required by this template" })),
      variables: Type.Optional(Type.Array(TemplateVariable, { description: "Template variables that must be provided at instantiation" })),
      schedule_tz: Type.Optional(Type.String({ description: "IANA timezone" })),
      schedule_human: Type.Optional(Type.String({ description: "Human-readable schedule" })),
      session_target: Type.Optional(
        Type.Union([Type.Literal("main"), Type.Literal("isolated")], { description: "Session type (default: isolated)" }),
      ),
      delivery_mode: Type.Optional(
        Type.Union([Type.Literal("webhook"), Type.Literal("none")], { description: "Delivery mode (default: webhook)" }),
      ),
      pipeline_template: Type.Optional(PipelineTemplate),
    }),
    async execute(_id: string, p: any) {
      const { user_id, ...body } = p;
      return json(await post("/cron-templates", body, { user_id }));
    },
  });

  api.registerTool({
    name: "cron_template_list",
    description: "List all available cron job templates (owned and public).",
    parameters: Type.Object({
      user_id: Type.String({ description: "User ID to determine ownership and list public templates" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/cron-templates", p));
    },
  });

  api.registerTool({
    name: "cron_template_get",
    description: "Get a specific cron template's full configuration including variables.",
    parameters: Type.Object({
      template_id: Type.String({ description: "The template's unique identifier" }),
      user_id: Type.String({ description: "Requesting user's ID" }),
    }),
    async execute(_id: string, p: any) {
      const { template_id, ...params } = p;
      return json(await get(`/cron-templates/${encodeURIComponent(template_id)}`, params));
    },
  });

  api.registerTool({
    name: "cron_template_update",
    description: "Update a cron template's configuration (owner only).",
    parameters: Type.Object({
      template_id: Type.String({ description: "The template's unique identifier" }),
      user_id: Type.String({ description: "Owner's user ID" }),
      name: Type.Optional(Type.String({ description: "New template name" })),
      description: Type.Optional(Type.String({ description: "New description" })),
      category: Type.Optional(Type.String({ description: "New category" })),
      is_public: Type.Optional(Type.Boolean({ description: "New visibility" })),
      schedule_kind: Type.Optional(
        Type.Union([Type.Literal("at"), Type.Literal("every"), Type.Literal("cron")]),
      ),
      schedule_expr: Type.Optional(Type.String()),
      schedule_tz: Type.Optional(Type.String()),
      schedule_human: Type.Optional(Type.String()),
      session_target: Type.Optional(
        Type.Union([Type.Literal("main"), Type.Literal("isolated")], { description: "Session type" }),
      ),
      delivery_mode: Type.Optional(
        Type.Union([Type.Literal("webhook"), Type.Literal("none")], { description: "Delivery mode" }),
      ),
      required_integrations: Type.Optional(Type.Array(Type.String(), { description: "Required integration IDs" })),
      variables: Type.Optional(Type.Array(TemplateVariable, { description: "Template variables" })),
      payload_message: Type.Optional(Type.String()),
      pipeline_template: Type.Optional(PipelineTemplate),
    }),
    async execute(_id: string, p: any) {
      const { template_id, user_id, ...body } = p;
      return json(await patch(`/cron-templates/${encodeURIComponent(template_id)}`, body, { user_id }));
    },
  });

  api.registerTool({
    name: "cron_template_delete",
    description: "Remove a cron template (owner only).",
    parameters: Type.Object({
      template_id: Type.String({ description: "The template's unique identifier" }),
      user_id: Type.String({ description: "Owner's user ID" }),
    }),
    async execute(_id: string, p: any) {
      const { template_id, ...params } = p;
      return json(await del(`/cron-templates/${encodeURIComponent(template_id)}`, params));
    },
  });

  api.registerTool({
    name: "cron_template_instantiate",
    description: "Create a live cron job from a template by providing variable values.",
    parameters: Type.Object({
      template_id: Type.String({ description: "The template to instantiate" }),
      agent_id: Type.String({ description: "Which agent will run the resulting job" }),
      user_id: Type.String({ description: "Owner user ID" }),
      session_id: Type.String({ description: "Owner session ID" }),
      variable_values: Type.Optional(
        Type.Record(Type.String(), Type.String(), { description: "Key-value map of template variable bindings" }),
      ),
    }),
    async execute(_id: string, p: any) {
      const { template_id, ...body } = p;
      return json(await post(`/cron-templates/${encodeURIComponent(template_id)}/instantiate`, body));
    },
  });
}
