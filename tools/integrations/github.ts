import { Type } from "@sinclair/typebox";
import { get, post, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "github";

const INTEGRATION_TOOLS: any[] = [
{
    name: "github_user_me",
    description: "Get the authenticated GitHub user's profile.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/github/user", { agent_id: p.agent_id }));
    },
  },
{
    name: "github_repos_list",
    description: "List repositories for the authenticated GitHub user.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      sort: Type.Optional(Type.String({ description: "Sort by: created, updated, pushed, full_name" })),
      per_page: Type.Optional(Type.Integer({ description: "Results per page (max 100)" })),
      page: Type.Optional(Type.Integer({ description: "Page number" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/repos/list", p));
    },
  },
{
    name: "github_repo_get",
    description: "Get details of a specific GitHub repository.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      owner: Type.String({ description: "Repo owner (user or org)" }),
      repo: Type.String({ description: "Repository name" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/repos/get", p));
    },
  },
{
    name: "github_repo_create",
    description: "Create a new GitHub repository.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      name: Type.String({ description: "Repository name" }),
      description: Type.Optional(Type.String({ description: "Repo description" })),
      private: Type.Optional(Type.Boolean({ description: "Whether the repo is private" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/repos/create", p));
    },
  },
{
    name: "github_issues_list",
    description: "List issues for a GitHub repository.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      owner: Type.String({ description: "Repo owner" }),
      repo: Type.String({ description: "Repository name" }),
      state: Type.Optional(Type.String({ description: "Filter: open, closed, all" })),
      labels: Type.Optional(Type.String({ description: "Comma-separated label names" })),
      per_page: Type.Optional(Type.Integer({ description: "Results per page" })),
      page: Type.Optional(Type.Integer({ description: "Page number" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/issues/list", p));
    },
  },
{
    name: "github_issue_create",
    description: "Create an issue in a GitHub repository.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      owner: Type.String({ description: "Repo owner" }),
      repo: Type.String({ description: "Repository name" }),
      title: Type.String({ description: "Issue title" }),
      body: Type.Optional(Type.String({ description: "Issue body (markdown)" })),
      labels: Type.Optional(Type.Array(Type.String(), { description: "Labels to add" })),
      assignees: Type.Optional(Type.Array(Type.String(), { description: "Usernames to assign" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/issues/create", p));
    },
  },
{
    name: "github_pulls_list",
    description: "List pull requests for a GitHub repository.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      owner: Type.String({ description: "Repo owner" }),
      repo: Type.String({ description: "Repository name" }),
      state: Type.Optional(Type.String({ description: "Filter: open, closed, all" })),
      per_page: Type.Optional(Type.Integer({ description: "Results per page" })),
      page: Type.Optional(Type.Integer({ description: "Page number" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/pulls/list", p));
    },
  },
{
    name: "github_pull_create",
    description: "Create a pull request in a GitHub repository.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      owner: Type.String({ description: "Repo owner" }),
      repo: Type.String({ description: "Repository name" }),
      title: Type.String({ description: "PR title" }),
      head: Type.String({ description: "Branch with changes" }),
      base: Type.String({ description: "Branch to merge into" }),
      body: Type.Optional(Type.String({ description: "PR body" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/pulls/create", p));
    },
  },
{
    name: "github_search_repos",
    description: "Search GitHub repositories.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      q: Type.String({ description: "Search query" }),
      per_page: Type.Optional(Type.Integer({ description: "Results per page" })),
      page: Type.Optional(Type.Integer({ description: "Page number" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/search/repositories", p));
    },
  },
{
    name: "github_search_issues",
    description: "Search GitHub issues and pull requests.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "Agent with GitHub integration" }),
      q: Type.String({ description: "Search query" }),
      per_page: Type.Optional(Type.Integer({ description: "Results per page" })),
      page: Type.Optional(Type.Integer({ description: "Page number" })),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/github/search/issues", p));
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
