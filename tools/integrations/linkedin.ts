import { Type } from "@sinclair/typebox";
import { get, post, del } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "linkedin_userinfo_get",
    description: "Get the authenticated LinkedIn user's info via OpenID Connect /userinfo endpoint. Returns sub (person ID), name, given_name, family_name, picture, and locale. Use the 'sub' field as the author_urn when creating posts.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/userinfo", p));
    },
  });

  api.registerTool({
    name: "linkedin_ugc_post_create",
    description: "Create a new LinkedIn post. Before calling this, use linkedin_userinfo_get to get the user's 'sub' field and pass it as author_urn (e.g. 'urn:li:person:abc123' or just 'abc123' — both are accepted). Returns 'id', 'shareUrn' (use this for deletion), and 'ugcPostUrn'.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The ID of the agent that has the LinkedIn integration assigned." }),
      author_urn: Type.String({ description: "The URN of the post author. Use the 'sub' from linkedin_userinfo_get, formatted as 'urn:li:person:{sub}' or just the raw sub value." }),
      text: Type.String({ description: "The text content of the post." }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/linkedin/ugcPosts", p));
    },
  });

  api.registerTool({
    name: "linkedin_ugc_post_get",
    description: "Get a specific LinkedIn post by URN. Pass the shareUrn or ugcPostUrn returned from linkedin_ugc_post_create.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
      ugc_post_urn: Type.String({ description: "The post URN — use the shareUrn (urn:li:share:...) or ugcPostUrn (urn:li:ugcPost:...) returned from linkedin_ugc_post_create." }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/linkedin/ugcPosts/${encodeURIComponent(p.ugc_post_urn)}`, p)
      );
    },
  });

  api.registerTool({
    name: "linkedin_ugc_post_delete",
    description: "Delete a specific LinkedIn post by URN. IMPORTANT: always pass the 'shareUrn' (urn:li:share:...) returned from linkedin_ugc_post_create, not the ugcPostUrn. Passing the wrong URN type will fail.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
      ugc_post_urn: Type.String({ description: "The shareUrn of the post to delete (urn:li:share:...). Use the 'shareUrn' field from linkedin_ugc_post_create response, not ugcPostUrn." }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/linkedin/ugcPosts/${encodeURIComponent(p.ugc_post_urn)}`, p)
      );
    },
  });

  api.registerTool({
    name: "linkedin_connections_get",
    description: "Get first-degree LinkedIn connections. Requires the r_network scope — this is a restricted LinkedIn permission that must be explicitly approved for your app. Will return a permissions error if not granted.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/connections", p));
    },
  });

  api.registerTool({
    name: "linkedin_organizations_get",
    description: "Get LinkedIn organizations the authenticated user administers.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/organizations", p));
    },
  });

  api.registerTool({
    name: "linkedin_image_upload_initialize",
    description: "Initialize a LinkedIn image upload using the current Images API. Returns an uploadUrl and image URN. Upload the image binary to uploadUrl, then use the image URN when creating a post with media.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The ID of the agent that has the LinkedIn integration assigned." }),
      person_urn: Type.String({ description: "The URN of the person owning the upload. Use the 'sub' from linkedin_userinfo_get formatted as 'urn:li:person:{sub}'." }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/linkedin/images/initialize", p));
    },
  });
}