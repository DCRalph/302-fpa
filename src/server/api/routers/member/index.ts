import { createTRPCRouter } from "~/server/api/trpc";

import { memberDashboardRouter } from "./dash";

export const memberRouter = createTRPCRouter({
  dashboard: memberDashboardRouter,
});