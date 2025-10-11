import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient} from "@prisma/client";
import { env } from "~/env";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
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