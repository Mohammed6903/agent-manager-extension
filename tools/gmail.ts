import { Type } from "@sinclair/typebox";
import { get, post, put, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  // ── Gmail Auth ──────────────────────────────────────────────────

  api.registerTool({
    name: "gmail_auth_login",
    description: "Get the OAuth authorization URL to connect Gmail for an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to connect Gmail for" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/auth/login", { agent_id: p.agent_id }));
    },
  });

  api.registerTool({
    name: "gmail_auth_callback_manual",
    description: "Complete the Gmail OAuth flow using an authorization code or redirect URL.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to connect" }),
      code: Type.Optional(Type.String({ description: "OAuth authorization code" })),
      redirect_url: Type.Optional(Type.String({ description: "Full redirect URL containing the code" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/auth/callback/manual", p));
    },
  });

  // ── Gmail Email ─────────────────────────────────────────────────

  api.registerTool({
    name: "gmail_email_list",
    description: "List recent emails from an agent's connected Gmail account.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum emails to return (default 10)" })),
      query: Type.Optional(Type.String({ description: "Gmail search query (e.g. 'from:user@example.com is:unread')" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/email/list", p));
    },
  });

  api.registerTool({
    name: "gmail_email_search",
    description: "Search emails using Gmail's full query syntax.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to search" }),
      query: Type.String({ description: "Gmail search query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum results (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/email/search", p));
    },
  });

  api.registerTool({
    name: "gmail_email_read",
    description: "Read the full content of a specific email message.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to read from" }),
      message_id: Type.String({ description: "Gmail message ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/email/read", p));
    },
  });

  api.registerTool({
    name: "gmail_email_batch_read",
    description: "Read multiple emails at once by their message IDs.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to read from" }),
      message_ids: Type.Array(Type.String(), { description: "List of Gmail message IDs to read" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/email/batch_read", p));
    },
  });

  api.registerTool({
    name: "gmail_email_thread",
    description: "Get all messages in an email thread to see the full conversation.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to query" }),
      thread_id: Type.String({ description: "Gmail thread ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/email/thread", p));
    },
  });

  api.registerTool({
    name: "gmail_email_send",
    description: "Send a new email from the agent's connected Gmail account.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent sending the email" }),
      to: Type.String({ description: "Recipient email address" }),
      subject: Type.String({ description: "Email subject line" }),
      body: Type.String({ description: "Plain text email body" }),
      cc: Type.Optional(Type.String({ description: "CC recipients (comma-separated)" })),
      bcc: Type.Optional(Type.String({ description: "BCC recipients (comma-separated)" })),
      html_body: Type.Optional(Type.String({ description: "HTML email body (overrides plain text for rich formatting)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/email/send", p));
    },
  });

  api.registerTool({
    name: "gmail_email_reply",
    description: "Reply to an existing email, preserving the thread.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent sending the reply" }),
      message_id: Type.String({ description: "ID of the message to reply to" }),
      body: Type.String({ description: "Reply text" }),
      cc: Type.Optional(Type.String({ description: "CC recipients" })),
      bcc: Type.Optional(Type.String({ description: "BCC recipients" })),
      html_body: Type.Optional(Type.String({ description: "HTML reply body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/email/reply", p));
    },
  });

  api.registerTool({
    name: "gmail_email_modify",
    description: "Add or remove labels on emails (e.g. mark as read by removing UNREAD label).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to modify" }),
      message_ids: Type.Array(Type.String(), { description: "List of message IDs to modify" }),
      add_labels: Type.Optional(Type.Array(Type.String(), { description: "Labels to add (e.g. STARRED)" })),
      remove_labels: Type.Optional(Type.Array(Type.String(), { description: "Labels to remove (e.g. UNREAD)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/email/modify", p));
    },
  });

  api.registerTool({
    name: "gmail_email_attachment",
    description: "Download an attachment from a specific email.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to access" }),
      message_id: Type.String({ description: "Gmail message ID containing the attachment" }),
      attachment_id: Type.String({ description: "Attachment ID from the message metadata" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/email/attachment", p));
    },
  });

  // ── Calendar ────────────────────────────────────────────────────

  api.registerTool({
    name: "calendar_events_list",
    description: "List upcoming calendar events for an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose calendar to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum events to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/gmail/calendar/events", p));
    },
  });

  api.registerTool({
    name: "calendar_event_get",
    description: "Get the full details of a specific calendar event.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose calendar to query" }),
      event_id: Type.String({ description: "Calendar event ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/gmail/calendar/events/${encodeURIComponent(p.event_id)}`, {
          agent_id: p.agent_id,
        }),
      );
    },
  });

  api.registerTool({
    name: "calendar_event_create",
    description: "Create a new calendar event with optional attendees.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent creating the event" }),
      summary: Type.String({ description: "Event title" }),
      start_time: Type.String({ description: "Start time in ISO format (e.g. 2024-01-15T10:00:00)" }),
      end_time: Type.String({ description: "End time in ISO format" }),
      description: Type.Optional(Type.String({ description: "Event description" })),
      location: Type.Optional(Type.String({ description: "Event location" })),
      attendees: Type.Optional(Type.Array(Type.String(), { description: "Email addresses of attendees" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/calendar/events", p));
    },
  });

  api.registerTool({
    name: "calendar_event_update",
    description: "Update an existing calendar event's details.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent updating the event" }),
      event_id: Type.String({ description: "Calendar event ID" }),
      summary: Type.Optional(Type.String({ description: "Updated event title" })),
      start_time: Type.Optional(Type.String({ description: "Updated start time (ISO format)" })),
      end_time: Type.Optional(Type.String({ description: "Updated end time (ISO format)" })),
      description: Type.Optional(Type.String({ description: "Updated description" })),
      location: Type.Optional(Type.String({ description: "Updated location" })),
    }),
    async execute(_id: string, p: any) {
      const { event_id, ...body } = p;
      return json(await put(`/gmail/calendar/events/${encodeURIComponent(event_id)}`, body));
    },
  });

  api.registerTool({
    name: "calendar_event_delete",
    description: "Delete a calendar event.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent deleting the event" }),
      event_id: Type.String({ description: "Calendar event ID to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/gmail/calendar/events/${encodeURIComponent(p.event_id)}`, {
          agent_id: p.agent_id,
        }),
      );
    },
  });

  // ── Secrets ─────────────────────────────────────────────────────

  api.registerTool({
    name: "secret_store",
    description: "Store encrypted credentials for an external service (e.g. Notion API key).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to store secrets for" }),
      service_name: Type.String({ description: "Service identifier (e.g. notion, slack)" }),
      secret_data: Type.Record(Type.String(), Type.Any(), { description: "Key-value credential data to encrypt and store" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/gmail/secrets", p));
    },
  });

  api.registerTool({
    name: "secret_list",
    description: "List the names of all stored secret services for an agent (no secret data returned).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose secrets to list" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/gmail/secrets/${encodeURIComponent(p.agent_id)}`));
    },
  });

  api.registerTool({
    name: "secret_get",
    description: "Retrieve the decrypted credentials for a specific service.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose secret to retrieve" }),
      service_name: Type.String({ description: "Service identifier (e.g. notion)" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(
          `/gmail/secrets/${encodeURIComponent(p.agent_id)}/${encodeURIComponent(p.service_name)}`,
        ),
      );
    },
  });

  api.registerTool({
    name: "secret_delete",
    description: "Remove stored credentials for a service.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose secret to delete" }),
      service_name: Type.String({ description: "Service identifier to remove" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(
          `/gmail/secrets/${encodeURIComponent(p.agent_id)}/${encodeURIComponent(p.service_name)}`,
        ),
      );
    },
  });
}
