import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { stackServerApp } from "~/stack";
import { db } from "~/server/db";

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async () => {
    const stackUser = await stackServerApp.getUser()

    // console.log("user", user);

    if (!stackUser) {
      return null;
    }

    let dbUser = await db.user.findUnique({
      where: {
        id: stackUser.id,
      },
    });

    dbUser ??= await db.user.create({
      data: {
        id: stackUser.id,
        name: stackUser.displayName,
        email: stackUser.primaryEmail,
        image: stackUser.profileImageUrl,
      },
    });

    return { dbUser, stackUser };
  }),
});





