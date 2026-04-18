/**
 * Agent Manager — OpenClaw plugin entry point.
 *
 * Registers all agent-manager tools with the OpenClaw Gateway.
 * Tools are namespaced by domain: tasks, cron, contexts,
 * integrations, gmail, calendar, sheets, drive, auth, secrets, notion, and garage.
 */

import { configure, readProductTypeFile, triggerAgentIntegrationsRefresh } from "./client";
import { installPublicQaGuard } from "./tools/qa-guard";
import { register as registerTasks } from "./tools/tasks";
import { register as registerCron } from "./tools/cron";
import { register as registerContexts } from "./tools/contexts";
import { register as registerGmailContexts } from "./tools/gmail-contexts";
import { register as registerIntegrations } from "./tools/integrations";
import { register as registerGmail } from "./tools/integrations/gmail";
import { register as registerCalendar } from "./tools/integrations/calendar";
import { register as registerSheets } from "./tools/integrations/sheets";
import { register as registerDocs } from "./tools/integrations/docs";
import { register as registerDrive } from "./tools/integrations/drive";
import { register as registerTwitter } from "./tools/integrations/twitter";
import { register as registerLinkedIn } from "./tools/integrations/linkedin";
import { register as registerNotion } from "./tools/integrations/notion";
import { register as registerSlack } from "./tools/integrations/slack";
import { register as registerGitHub } from "./tools/integrations/github";
import { register as registerTrello } from "./tools/integrations/trello";
import { register as registerAirtable } from "./tools/integrations/airtable";
import { register as registerAsana } from "./tools/integrations/asana";
import { register as registerClickUp } from "./tools/integrations/clickup";
import { register as registerTodoist } from "./tools/integrations/todoist";
import { register as registerTypeform } from "./tools/integrations/typeform";
import { register as registerStripe } from "./tools/integrations/stripe";
import { register as registerHubSpot } from "./tools/integrations/hubspot";
import { register as registerJira } from "./tools/integrations/jira";
import { register as registerSalesforce } from "./tools/integrations/salesforce";
import { register as registerMonday } from "./tools/integrations/monday";
import { register as registerDropbox } from "./tools/integrations/dropbox";
import { register as registerMailchimp } from "./tools/integrations/mailchimp";
import { register as registerCalendly } from "./tools/integrations/calendly";
import { register as registerPipedrive } from "./tools/integrations/pipedrive";
import { register as registerConfluence } from "./tools/integrations/confluence";
import { register as registerZohoCRM } from "./tools/integrations/zohocrm";
import { register as registerLinear } from "./tools/integrations/linear";
import { register as registerBox } from "./tools/integrations/box";
import { register as registerBuffer } from "./tools/integrations/buffer";
import { register as registerResend } from "./tools/integrations/resend";
import { register as registerSendGrid } from "./tools/integrations/sendgrid";
import { register as registerWrike } from "./tools/integrations/wrike";
import { register as registerEventbrite } from "./tools/integrations/eventbrite";
import { register as registerBasecamp } from "./tools/integrations/basecamp";
import { register as registerChargebee } from "./tools/integrations/chargebee";
import { register as registerClockify } from "./tools/integrations/clockify";
import { register as registerQuickBooks } from "./tools/integrations/quickbooks";
import { register as registerXero } from "./tools/integrations/xero";
import { register as registerTwilio } from "./tools/integrations/twilio";
import { register as registerWhatsApp } from "./tools/integrations/whatsapp";
import { register as registerTelegram } from "./tools/integrations/telegram";
import { register as registerWordPress } from "./tools/integrations/wordpress";
import { register as registerWooCommerce } from "./tools/integrations/woocommerce";
import { register as registerSquare } from "./tools/integrations/square";
import { register as registerSentry } from "./tools/integrations/sentry";
import { register as registerPostHog } from "./tools/integrations/posthog";
import { register as registerOutlook } from "./tools/integrations/outlook";
import { register as registerMicrosoftTeams } from "./tools/integrations/microsoft_teams";
import { register as registerOneDrive } from "./tools/integrations/onedrive";
import { register as registerGoogleSlides } from "./tools/integrations/slides";
import { register as registerGoogleForms } from "./tools/integrations/forms";
import { register as registerGoogleAds } from "./tools/integrations/ads";
import { register as registerYouTube } from "./tools/integrations/youtube";
import { register as registerGoogleAnalytics } from "./tools/integrations/analytics";
import { register as registerSearchConsole } from "./tools/integrations/search_console";
import { register as registerAuth } from "./tools/auth";
import { register as registerSecrets } from "./tools/secrets";
import { register as registerGarage } from "./tools/garage";
import { register as registerChatDelivery } from "./tools/chat-delivery";
import { register as registerVoiceCall } from "./tools/voice-call";

