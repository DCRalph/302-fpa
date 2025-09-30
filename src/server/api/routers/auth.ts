import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { stackServerApp } from "~/stack";
import { db } from "~/server/db";

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async () => {
    const user = await stackServerApp.getUser()

    // console.log("user", user);

    let dbUser = await db.user.findUnique({
      where: {
        id: user?.id,
      },
    });

    dbUser ??= await db.user.create({
      data: {
        id: user?.id,
        name: user?.displayName,
        email: user?.primaryEmail,
        image: user?.profileImageUrl,
      },
    });

    return dbUser;
  }),
});





