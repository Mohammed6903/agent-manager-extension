import { Type } from "@sinclair/typebox";
import { get, post, put, del } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "calendar_list_events",
    description: "List upcoming Google Calendar events for an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose calendar to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum events to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/calendar/events", p));
    },
  });

  api.registerTool({
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
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/calendar/events", p));
    },
  });

  api.registerTool({
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
        }),
      );
    },
  });

  api.registerTool({
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
  });

  api.registerTool({
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
        }),
      );
    },
  });
}
