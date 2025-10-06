import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { auth } from "~/lib/useAuth";

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async ({ ctx }) => {
    const session = await auth.api.getSession({ headers: ctx.headers });

    if (!session) {
      return {
        session: null,
        dbUser: null,
      } as const;
    }

    const dbUser = await db.user.findFirst({
      where: { id: session.user.id },
    });

    return {
      session,
      dbUser,
    } as const;
  }),
});





