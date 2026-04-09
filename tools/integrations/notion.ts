import { Type } from "@sinclair/typebox";
import { get, post, patch, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "notion";

const INTEGRATION_TOOLS: any[] = [
{
    name: "notion_search",
    description:
      "Search pages and databases in the connected Notion workspace. " +
      "Use filter to narrow by object type (e.g. {\"value\": \"page\", \"property\": \"object\"}).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      query: Type.Optional(Type.String({ description: "Search query text" })),
      filter: Type.Optional(
        Type.Any({ description: "Filter object, e.g. {\"value\": \"page\", \"property\": \"object\"}" }),
      ),
      sort: Type.Optional(
        Type.Any({
          description:
            "Sort object, e.g. {\"direction\": \"descending\", \"timestamp\": \"last_edited_time\"}",
        }),
      ),
      start_cursor: Type.Optional(Type.String({ description: "Pagination cursor from a previous response" })),
      page_size: Type.Optional(Type.Integer({ description: "Results per page (max 100)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/notion/search", p));
    },
  },
{
    name: "notion_page_create",
    description:
      "Create a new Notion page. Requires a parent (database or page) and properties matching the parent schema. " +
      "Optionally include children blocks for the page body.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      parent: Type.Any({
        description: "Parent object, e.g. {\"database_id\": \"...\"} or {\"page_id\": \"...\"}",
      }),
      properties: Type.Any({ description: "Page properties matching the parent database schema" }),
      children: Type.Optional(Type.Array(Type.Any(), { description: "Page content as block objects" })),
      icon: Type.Optional(Type.Any({ description: "Icon object (emoji or external URL)" })),
      cover: Type.Optional(Type.Any({ description: "Cover image object" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/notion/pages", p));
    },
  },
{
    name: "notion_page_get",
    description: "Retrieve a Notion page by its ID. Returns the page object with properties.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      page_id: Type.String({ description: "The Notion page ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/notion/pages/${encodeURIComponent(p.page_id)}`, p),
      );
    },
  },
{
    name: "notion_page_update",
    description:
      "Update Notion page properties, icon, or cover. Set archived=true to archive (delete) the page.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      page_id: Type.String({ description: "The Notion page ID" }),
      properties: Type.Optional(Type.Any({ description: "Properties to update" })),
      archived: Type.Optional(Type.Boolean({ description: "Set to true to archive the page" })),
      icon: Type.Optional(Type.Any({ description: "Icon object" })),
      cover: Type.Optional(Type.Any({ description: "Cover image object" })),
    }),
    async execute(_id: string, p: any) {
      const { page_id, ...body } = p;
      return json(
        await patch(`/integrations/notion/pages/${encodeURIComponent(page_id)}`, body),
      );
    },
  },
{
    name: "notion_block_children_get",
    description:
      "Retrieve block children (page content). Pass a page ID or block ID to read its content blocks.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      block_id: Type.String({ description: "The block or page ID to get children of" }),
      start_cursor: Type.Optional(Type.String({ description: "Pagination cursor" })),
      page_size: Type.Optional(Type.Integer({ description: "Results per page (max 100)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/notion/blocks/${encodeURIComponent(p.block_id)}/children`, p),
      );
    },
  },
{
    name: "notion_block_children_append",
    description:
      "Append new content blocks to a page or block. Pass children as an array of block objects.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      block_id: Type.String({ description: "The block or page ID to append children to" }),
      children: Type.Array(Type.Any(), { description: "Array of block objects to append" }),
      after: Type.Optional(Type.String({ description: "Block ID to insert after" })),
    }),
    async execute(_id: string, p: any) {
      const { block_id, ...body } = p;
      return json(
        await patch(`/integrations/notion/blocks/${encodeURIComponent(block_id)}/children`, body),
      );
    },
  },
{
    name: "notion_block_update",
    description:
      "Update a specific block's content. Pass block_data as the block type object with updated content, " +
      "e.g. {\"paragraph\": {\"rich_text\": [...]}}.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      block_id: Type.String({ description: "The block ID to update" }),
      block_data: Type.Any({
        description:
          "Block type object with updated content, e.g. {\"paragraph\": {\"rich_text\": [...]}}",
      }),
    }),
    async execute(_id: string, p: any) {
      const { block_id, ...body } = p;
      return json(
        await patch(`/integrations/notion/blocks/${encodeURIComponent(block_id)}`, body),
      );
    },
  },
{
    name: "notion_block_delete",
    description: "Delete (archive) a specific block by its ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      block_id: Type.String({ description: "The block ID to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/notion/blocks/${encodeURIComponent(p.block_id)}`, p),
      );
    },
  },
{
    name: "notion_database_create",
    description:
      "Create a new Notion database. Requires a parent page, title, and property schema.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      parent: Type.Any({ description: "Parent object, e.g. {\"page_id\": \"...\"}" }),
      title: Type.Array(Type.Any(), { description: "Database title as rich text array" }),
      properties: Type.Any({ description: "Property schema for the database" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/notion/databases", p));
    },
  },
{
    name: "notion_database_get",
    description: "Retrieve a Notion database by its ID. Returns the database object with its schema.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      database_id: Type.String({ description: "The Notion database ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/notion/databases/${encodeURIComponent(p.database_id)}`, p),
      );
    },
  },
{
    name: "notion_database_query",
    description:
      "Query a Notion database to retrieve its rows/pages. Supports filtering and sorting. " +
      "Use this to read structured data from Notion databases.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      database_id: Type.String({ description: "The Notion database ID" }),
      filter: Type.Optional(Type.Any({ description: "Filter object for the query" })),
      sorts: Type.Optional(
        Type.Array(Type.Any(), { description: "Sort criteria array" }),
      ),
      start_cursor: Type.Optional(Type.String({ description: "Pagination cursor" })),
      page_size: Type.Optional(Type.Integer({ description: "Results per page (max 100)" })),
    }),
    async execute(_id: string, p: any) {
      const { database_id, ...body } = p;
      return json(
        await post(
          `/integrations/notion/databases/${encodeURIComponent(database_id)}/query`,
          body,
        ),
      );
    },
  },
{
    name: "notion_database_update",
    description: "Update a Notion database's title or property schema.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      database_id: Type.String({ description: "The Notion database ID" }),
      title: Type.Optional(
        Type.Array(Type.Any(), { description: "Updated database title as rich text array" }),
      ),
      properties: Type.Optional(Type.Any({ description: "Updated property schema" })),
    }),
    async execute(_id: string, p: any) {
      const { database_id, ...body } = p;
      return json(
        await patch(
          `/integrations/notion/databases/${encodeURIComponent(database_id)}`,
          body,
        ),
      );
    },
  },
{
    name: "notion_users_list",
    description: "List all users in the connected Notion workspace.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/notion/users", p));
    },
  },
{
    name: "notion_user_get",
    description: "Retrieve a specific user by their Notion user ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      user_id: Type.String({ description: "The Notion user ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/notion/users/${encodeURIComponent(p.user_id)}`, p),
      );
    },
  },
{
    name: "notion_bot_user_get",
    description: "Get the bot user associated with the Notion integration token.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/notion/users/me", p));
    },
  },
{
    name: "notion_comment_create",
    description:
      "Create a comment on a Notion page or discussion thread. " +
      "Provide either parent ({\"page_id\": \"...\"}) or discussion_id, plus rich_text content.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      parent: Type.Optional(
        Type.Any({ description: "Parent page object, e.g. {\"page_id\": \"...\"}" }),
      ),
      discussion_id: Type.Optional(Type.String({ description: "Discussion thread ID" })),
      rich_text: Type.Array(Type.Any(), { description: "Comment content as rich text array" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/notion/comments", p));
    },
  },
{
    name: "notion_comments_get",
    description: "Retrieve comments for a specific Notion block or page.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Notion integration assigned" }),
      block_id: Type.String({ description: "The block or page ID to get comments for" }),
      start_cursor: Type.Optional(Type.String({ description: "Pagination cursor" })),
      page_size: Type.Optional(Type.Integer({ description: "Results per page (max 100)" })),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/notion/comments", p));
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
