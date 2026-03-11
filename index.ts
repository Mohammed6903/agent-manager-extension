/**
 * Agent Manager — OpenClaw plugin entry point.
 *
 * Registers all agent-manager tools with the OpenClaw Gateway.
 * Tools are namespaced by domain: tasks, cron, contexts,
 * integrations, gmail, calendar, sheets, drive, auth, secrets, and garage.
 */

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
import { register as registerAuth } from "./tools/auth";
import { register as registerSecrets } from "./tools/secrets";
import { register as registerGarage } from "./tools/garage";

export const id = "agent-manager";
export const name = "Agent Manager";

export function register(api: any) {
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
  registerAuth(api);
  registerSecrets(api);
  registerGarage(api);
}

export default register;
