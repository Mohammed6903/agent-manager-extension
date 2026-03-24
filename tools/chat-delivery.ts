import { Type } from "@sinclair/typebox";
import { post } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "deliver_chat_message",
    description:
      "Deliver a message directly to the user's chat UI. " +
      "Use this at the end of every cron/scheduled job to send the final summary to the user. " +
      "The message will appear in real-time in their chat window. " +
      "Do NOT use pipeline_result blocks — use this tool instead.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent ID sending this message" }),
      user_id: Type.String({ description: "The user ID to deliver the message to" }),
      session_id: Type.String({ description: "The session ID for the chat" }),
      content: Type.String({ description: "The message content to deliver to the user. Should be a clean, human-readable summary." }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post("/messages/deliver", {
          agent_id: p.agent_id,
          user_id: p.user_id,
          session_id: p.session_id,
          content: p.content,
        })
      );
    },
  });
}
