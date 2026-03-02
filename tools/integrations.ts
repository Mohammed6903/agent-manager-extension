import { Type } from "@sinclair/typebox";
import { get, post, patch, del } from "../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const AuthField = Type.Object({
  name: Type.String({ description: "Field name (e.g. access_token)" }),
  label: Type.String({ description: "Human-readable label" }),
  required: Type.Boolean({ description: "Whether this field is required" }),
});

const Endpoint = Type.Object({
  method: Type.String({ description: "HTTP method (GET, POST, etc.)" }),
  path: Type.String({ description: "Endpoint path" }),
  description: Type.String({ description: "What this endpoint does" }),
});

export function register(api: any) {
  api.registerTool({
    name: "integration_create",
    description: "Register a new external integration (e.g. Slack, GitHub, Notion) with its auth scheme and endpoints.",
    parameters: Type.Object({
      name: Type.String({ description: "Integration display name" }),
      type: Type.String({ description: "Integration type (e.g. slack, github, notion)" }),
      base_url: Type.String({ description: "Base URL of the external API" }),
      auth_fields: Type.Array(AuthField, { description: "Credential fields the user must provide" }),
      endpoints: Type.Array(Endpoint, { description: "Available API endpoints" }),
      usage_instructions: Type.String({ description: "Instructions on how to authenticate and use this integration" }),
      api_type: Type.Optional(Type.Union([Type.Literal("rest"), Type.Literal("graphql")], { description: "API type (default: rest)" })),
      status: Type.Optional(Type.String({ description: "Integration status (default: active)" })),
      auth_scheme: Type.Optional(
        Type.Object({
          type: Type.String({ description: "Auth type: bearer, basic, api_key_header, or api_key_query" }),
          token_field: Type.Optional(Type.String({ description: "Which auth_field holds the token" })),
          extra_headers: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Additional headers with {field} placeholders" })),
        }),
      ),
      request_transformers: Type.Optional(Type.Array(Type.Any(), { description: "Request transformation rules" })),
      response_transformers: Type.Optional(Type.Array(Type.Any(), { description: "Response transformation rules" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations", p));
    },
  });

  api.registerTool({
    name: "integration_list",
    description: "List all registered external integrations.",
    parameters: Type.Object({}),
    async execute() {
      return json(await get("/integrations"));
    },
  });

  api.registerTool({
    name: "integration_get",
    description: "Get the full configuration of a specific integration.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/${encodeURIComponent(p.integration_id)}`));
    },
  });

  api.registerTool({
    name: "integration_update",
    description: "Update an integration's configuration, endpoints, or auth scheme.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
      name: Type.Optional(Type.String()),
      type: Type.Optional(Type.String()),
      base_url: Type.Optional(Type.String()),
      api_type: Type.Optional(Type.Union([Type.Literal("rest"), Type.Literal("graphql")])),
      status: Type.Optional(Type.String()),
      auth_scheme: Type.Optional(Type.Any()),
      auth_fields: Type.Optional(Type.Array(AuthField)),
      endpoints: Type.Optional(Type.Array(Endpoint)),
      usage_instructions: Type.Optional(Type.String()),
      request_transformers: Type.Optional(Type.Array(Type.Any())),
      response_transformers: Type.Optional(Type.Array(Type.Any())),
    }),
    async execute(_id: string, p: any) {
      const { integration_id, ...body } = p;
      return json(await patch(`/integrations/${encodeURIComponent(integration_id)}`, body));
    },
  });

  api.registerTool({
    name: "integration_delete",
    description: "Remove an integration that is no longer used.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await del(`/integrations/${encodeURIComponent(p.integration_id)}`));
    },
  });

  api.registerTool({
    name: "integration_assign",
    description: "Assign an integration to an agent by providing the required credentials.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
      agent_id: Type.String({ description: "The agent to assign the integration to" }),
      credentials: Type.Record(Type.String(), Type.String(), { description: "Key-value credential map matching the integration's auth_fields" }),
    }),
    async execute(_id: string, p: any) {
      const { integration_id, ...body } = p;
      return json(await post(`/integrations/${encodeURIComponent(integration_id)}/assign`, body));
    },
  });

  api.registerTool({
    name: "integration_agent_list",
    description: "List all integrations assigned to a specific agent with their configuration details.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/agent/${encodeURIComponent(p.agent_id)}`));
    },
  });

  api.registerTool({
    name: "integration_credentials",
    description: "Get the decrypted credentials for an integration assigned to an agent.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
      agent_id: Type.String({ description: "The agent's unique identifier" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/${encodeURIComponent(p.integration_id)}/credentials`, {
          agent_id: p.agent_id,
        }),
      );
    },
  });

  api.registerTool({
    name: "integration_proxy",
    description: "Make an API request to a third-party service through the integration proxy, which auto-injects auth headers.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
      agent_id: Type.String({ description: "The agent making the request" }),
      method: Type.String({ description: "HTTP method (GET, POST, PUT, PATCH, DELETE)" }),
      path: Type.String({ description: "API path appended to the integration's base_url" }),
      body: Type.Optional(Type.Any({ description: "Request body (for POST/PUT/PATCH)" })),
      headers: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Additional request headers" })),
      params: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Query parameters" })),
    }),
    async execute(_id: string, p: any) {
      const { integration_id, ...body } = p;
      return json(await post(`/integrations/${encodeURIComponent(integration_id)}/proxy`, body));
    },
  });

  api.registerTool({
    name: "integration_proxy_graphql",
    description: "Execute a GraphQL query or mutation through the integration proxy.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
      agent_id: Type.String({ description: "The agent making the request" }),
      query: Type.String({ description: "GraphQL query or mutation string" }),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any(), { description: "GraphQL variables" })),
      operation_name: Type.Optional(Type.String({ description: "GraphQL operation name" })),
      headers: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Additional headers" })),
    }),
    async execute(_id: string, p: any) {
      const { integration_id, ...body } = p;
      return json(
        await post(`/integrations/${encodeURIComponent(integration_id)}/proxy/graphql`, body),
      );
    },
  });

  api.registerTool({
    name: "integration_logs",
    description: "View the API request log history for an integration to debug issues.",
    parameters: Type.Object({
      integration_id: Type.String({ description: "The integration's UUID" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get(`/integrations/${encodeURIComponent(p.integration_id)}/logs`));
    },
  });
}
