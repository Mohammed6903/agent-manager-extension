import { Type } from "@sinclair/typebox";
import { get, post, patch, del } from "../client";

/** Helper to return a JSON text content block. */
function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  // ── Agent CRUD ──────────────────────────────────────────────────

  api.registerTool({
    name: "agent_create",
    description: "Create a new AI agent persona when the user wants to set up a new assistant.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Unique lowercase alphanumeric identifier for the agent" }),
      name: Type.String({ description: "Display name of the agent" }),
      role: Type.String({ description: "The agent's role or purpose" }),
      soul: Type.Optional(Type.String({ description: "Personality and behavioral guidelines" })),
      identity: Type.Optional(Type.String({ description: "Identity description" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/agents", p));
    },
  });

  api.registerTool({
    name: "agent_list",
    description: "List all available agents to see which AI personas are configured.",
    parameters: Type.Object({}),
    async execute() {
      return json(await get("/agents"));
    },
  });

  api.registerTool({
    name: "agent_get",
    description: "Get the full details of a specific agent by its ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/agents/${encodeURIComponent(p.agent_id)}`));
    },
  });

  api.registerTool({
    name: "agent_update",
    description: "Update an agent's name, role, soul, or identity configuration.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      name: Type.Optional(Type.String({ description: "New display name" })),
      role: Type.Optional(Type.String({ description: "New role" })),
      soul: Type.Optional(Type.String({ description: "New soul/personality" })),
      identity: Type.Optional(Type.String({ description: "New identity description" })),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, ...body } = p;
      return json(await patch(`/agents/${encodeURIComponent(agent_id)}`, body));
    },
  });

  api.registerTool({
    name: "agent_delete",
    description: "Remove an agent that is no longer needed.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/agents/${encodeURIComponent(p.agent_id)}`));
    },
  });

  // ── Sessions ────────────────────────────────────────────────────

  api.registerTool({
    name: "session_list_for_agent",
    description: "List chat sessions for a specific agent, optionally filtered by user or room.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      user_id: Type.Optional(Type.String({ description: "Filter by user ID" })),
      room_id: Type.Optional(Type.String({ description: "Filter by room ID" })),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, ...params } = p;
      return json(await get(`/agents/${encodeURIComponent(agent_id)}/sessions`, params));
    },
  });

  api.registerTool({
    name: "session_list",
    description: "List all chat sessions across agents, optionally filtered by user.",
    parameters: Type.Object({
      user_id: Type.Optional(Type.String({ description: "Filter by user ID" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/sessions", p));
    },
  });

  api.registerTool({
    name: "session_history",
    description: "Retrieve the chat history for a specific user's session with an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      user_id: Type.String({ description: "The user's identifier" }),
      session_id: Type.Optional(Type.String({ description: "Specific session ID" })),
      limit: Type.Optional(Type.Integer({ description: "Max messages to return (default 50)" })),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, user_id, ...params } = p;
      return json(
        await get(
          `/agents/${encodeURIComponent(agent_id)}/sessions/${encodeURIComponent(user_id)}/history`,
          params,
        ),
      );
    },
  });

  api.registerTool({
    name: "session_room_history",
    description: "Retrieve the chat history for a group room with an agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
      room_id: Type.String({ description: "The room's identifier" }),
      limit: Type.Optional(Type.Integer({ description: "Max messages to return (default 50)" })),
    }),
    async execute(_id: string, p: any) {
      const { agent_id, room_id, ...params } = p;
      return json(
        await get(
          `/agents/${encodeURIComponent(agent_id)}/rooms/${encodeURIComponent(room_id)}/history`,
          params,
        ),
      );
    },
  });

  api.registerTool({
    name: "agent_memory_clear",
    description: "Clear an agent's memory when it needs a fresh start or the memory is corrupted.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/agents/${encodeURIComponent(p.agent_id)}/memory`));
    },
  });

  // ── Chat ────────────────────────────────────────────────────────

  api.registerTool({
    name: "chat_send",
    description: "Send a message to an agent and receive a complete response — useful for inter-agent communication.",
    parameters: Type.Object({
      message: Type.String({ description: "The message to send" }),
      agent_id: Type.String({ description: "Target agent ID" }),
      user_id: Type.String({ description: "Sender's user ID" }),
      session_id: Type.Optional(Type.String({ description: "Existing session ID to continue" })),
      room_id: Type.Optional(Type.String({ description: "Room ID for group chats" })),
      recent_context: Type.Optional(Type.String({ description: "Recent conversation context for group chats" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/chat/completions", p));
    },
  });

  api.registerTool({
    name: "chat_new_session",
    description: "Create a new chat session to start a fresh conversation.",
    parameters: Type.Object({}),
    async execute() {
      return json(await post("/chat/new-session"));
    },
  });
}
