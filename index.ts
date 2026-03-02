/**
 * Agent Manager — OpenClaw plugin entry point.
 *
 * Registers all agent-manager tools with the OpenClaw Gateway.
 * Tools are namespaced by domain: tasks, cron, contexts,
 * integrations, gmail/calendar/secrets, and garage.
 */

import { register as registerTasks } from "./tools/tasks";
import { register as registerCron } from "./tools/cron";
import { register as registerContexts } from "./tools/contexts";
import { register as registerIntegrations } from "./tools/integrations";
import { register as registerGmail } from "./tools/gmail";
import { register as registerGarage } from "./tools/garage";

export const id = "agent-manager";
export const name = "Agent Manager";

export function register(api: any) {
  registerTasks(api);
  registerCron(api);
  registerContexts(api);
  registerIntegrations(api);
  registerGmail(api);
  registerGarage(api);
}

export default register;
