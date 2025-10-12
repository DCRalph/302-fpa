import { createTRPCRouter } from "~/server/api/trpc";
import { editHomeRouter } from "./edithome";
import { adminDashboardRouter } from "./dash";
import { adminConferenceRouter } from "./conference";
import { adminRegistrationsRouter } from "./registrations";
import { adminMembersRouter } from "./members";

export const adminRouter = createTRPCRouter({
  editHome: editHomeRouter,
  dashboard: adminDashboardRouter,
  conference: adminConferenceRouter,
  registrations: adminRegistrationsRouter,
  members: adminMembersRouter,
});