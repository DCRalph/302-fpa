import { createTRPCRouter } from "~/server/api/trpc";
import { editHomeRouter } from "./edithome";
import { adminDashboardRouter } from "./dash";
import { adminConferenceRouter } from "./conference";
import { adminRegistrationsRouter } from "./registrations";
import { adminMembersRouter } from "./members";
import { adminActivityRouter } from "./activity";
import { adminEmailsRouter } from "./emails";
import { adminFilesRouter } from "./files";

export const adminRouter = createTRPCRouter({
  editHome: editHomeRouter,
  dashboard: adminDashboardRouter,
  conference: adminConferenceRouter,
  registrations: adminRegistrationsRouter,
  members: adminMembersRouter,
  activity: adminActivityRouter,
  emails: adminEmailsRouter,
  files: adminFilesRouter,
});