export const id = "agent-manager";
export const name = "Agent Manager";

export function register(api: any) {
  // Apply injected config from OpenClaw (openclaw.json → plugins.entries.agent-manager.config)
  const config = api.config || {};
  const injectedKeys = Object.keys(config);
  console.log(
    `[agent-manager] register() api.config keys=[${injectedKeys.join(",")}] hasServiceSecret=${typeof config.serviceSecret === "string" && config.serviceSecret.length > 0}`,
  );
  configure({ baseUrl: config.baseUrl, serviceSecret: config.serviceSecret });

  // Install the public-Q&A guard BEFORE any sub-module registers its tools.
  // This wraps api.registerTool once so every subsequent registration is
  // automatically filtered by the ctx.messageChannel == "public-qa" check.
  // See tools/qa-guard.ts for the allowlist and rationale.
  installPublicQaGuard(api);

  // Resolve productType with the same fallback strategy as serviceSecret:
  //   1. injected config (normal path)
  //   2. ~/.openclaw/agent-manager.product-type  (hack around loader bug)
  //   3. "network_chain" default
  // This matters for prod Garage where productType must be "garage" and
  // silently defaulting to network_chain would hide garage-specific tools.
  const productFromFile = readProductTypeFile();
  const product =
    (typeof config.productType === "string" && config.productType) ||
    productFromFile ||
    "network_chain";
  console.log(
    `[agent-manager] product=${product} (source=${
      config.productType ? "api.config.productType"
        : productFromFile ? `file(~/.openclaw/agent-manager.product-type)`
        : "default"
    })`,
  );

  registerTasks(api);
  registerCron(api);
  registerContexts(api);
  registerGmailContexts(api);
  registerIntegrations(api);
  registerGmail(api);
  registerCalendar(api);
  registerSheets(api);
  registerDrive(api);
  registerDocs(api);
  registerTwitter(api);
  registerLinkedIn(api);
  registerNotion(api);
  registerSlack(api);
  registerGitHub(api);
  registerTrello(api);
  registerAirtable(api);
  registerAsana(api);
  registerClickUp(api);
  registerTodoist(api);
  registerTypeform(api);
  registerStripe(api);
  registerHubSpot(api);
  registerJira(api);
  registerSalesforce(api);
  registerMonday(api);
  registerDropbox(api);
  registerMailchimp(api);
  registerCalendly(api);
  registerPipedrive(api);
  registerConfluence(api);
  registerZohoCRM(api);
  registerLinear(api);
  registerBox(api);
  registerBuffer(api);
  registerResend(api);
  registerSendGrid(api);
  registerWrike(api);
  registerEventbrite(api);
  registerBasecamp(api);
  registerChargebee(api);
  registerClockify(api);
  registerQuickBooks(api);
  registerXero(api);
  registerTwilio(api);
  registerWhatsApp(api);
  registerTelegram(api);
  registerWordPress(api);
  registerWooCommerce(api);
  registerSquare(api);
  registerSentry(api);
  registerPostHog(api);
  registerOutlook(api);
  registerMicrosoftTeams(api);
  registerOneDrive(api);
  registerGoogleSlides(api);
  registerGoogleForms(api);
  registerGoogleAds(api);
  registerYouTube(api);
  registerGoogleAnalytics(api);
  registerSearchConsole(api);
  registerAuth(api);
  registerSecrets(api);
  registerVoiceCall(api);
  if (product === "garage") {
    registerGarage(api);
  }
  if (product === "network_chain") {
    registerChatDelivery(api);
  }

  // Internal HTTP route for backend → plugin cache invalidation. The
  // backend's IntegrationRepository fires a fire-and-forget POST to
  //   /agent-manager/refresh-integrations/<agentId>
  // immediately after assigning or unassigning an integration, so the
  // plugin's per-agent cache reflects the change on the very next model
  // attempt instead of waiting for the 5s TTL. Loopback-only by virtue
  // of the gateway binding to localhost; auth: "plugin" means the gateway
  // does not require its own token for this path.
  if (typeof api.registerHttpRoute === "function") {
    api.registerHttpRoute({
      path: "/agent-manager/refresh-integrations",
      match: "prefix",
      auth: "plugin",
      handler: async (req: any, res: any) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "text/plain");
          res.end("method not allowed");
          return true;
        }
        const url = new URL(req.url ?? "/", "http://localhost");
        const m = url.pathname.match(/\/agent-manager\/refresh-integrations\/([^/]+)\/?$/);
        if (!m) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "missing agent id in path" }));
          return true;
        }
        const agentId = decodeURIComponent(m[1]);
        triggerAgentIntegrationsRefresh(agentId);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, agentId }));
        return true;
      },
    });
  }
}

export default register;
