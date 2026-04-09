import { Type } from "@sinclair/typebox";
import { post, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "typeform";

const INTEGRATION_TOOLS: any[] = [
{ name: "typeform_forms_list", description: "List Typeform forms.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Typeform integration" }), page: Type.Optional(Type.Integer({ description: "Page number" })), page_size: Type.Optional(Type.Integer({ description: "Results per page" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/typeform/forms/list", p)); } },
{ name: "typeform_form_get", description: "Get a Typeform form.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Typeform integration" }), form_id: Type.String({ description: "Form ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/typeform/forms/get", p)); } },
{ name: "typeform_form_create", description: "Create a Typeform form.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Typeform integration" }), form_data: Type.Any({ description: "Form definition with title, fields, etc." }) }), async execute(_id: string, p: any) { return json(await post("/integrations/typeform/forms/create", p)); } },
{ name: "typeform_responses_list", description: "List responses for a Typeform form.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Typeform integration" }), form_id: Type.String({ description: "Form ID" }), page_size: Type.Optional(Type.Integer({ description: "Results per page" })), since: Type.Optional(Type.String({ description: "ISO 8601 date filter" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/typeform/responses/list", p)); } },
{ name: "typeform_workspaces_list", description: "List Typeform workspaces.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Typeform integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/typeform/workspaces/list", p)); } }
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
