import { Type } from "@sinclair/typebox";
import { get, post, put, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "google_calendar";

const INTEGRATION_TOOLS: any[] = [
{
    name: "calendar_list_events",
    description: "List upcoming Google Calendar events for an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose calendar to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum events to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/calendar/events", p));
    },
  },
{
    name: "calendar_create_event",
    description: "Create a new Google Calendar event.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent creating the event" }),
      summary: Type.String({ description: "Event title" }),
      start_time: Type.String({ description: "ISO 8601 datetime" }),
      end_time: Type.String({ description: "ISO 8601 datetime" }),
      description: Type.Optional(Type.String({ description: "Event description" })),
      location: Type.Optional(Type.String({ description: "Event location" })),
      attendees: Type.Optional(Type.Array(Type.String(), { description: "List of attendee email addresses" })),
      timezone: Type.Optional(Type.String({ description: "Timezone (default UTC)" })),
      add_meet: Type.Optional(Type.Boolean({ description: "Add Google Meet link (default false)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/calendar/events", p));
    },
  },
{
    name: "calendar_get_event",
    description: "Get the full details of a specific Google Calendar event.",
    parameters: Type.Object({
      event_id: Type.String({ description: "Calendar event ID" }),
      agent_id: Type.String({ description: "The agent whose calendar to query" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/calendar/events/${encodeURIComponent(p.event_id)}`, {
          agent_id: p.agent_id,
        })
      );
    },
  },
{
    name: "calendar_update_event",
    description: "Update an existing Google Calendar event.",
    parameters: Type.Object({
      event_id: Type.String({ description: "Calendar event ID" }),
      agent_id: Type.String({ description: "The agent updating the event" }),
      summary: Type.Optional(Type.String({ description: "Updated event title" })),
      start_time: Type.Optional(Type.String({ description: "Updated start time (ISO 8601 datetime)" })),
      end_time: Type.Optional(Type.String({ description: "Updated end time (ISO 8601 datetime)" })),
      description: Type.Optional(Type.String({ description: "Updated description" })),
      location: Type.Optional(Type.String({ description: "Updated location" })),
    }),
    async execute(_id: string, p: any) {
      const { event_id, ...body } = p;
      return json(await put(`/integrations/calendar/events/${encodeURIComponent(event_id)}`, body));
    },
  },
{
    name: "calendar_delete_event",
    description: "Delete a Google Calendar event.",
    parameters: Type.Object({
      event_id: Type.String({ description: "Calendar event ID to delete" }),
      agent_id: Type.String({ description: "The agent deleting the event" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/calendar/events/${encodeURIComponent(p.event_id)}`, {
          agent_id: p.agent_id,
        })
      );
    },
  }
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
