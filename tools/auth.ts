import { Type } from "@sinclair/typebox";
import { get, post } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  // ── Google OAuth ─────────────────────────────────────────────────

  api.registerTool({
    name: "google_auth_login",
    description:
      "Initiate Google OAuth login flow for an agent. Returns an authorization URL the user must visit to grant access. " +
      "You MUST use this tool if you receive any authentication or authorization error (e.g. 401, 403, token expired, " +
      "invalid credentials) when using any Google service tool such as Gmail or Google Calendar. " +
      "Also use this for first-time setup of any Google service for a new agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent to initiate Google OAuth for" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/google/auth/login", { agent_id: p.agent_id }));
    },
  });

  api.registerTool({
    name: "google_auth_callback_manual",
    description:
      "Complete the Google OAuth flow using an authorization code or the full redirect URL returned after the user visits the authorization URL from google_auth_login. " +
      "Call this immediately after the user confirms they have authorized access.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent completing the OAuth flow" }),
      code: Type.Optional(Type.String({ description: "OAuth authorization code from the redirect" })),
      redirect_url: Type.Optional(Type.String({ description: "Full redirect URL containing the authorization code" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/google/auth/callback/manual", p));
    },
  });
}
