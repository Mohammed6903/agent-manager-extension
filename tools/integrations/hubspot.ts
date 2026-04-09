import { Type } from "@sinclair/typebox";
import { post, patch, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "hubspot";

const INTEGRATION_TOOLS: any[] = [
{ name: "hubspot_contacts_list", description: "List HubSpot contacts.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), after: Type.Optional(Type.String({ description: "Pagination cursor" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/contacts/list", p)); } },
{ name: "hubspot_contact_create", description: "Create a HubSpot contact.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), properties: Type.Any({ description: "Contact properties {email, firstname, lastname, ...}" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/contacts/create", p)); } },
{ name: "hubspot_contacts_search", description: "Search HubSpot contacts.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), query: Type.Optional(Type.String({ description: "Search query" })), filter_groups: Type.Optional(Type.Array(Type.Any(), { description: "Filter groups" })), limit: Type.Optional(Type.Integer({ description: "Max results" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/contacts/search", p)); } },
{ name: "hubspot_companies_list", description: "List HubSpot companies.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), after: Type.Optional(Type.String({ description: "Cursor" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/companies/list", p)); } },
{ name: "hubspot_company_create", description: "Create a HubSpot company.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), properties: Type.Any({ description: "Company properties {name, domain, ...}" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/companies/create", p)); } },
{ name: "hubspot_companies_search", description: "Search HubSpot companies.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), query: Type.Optional(Type.String({ description: "Search query" })), filter_groups: Type.Optional(Type.Array(Type.Any(), { description: "Filter groups" })), limit: Type.Optional(Type.Integer({ description: "Max results" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/companies/search", p)); } },
{ name: "hubspot_deals_list", description: "List HubSpot deals.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), after: Type.Optional(Type.String({ description: "Cursor" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/deals/list", p)); } },
{ name: "hubspot_deal_create", description: "Create a HubSpot deal.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), properties: Type.Any({ description: "Deal properties {dealname, amount, pipeline, dealstage, ...}" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/deals/create", p)); } },
{ name: "hubspot_deals_search", description: "Search HubSpot deals.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), query: Type.Optional(Type.String({ description: "Search query" })), filter_groups: Type.Optional(Type.Array(Type.Any(), { description: "Filter groups" })), limit: Type.Optional(Type.Integer({ description: "Max results" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/deals/search", p)); } },
{ name: "hubspot_tickets_list", description: "List HubSpot tickets.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), after: Type.Optional(Type.String({ description: "Cursor" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/tickets/list", p)); } },
{ name: "hubspot_ticket_create", description: "Create a HubSpot ticket.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), properties: Type.Any({ description: "Ticket properties {subject, content, hs_pipeline, ...}" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/tickets/create", p)); } },
{ name: "hubspot_owners_list", description: "List HubSpot owners.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with HubSpot integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), after: Type.Optional(Type.String({ description: "Cursor" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/hubspot/owners/list", p)); } }
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
