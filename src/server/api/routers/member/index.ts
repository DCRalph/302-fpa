import { createTRPCRouter } from "~/server/api/trpc";
import { memberDashboardRouter } from "./dash";
import { memberBlogRouter } from "./blog";
import { memberRegistrationRouter } from "./registration";
import { memberFilesRouter } from "./files";
import { memberProfileRouter } from "./profile";
import { memberActivityRouter } from "./activity";

export const memberRouter = createTRPCRouter({
  dashboard: memberDashboardRouter,
  blog: memberBlogRouter,
  profile: memberProfileRouter,
  registration: memberRegistrationRouter,
  files: memberFilesRouter,
  activity: memberActivityRouter,
});