import { Type } from "@sinclair/typebox";
import { get, post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "gmail_email_list",
    description: "List recent emails from an agent's connected Gmail account.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Gmail to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum emails to return (default 10)" })),
      query: Type.Optional(Type.String({ description: "Gmail search query (e.g. 'from:user@example.com is:unread')" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/gmail/list", p));
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
      return json(await get("/integrations/gmail/search", p));
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
      return json(await get("/integrations/gmail/read", p));
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
      return json(await post("/integrations/gmail/batch_read", p));
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
      return json(await get("/integrations/gmail/thread", p));
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
      return json(await post("/integrations/gmail/send", p));
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
      return json(await post("/integrations/gmail/reply", p));
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
      return json(await post("/integrations/gmail/modify", p));
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
      return json(await get("/integrations/gmail/attachment", p));
    },
  });
}
