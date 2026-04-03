import { Type } from "@sinclair/typebox";
import { post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  // Channels
  api.registerTool({
    name: "slack_channels_list",
    description: "List channels in the connected Slack workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      types: Type.Optional(Type.String({ description: "Comma-separated: public_channel, private_channel, mpim, im" })),
      limit: Type.Optional(Type.Integer({ description: "Max channels to return" })),
      cursor: Type.Optional(Type.String({ description: "Pagination cursor" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/conversations/list", p));
    },
  });

  api.registerTool({
    name: "slack_channel_info",
    description: "Get detailed info about a Slack channel.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "Channel ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/conversations/info", p));
    },
  });

  api.registerTool({
    name: "slack_channel_create",
    description: "Create a new Slack channel.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      name: Type.String({ description: "Channel name" }),
      is_private: Type.Optional(Type.Boolean({ description: "Create as private channel" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/conversations/create", p));
    },
  });

  api.registerTool({
    name: "slack_channel_history",
    description: "Get message history from a Slack channel.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "Channel ID" }),
      limit: Type.Optional(Type.Integer({ description: "Number of messages (max 1000)" })),
      oldest: Type.Optional(Type.String({ description: "Start of time range (Unix timestamp)" })),
      latest: Type.Optional(Type.String({ description: "End of time range (Unix timestamp)" })),
      cursor: Type.Optional(Type.String({ description: "Pagination cursor" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/conversations/history", p));
    },
  });

  // Messages
  api.registerTool({
    name: "slack_message_send",
    description: "Send a message to a Slack channel.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "Channel ID" }),
      text: Type.Optional(Type.String({ description: "Message text (supports mrkdwn)" })),
      blocks: Type.Optional(Type.Array(Type.Any(), { description: "Block Kit blocks" })),
      thread_ts: Type.Optional(Type.String({ description: "Thread timestamp for reply" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/chat/postMessage", p));
    },
  });

  api.registerTool({
    name: "slack_message_update",
    description: "Update an existing Slack message.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "Channel ID" }),
      ts: Type.String({ description: "Timestamp of message to update" }),
      text: Type.Optional(Type.String({ description: "Updated text" })),
      blocks: Type.Optional(Type.Array(Type.Any(), { description: "Updated blocks" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/chat/update", p));
    },
  });

  api.registerTool({
    name: "slack_message_delete",
    description: "Delete a Slack message.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "Channel ID" }),
      ts: Type.String({ description: "Timestamp of message to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/chat/delete", p));
    },
  });

  // Users
  api.registerTool({
    name: "slack_users_list",
    description: "List all users in the Slack workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      limit: Type.Optional(Type.Integer({ description: "Max users to return" })),
      cursor: Type.Optional(Type.String({ description: "Pagination cursor" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/users/list", p));
    },
  });

  api.registerTool({
    name: "slack_user_info",
    description: "Get info about a Slack user.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "User ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/users/info", p));
    },
  });

  // Reactions
  api.registerTool({
    name: "slack_reaction_add",
    description: "Add an emoji reaction to a Slack message.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.String({ description: "Channel ID" }),
      timestamp: Type.String({ description: "Message timestamp" }),
      name: Type.String({ description: "Emoji name (without colons)" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/reactions/add", p));
    },
  });

  // Files
  api.registerTool({
    name: "slack_files_list",
    description: "List files shared in the Slack workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with Slack integration" }),
      channel: Type.Optional(Type.String({ description: "Filter by channel ID" })),
      count: Type.Optional(Type.Integer({ description: "Results per page" })),
      page: Type.Optional(Type.Integer({ description: "Page number" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/slack/files/list", p));
    },
  });
}
