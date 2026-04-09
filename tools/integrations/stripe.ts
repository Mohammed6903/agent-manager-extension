import { Type } from "@sinclair/typebox";
import { post, del, getAgentIntegrationsSync } from "../../client";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}


const INTEGRATION_NAME = "stripe";

const INTEGRATION_TOOLS: any[] = [
{ name: "stripe_balance", description: "Get Stripe account balance.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/balance", p)); } },
{ name: "stripe_customers_list", description: "List Stripe customers.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), limit: Type.Optional(Type.Integer({ description: "Max results (100)" })), starting_after: Type.Optional(Type.String({ description: "Pagination cursor" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/customers/list", p)); } },
{ name: "stripe_customer_get", description: "Get a Stripe customer.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), customer_id: Type.String({ description: "Customer ID (cus_...)" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/customers/get", p)); } },
{ name: "stripe_customer_create", description: "Create a Stripe customer.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), email: Type.Optional(Type.String({ description: "Email" })), name: Type.Optional(Type.String({ description: "Name" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/customers/create", p)); } },
{ name: "stripe_payment_intents_list", description: "List Stripe payment intents.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), customer: Type.Optional(Type.String({ description: "Filter by customer ID" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/payment_intents/list", p)); } },
{ name: "stripe_payment_intent_create", description: "Create a Stripe payment intent.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), amount: Type.Integer({ description: "Amount in smallest unit (cents)" }), currency: Type.String({ description: "Three-letter ISO code (e.g. usd)" }), customer: Type.Optional(Type.String({ description: "Customer ID" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/payment_intents/create", p)); } },
{ name: "stripe_invoices_list", description: "List Stripe invoices.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), customer: Type.Optional(Type.String({ description: "Filter by customer" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/invoices/list", p)); } },
{ name: "stripe_subscriptions_list", description: "List Stripe subscriptions.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })), customer: Type.Optional(Type.String({ description: "Filter by customer" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/subscriptions/list", p)); } },
{ name: "stripe_subscription_create", description: "Create a Stripe subscription.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), customer: Type.String({ description: "Customer ID" }), price: Type.String({ description: "Price ID (price_...)" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/subscriptions/create", p)); } },
{ name: "stripe_subscription_cancel", description: "Cancel a Stripe subscription.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), subscription_id: Type.String({ description: "Subscription ID (sub_...)" }) }), async execute(_id: string, p: any) { return json(await del(`/integrations/stripe/subscriptions/${encodeURIComponent(p.subscription_id)}`, { agent_id: p.agent_id })); } },
{ name: "stripe_products_list", description: "List Stripe products.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), limit: Type.Optional(Type.Integer({ description: "Max results" })) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/products/list", p)); } },
{ name: "stripe_product_create", description: "Create a Stripe product.", parameters: Type.Object({ agent_id: Type.String({ description: "Agent with Stripe integration" }), name: Type.String({ description: "Product name" }) }), async execute(_id: string, p: any) { return json(await post("/integrations/stripe/products/create", p)); } }
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
