import { stackServerApp } from "~/stack";
import { db } from "~/server/db";

export async function EnsureDbUser() {
  const user = await stackServerApp.getUser()

  // console.log("user", user);

  if (!user) return;

  let dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
  });

  dbUser ??= await db.user.create({
    data: {
      id: user.id,
      name: user.displayName,
      email: user.primaryEmail,
      image: user.profileImageUrl,
    },
  });

  return null;
}