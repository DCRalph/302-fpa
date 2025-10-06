import { createTRPCRouter } from "~/server/api/trpc";
import { editHomeRouter } from "./edithome";
import { adminDashboardRouter } from "./dash";

export const adminRouter = createTRPCRouter({
  editHome: editHomeRouter,
  dashboard: adminDashboardRouter,
});