import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { defaultRouter } from "~/server/api/routers/defualt";
import { authRouter } from "~/server/api/routers/auth";
import { homeRouter } from "~/server/api/routers/home";
import { adminRouter } from "~/server/api/routers/admin";
import { onboardingRouter } from "~/server/api/routers/onboarding";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  default: defaultRouter,
  auth: authRouter,
  home: homeRouter,
  admin: adminRouter,
  onboarding: onboardingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
