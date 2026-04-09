import { Type } from "@sinclair/typebox";
import { post, patch, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "trello";

const INTEGRATION_TOOLS: any[] = [
{ name: "trello_boards_list", description: "List Trello boards for the authenticated member.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/boards/list", p)); } },
{ name: "trello_board_get", description: "Get a Trello board by ID.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), board_id: Type.String({ description: "Board ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/boards/get", p)); } },
{ name: "trello_board_create", description: "Create a new Trello board.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), name: Type.String({ description: "Board name" }), desc: Type.Optional(Type.String({ description: "Board description" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/boards/create", p)); } },
{ name: "trello_board_lists", description: "Get all lists on a Trello board.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), board_id: Type.String({ description: "Board ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/boards/lists", p)); } },
{ name: "trello_list_create", description: "Create a new list on a Trello board.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), name: Type.String({ description: "List name" }), id_board: Type.String({ description: "Board ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/lists/create", p)); } },
{ name: "trello_list_cards", description: "Get all cards on a Trello list.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), list_id: Type.String({ description: "List ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/lists/cards", p)); } },
{ name: "trello_card_get", description: "Get a Trello card by ID.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), card_id: Type.String({ description: "Card ID" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/cards/get", p)); } },
{ name: "trello_card_create", description: "Create a new Trello card.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), id_list: Type.String({ description: "List ID" }), name: Type.Optional(Type.String({ description: "Card name" })), desc: Type.Optional(Type.String({ description: "Card description" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/cards/create", p)); } },
{ name: "trello_card_update", description: "Update a Trello card.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), card_id: Type.String({ description: "Card ID" }), name: Type.Optional(Type.String({ description: "Updated name" })), desc: Type.Optional(Type.String({ description: "Updated description" })), id_list: Type.Optional(Type.String({ description: "Move to list" })), closed: Type.Optional(Type.Boolean({ description: "Archive the card" })) }), async execute(_id: string, p: any) { const { card_id, ...body } = p; return json(await patch(`/integrations/trello/cards/${encodeURIComponent(card_id)}`, body)); } },
{ name: "trello_card_delete", description: "Delete a Trello card.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }), card_id: Type.String({ description: "Card ID" }) }), async execute(_id: string, p: any) { return json(await del(`/integrations/trello/cards/${encodeURIComponent(p.card_id)}`, { agent_id: p.agent_id })); } },
{ name: "trello_me", description: "Get the authenticated Trello member.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Trello integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/trello/members/me", p)); } }
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
