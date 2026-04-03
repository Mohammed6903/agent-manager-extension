import { Type } from "@sinclair/typebox";
import { post } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({ name: "airtable_bases_list", description: "List all accessible Airtable bases.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/bases/list", p)); } });

  api.registerTool({ name: "airtable_tables_list", description: "List tables in an Airtable base.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }), base_id: Type.String({ description: "Base ID (app...)" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/tables/list", p)); } });

  api.registerTool({ name: "airtable_records_list", description: "List records in an Airtable table.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }), base_id: Type.String({ description: "Base ID" }), table_id_or_name: Type.String({ description: "Table ID or name" }), max_records: Type.Optional(Type.Integer({ description: "Max records to return" })), view: Type.Optional(Type.String({ description: "View name or ID" })), filter_by_formula: Type.Optional(Type.String({ description: "Airtable formula filter" })), offset: Type.Optional(Type.String({ description: "Pagination offset" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/records/list", p)); } });

  api.registerTool({ name: "airtable_record_get", description: "Get a single Airtable record.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }), base_id: Type.String({ description: "Base ID" }), table_id_or_name: Type.String({ description: "Table ID or name" }), record_id: Type.String({ description: "Record ID (rec...)" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/records/get", p)); } });

  api.registerTool({ name: "airtable_records_create", description: "Create records in an Airtable table.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }), base_id: Type.String({ description: "Base ID" }), table_id_or_name: Type.String({ description: "Table ID or name" }), records: Type.Array(Type.Any(), { description: "Array of {fields: {...}} objects" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/records/create", p)); } });

  api.registerTool({ name: "airtable_records_update", description: "Update records in an Airtable table.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }), base_id: Type.String({ description: "Base ID" }), table_id_or_name: Type.String({ description: "Table ID or name" }), records: Type.Array(Type.Any(), { description: "Array of {id, fields} objects" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/records/update", p)); } });

  api.registerTool({ name: "airtable_records_delete", description: "Delete records from an Airtable table.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Airtable integration" }), base_id: Type.String({ description: "Base ID" }), table_id_or_name: Type.String({ description: "Table ID or name" }), record_ids: Type.Array(Type.String(), { description: "Record IDs to delete" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/airtable/records/delete", p)); } });
}
