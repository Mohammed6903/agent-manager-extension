import { Type } from "@sinclair/typebox";
import { get, post, del } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "linkedin_userinfo_get",
    description: "Get the authenticated LinkedIn user's info.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/userinfo", p));
    },
  });

  api.registerTool({
    name: "linkedin_profile_get_me",
    description: "Get the authenticated LinkedIn user's profile.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/me", p));
    },
  });

  api.registerTool({
    name: "linkedin_ugc_post_create",
    description: "Create a new LinkedIn UGC post.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The ID of the agent that has the LinkedIn integration assigned." }),
      author_urn: Type.String({ description: "The URN of the author." }),
      text: Type.String({ description: "The text content of the post." }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/linkedin/ugcPosts", p));
    },
  });

  api.registerTool({
    name: "linkedin_ugc_post_get",
    description: "Get a specific LinkedIn UGC post by URN.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
      ugc_post_urn: Type.String({ description: "The LinkedIn UGC post URN" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/linkedin/ugcPosts/${encodeURIComponent(p.ugc_post_urn)}`, p)
      );
    },
  });

  api.registerTool({
    name: "linkedin_ugc_post_delete",
    description: "Delete a specific LinkedIn UGC post by URN.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
      ugc_post_urn: Type.String({ description: "The LinkedIn UGC post URN" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/linkedin/ugcPosts/${encodeURIComponent(p.ugc_post_urn)}`, p)
      );
    },
  });

  api.registerTool({
    name: "linkedin_connections_get",
    description: "Get first-degree LinkedIn connections.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/connections", p));
    },
  });

  api.registerTool({
    name: "linkedin_organizations_get",
    description: "Get LinkedIn organizational entity ACLs.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the LinkedIn integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/linkedin/organizations", p));
    },
  });

  api.registerTool({
    name: "linkedin_image_upload_initialize",
    description: "Initialize a LinkedIn image upload.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The ID of the agent that has the LinkedIn integration assigned." }),
      person_urn: Type.String({ description: "The URN of the person initializing the upload." }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/linkedin/images/initialize", p));
    },
  });
}