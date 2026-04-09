import { Type } from "@sinclair/typebox";
import { post, get } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "make_phone_call",
    description:
      "Place an outbound phone call to a user and converse with them using voice. " +
      "The call uses Voxtral TTS/STT for natural voice quality and connects back " +
      "to this agent for the conversation. Use for time-sensitive notifications, " +
      "interactive briefings, or when the user explicitly asks you to call them. " +
      "The phone number must be in E.164 format (e.g. '+918689908731').\n\n" +
      "IDEMPOTENCY CONTRACT (very important — read carefully):\n" +
      "  - This tool returns IMMEDIATELY after dialing succeeds. The response " +
      "    contains call_id, state, and a `message` field. SUCCESS is implied " +
      "    by the absence of an error response — there is no separate 'success' " +
      "    field to check.\n" +
      "  - DO NOT CALL THIS TOOL AGAIN for the same number while a previous call " +
      "    is in progress. The system will detect duplicates (same number + agent " +
      "    within 5 minutes) and return `deduped: true` instead of dialing again, " +
      "    but you should not even try.\n" +
      "  - If you need to know what's happening on a call, use get_voice_call " +
      "    with the call_id from the response. Don't re-call make_phone_call.\n" +
      "  - After receiving a successful response, your next message to the user " +
      "    should be brief: 'I've placed the call' or similar. Do not dial again " +
      "    just because the call is still ringing.",
    parameters: Type.Object({
      to: Type.String({
        description: "Destination phone number in E.164 format, e.g. '+918689908731'",
      }),
      agent_id: Type.String({
        description: "The agent ID that will handle the voice conversation (usually the calling agent itself)",
      }),
      initial_message: Type.Optional(
        Type.String({
          description:
            "The first thing the agent will say when the callee picks up. " +
            "Keep it short (≤15 seconds spoken, ~2 sentences).",
        }),
      ),
      system_prompt: Type.Optional(
        Type.String({
          description:
            "Optional extra system instructions for the voice agent, " +
            "scoping the call to a specific task or topic.",
        }),
      ),
      user_id: Type.Optional(
        Type.String({ description: "Owner user id for listing/filtering." }),
      ),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post("/voice/call", {
          to: p.to,
          agent_id: p.agent_id,
          initial_message: p.initial_message,
          system_prompt: p.system_prompt,
          user_id: p.user_id,
        }),
      );
    },
  });

  api.registerTool({
    name: "get_voice_call",
    description:
      "Look up a previously placed voice call by call_id. Returns the call " +
      "status, hangup reason, duration, and the full transcript of who said what. " +
      "Use this to check whether a call succeeded and what was discussed.",
    parameters: Type.Object({
      call_id: Type.String({ description: "The call_id returned by make_phone_call" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/voice/call/${encodeURIComponent(p.call_id)}`));
    },
  });

  api.registerTool({
    name: "list_voice_calls",
    description:
      "List recent voice calls (most recent first). Returns call metadata and " +
      "transcripts. Useful for reviewing what calls have been placed.",
    parameters: Type.Object({
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 20 })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/voice/calls", { limit: p.limit }));
    },
  });
}
