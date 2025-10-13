import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import { env } from "~/env";



export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  // user: {
  //   additionalFields: {
  //     role: {
  //       type: "enum",
  //       required: true,
  //       defaultValue: UserRole.USER,
  //       input: false,

  //     },
  //     onboardedAt: {
  //       type: "date",
  //       defaultValue: null,
  //     },
  //   }
  // },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});