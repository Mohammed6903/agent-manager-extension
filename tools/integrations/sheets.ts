import { Type } from "@sinclair/typebox";
import { get, post, put, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "google_sheets";

const INTEGRATION_TOOLS: any[] = [
{
    name: "sheets_list_spreadsheets",
    description: "List Google Sheets spreadsheets accessible to the agent.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent whose Google Sheets to query" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum spreadsheets to return (default 10)" })),
      query: Type.Optional(Type.String({ description: "Filter query (e.g. a name substring)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/sheets/spreadsheets", p));
    },
  },
{
    name: "sheets_get_spreadsheet",
    description: "Get metadata and sheet list for a specific Google Sheets spreadsheet.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      spreadsheet_id: Type.String({ description: "ID of the spreadsheet" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/sheets/spreadsheets/${encodeURIComponent(p.spreadsheet_id)}`, {
          agent_id: p.agent_id,
        }),
      );
    },
  },
{
    name: "sheets_create_spreadsheet",
    description: "Create a new Google Sheets spreadsheet.",
      parameters: Type.Object({
        agent_id: Type.String({ description: "The agent creating the spreadsheet" }),
        title: Type.String({ description: "Title of the new spreadsheet" }),
      }),
      async execute(_id: string, p: any) {
        // Only send agent_id and title, ignore any extra fields
        const { agent_id, title } = p;
        return json(await post("/integrations/sheets/spreadsheets", { agent_id, title }));
      },
  },
{
    name: "sheets_get_values",
    description: "Read cell values from a range in a Google Sheets spreadsheet.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      spreadsheet_id: Type.String({ description: "ID of the spreadsheet" }),
      range: Type.String({ description: "A1 notation range (e.g. 'Sheet1!A1:D10')" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(
          `/integrations/sheets/spreadsheets/${encodeURIComponent(p.spreadsheet_id)}/values`,
          { agent_id: p.agent_id, range: p.range },
        ),
      );
    },
  },
{
    name: "sheets_update_values",
    description: "Write cell values to a range in a Google Sheets spreadsheet.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      spreadsheet_id: Type.String({ description: "ID of the spreadsheet" }),
      range: Type.String({ description: "A1 notation range to update (e.g. 'Sheet1!A1:C3')" }),
      values: Type.Array(Type.Array(Type.Unknown()), {
        description: "2-D array of values matching the range dimensions",
      }),
      value_input_option: Type.Optional(
        Type.String({ description: "How input data should be interpreted: 'RAW' or 'USER_ENTERED' (default)" }),
      ),
    }),
    async execute(_id: string, p: any) {
      const { spreadsheet_id, ...body } = p;
      return json(
        await put(
          `/integrations/sheets/spreadsheets/${encodeURIComponent(spreadsheet_id)}/values`,
          body,
        ),
      );
    },
  },
{
    name: "sheets_append_values",
    description: "Append rows of data after the last row with content in a Google Sheet.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      spreadsheet_id: Type.String({ description: "ID of the spreadsheet" }),
      range: Type.String({ description: "A1 notation range that locates the table to append to (e.g. 'Sheet1')" }),
      values: Type.Array(Type.Array(Type.Unknown()), {
        description: "2-D array of rows to append",
      }),
      value_input_option: Type.Optional(
        Type.String({ description: "'RAW' or 'USER_ENTERED' (default)" }),
      ),
    }),
    async execute(_id: string, p: any) {
      const { spreadsheet_id, ...body } = p;
      return json(
        await post(
          `/integrations/sheets/spreadsheets/${encodeURIComponent(spreadsheet_id)}/values/append`,
          body,
        ),
      );
    },
  },
{
    name: "sheets_clear_values",
    description: "Clear all values from a range in a Google Sheets spreadsheet (formatting is preserved).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent performing the request" }),
      spreadsheet_id: Type.String({ description: "ID of the spreadsheet" }),
      range: Type.String({ description: "A1 notation range to clear (e.g. 'Sheet1!A1:Z100')" }),
    }),
    async execute(_id: string, p: any) {
      const { spreadsheet_id, ...body } = p;
      return json(
        await post(
          `/integrations/sheets/spreadsheets/${encodeURIComponent(spreadsheet_id)}/values/clear`,
          body,
        ),
      );
    },
  },
{
    name: "sheets_delete_spreadsheet",
    description: "Permanently delete a Google Sheets spreadsheet (moves it to trash via Drive).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent deleting the spreadsheet" }),
      spreadsheet_id: Type.String({ description: "ID of the spreadsheet to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/sheets/spreadsheets/${encodeURIComponent(p.spreadsheet_id)}`, {
          agent_id: p.agent_id,
        }),
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
