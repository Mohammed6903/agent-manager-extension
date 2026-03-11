import { Type } from "@sinclair/typebox";
import { get, post, del } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

export function register(api: any) {
  api.registerTool({
    name: "twitter_tweet_create",
    description: "Create a new tweet on behalf of the authenticated user.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      text: Type.String({ description: "The text content of the tweet to post" }),
    }),
    async execute(_id: string, p: any) {
      return json(await post("/integrations/twitter/tweets", p));
    },
  });

  api.registerTool({
    name: "twitter_tweet_delete",
    description: "Delete a specific tweet by ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      tweet_id: Type.String({ description: "The ID of the tweet to delete" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await del(`/integrations/twitter/tweets/${encodeURIComponent(p.tweet_id)}`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_profile_get_me",
    description: "Get the authenticated user's profile details.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
    }),
    async execute(_id: string, p: any) {
      return json(await get("/integrations/twitter/users/me", p));
    },
  });

  api.registerTool({
    name: "twitter_user_get_by_id",
    description: "Get a user's details by their Twitter user ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      user_id: Type.String({ description: "The Twitter user ID" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/twitter/users/${encodeURIComponent(p.user_id)}`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_user_get_by_username",
    description: "Get a user's details by their Twitter handle (username).",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      username: Type.String({ description: "The Twitter username/handle (without @)" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/twitter/users/by/username/${encodeURIComponent(p.username)}`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_tweets_get_recent",
    description: "Get recent tweets posted by a specific user ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      user_id: Type.String({ description: "The Twitter user ID to fetch tweets from" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum tweets to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/twitter/users/${encodeURIComponent(p.user_id)}/tweets`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_user_mentions_get",
    description: "Get recent mentions for a specific user ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      user_id: Type.String({ description: "The Twitter user ID" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum mentions to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/twitter/users/${encodeURIComponent(p.user_id)}/mentions`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_tweets_search_recent",
    description: "Search for recent tweets matching a specific query.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      query: Type.String({ description: "Search query for tweets" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum results to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get("/integrations/twitter/tweets/search/recent", p)
      );
    },
  });

  api.registerTool({
    name: "twitter_followers_get",
    description: "Get a list of followers for a specific user ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      user_id: Type.String({ description: "The Twitter user ID" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum followers to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/twitter/users/${encodeURIComponent(p.user_id)}/followers`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_following_get",
    description: "Get a list of users that a specific user ID is following.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      user_id: Type.String({ description: "The Twitter user ID" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum users to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(`/integrations/twitter/users/${encodeURIComponent(p.user_id)}/following`, p)
      );
    },
  });

  api.registerTool({
    name: "twitter_dm_history_get",
    description: "Get direct message history with a specific participant ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      participant_id: Type.String({ description: "The Twitter user ID of the participant" }),
      max_results: Type.Optional(Type.Integer({ description: "Maximum messages to return (default 10)" })),
    }),
    async execute(_id: string, p: any) {
      return json(
        await get(
          `/integrations/twitter/dm_conversations/with/${encodeURIComponent(p.participant_id)}/dm_events`,
          p
        )
      );
    },
  });

  api.registerTool({
    name: "twitter_dm_send",
    description: "Send a direct message to a specific participant ID.",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent that has the Twitter integration assigned" }),
      participant_id: Type.String({ description: "The Twitter user ID of the recipient" }),
      text: Type.String({ description: "The text content of the direct message to send" }),
    }),
    async execute(_id: string, p: any) {
      return json(
        await post(
          `/integrations/twitter/dm_conversations/with/${encodeURIComponent(p.participant_id)}/messages`,
          p
        )
      );
    },
  });
}
