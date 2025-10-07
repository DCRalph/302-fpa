import { createTRPCRouter } from "~/server/api/trpc";
import { memberDashboardRouter } from "./dash";
import { memberBlogRouter } from "./blog";
import { memberRegistrationRouter } from "./registration";
import { memberFilesRouter } from "./files";

export const memberRouter = createTRPCRouter({
  dashboard: memberDashboardRouter,
  blog: memberBlogRouter,
  registration: memberRegistrationRouter,
  files: memberFilesRouter,
});