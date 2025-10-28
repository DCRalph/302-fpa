import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import { env } from "~/env";
// import {
//   logUserActivity,
//   logAppActivity,
//   UserActivityType,
//   AppActivityType,
//   ActivityActionEnum,
//   ActivityEntity,
//   ActivityCategory,
//   ActivitySeverity,
//   getActivityIcon,
// } from "~/server/api/lib/activity-logger";

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
  advanced: {
    cookies: {
      session_token: {
        name: "auth_token",
      },
    }
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token: _token }, _request) => {
      const { sendPasswordResetEmail } = await import('./email-resend');
      await sendPasswordResetEmail({
        name: user.name ?? 'User',
        email: user.email,
        resetUrl: url,
        expiresIn: '24 hours',
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true
    }
  },
  // hooks: {
  //   after: [
  //     {
  //       matcher: (ctx) => ctx.path === "/sign-up/email",
  //       handler: async (ctx) => {
  //         // Log user signup activity
  //         if (ctx.returnValue && typeof ctx.returnValue === "object" && "user" in ctx.returnValue) {
  //           const user = ctx.returnValue.user as { id: string; name?: string | null; email?: string | null };

  //           await Promise.all([
  //             logUserActivity(db, {
  //               userId: user.id,
  //               title: "Welcome to the platform!",
  //               description: "Your account has been created successfully",
  //               icon: getActivityIcon(UserActivityType.USER_SIGNED_IN),
  //               type: UserActivityType.USER_SIGNED_IN,
  //               actions: [
  //                 {
  //                   label: "Complete Profile",
  //                   href: "/onboarding",
  //                   variant: "default",
  //                 },
  //               ],
  //               metadata: {
  //                 signupMethod: "email",
  //               },
  //             }),
  //             logAppActivity(db, {
  //               userId: user.id,
  //               userName: user.name ?? undefined,
  //               userEmail: user.email ?? undefined,
  //               type: AppActivityType.USER_SIGNUP,
  //               action: ActivityActionEnum.CREATED,
  //               entity: ActivityEntity.USER,
  //               entityId: user.id,
  //               title: `New user signup: ${user.email ?? "Unknown"}`,
  //               description: "User created account via email/password",
  //               category: ActivityCategory.AUTH,
  //               severity: ActivitySeverity.INFO,
  //               metadata: {
  //                 signupMethod: "email",
  //               },
  //             }),
  //           ]);
  //         }
  //       },
  //     },
  //     {
  //       matcher: (ctx) => ctx.path === "/sign-in/email",
  //       handler: async (ctx) => {
  //         // Log user signin activity
  //         if (ctx.returnValue && typeof ctx.returnValue === "object" && "user" in ctx.returnValue) {
  //           const user = ctx.returnValue.user as { id: string; name?: string | null; email?: string | null };

  //           await Promise.all([
  //             logUserActivity(db, {
  //               userId: user.id,
  //               title: "Signed in",
  //               description: "You signed in to your account",
  //               icon: getActivityIcon(UserActivityType.USER_SIGNED_IN),
  //               type: UserActivityType.USER_SIGNED_IN,
  //               metadata: {
  //                 signinMethod: "email",
  //                 timestamp: new Date().toISOString(),
  //               },
  //             }),
  //             logAppActivity(db, {
  //               userId: user.id,
  //               userName: user.name ?? undefined,
  //               userEmail: user.email ?? undefined,
  //               type: AppActivityType.USER_SIGNIN,
  //               action: ActivityActionEnum.CREATED,
  //               entity: ActivityEntity.SESSION,
  //               entityId: user.id,
  //               title: `User signed in: ${user.email ?? "Unknown"}`,
  //               description: "User signed in via email/password",
  //               category: ActivityCategory.AUTH,
  //               severity: ActivitySeverity.INFO,
  //               metadata: {
  //                 signinMethod: "email",
  //               },
  //             }),
  //           ]);
  //         }
  //       },
  //     },
  //     {
  //       matcher: (ctx) => ctx.path === "/sign-in/social",
  //       handler: async (ctx) => {
  //         // Log social signin activity
  //         if (ctx.returnValue && typeof ctx.returnValue === "object" && "user" in ctx.returnValue) {
  //           const user = ctx.returnValue.user as { id: string; name?: string | null; email?: string | null };
  //           const provider = ctx.body && typeof ctx.body === "object" && "provider" in ctx.body
  //             ? (ctx.body.provider as string)
  //             : "social";

  //           await Promise.all([
  //             logUserActivity(db, {
  //               userId: user.id,
  //               title: "Signed in",
  //               description: `You signed in via ${provider}`,
  //               icon: getActivityIcon(UserActivityType.USER_SIGNED_IN),
  //               type: UserActivityType.USER_SIGNED_IN,
  //               metadata: {
  //                 signinMethod: provider,
  //                 timestamp: new Date().toISOString(),
  //               },
  //             }),
  //             logAppActivity(db, {
  //               userId: user.id,
  //               userName: user.name ?? undefined,
  //               userEmail: user.email ?? undefined,
  //               type: AppActivityType.USER_SIGNIN,
  //               action: ActivityActionEnum.CREATED,
  //               entity: ActivityEntity.SESSION,
  //               entityId: user.id,
  //               title: `User signed in: ${user.email ?? "Unknown"}`,
  //               description: `User signed in via ${provider}`,
  //               category: ActivityCategory.AUTH,
  //               severity: ActivitySeverity.INFO,
  //               metadata: {
  //                 signinMethod: provider,
  //               },
  //             }),
  //           ]);
  //         }
  //       },
  //     },
  //     {
  //       matcher: (ctx) => ctx.path === "/sign-out",
  //       handler: async (ctx) => {
  //         // Log user signout activity
  //         if (ctx.context.session?.userId) {
  //           const userId = ctx.context.session.userId;
  //           const user = await db.user.findUnique({
  //             where: { id: userId },
  //             select: { name: true, email: true },
  //           });

  //           await Promise.all([
  //             logUserActivity(db, {
  //               userId,
  //               title: "Signed out",
  //               description: "You signed out of your account",
  //               icon: "LogOut",
  //               type: UserActivityType.USER_SIGNED_OUT,
  //               metadata: {
  //                 timestamp: new Date().toISOString(),
  //               },
  //             }),
  //             logAppActivity(db, {
  //               userId,
  //               userName: user?.name ?? undefined,
  //               userEmail: user?.email ?? undefined,
  //               type: AppActivityType.USER_SIGNOUT,
  //               action: ActivityActionEnum.DELETED,
  //               entity: ActivityEntity.SESSION,
  //               entityId: userId,
  //               title: `User signed out: ${user?.email ?? "Unknown"}`,
  //               category: ActivityCategory.AUTH,
  //               severity: ActivitySeverity.INFO,
  //               metadata: {},
  //             }),
  //           ]);
  //         }
  //       },
  //     },
  //   ],
  // },
});