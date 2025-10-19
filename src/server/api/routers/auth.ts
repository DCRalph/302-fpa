import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { auth } from "~/lib/auth";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input;

      try {
        // Use Better Auth's native password reset functionality
        await auth.api.requestPasswordReset({
          body: {
            email,
            redirectTo: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/reset-password`,
          },
        });

        return { success: true, message: "A password reset link has been sent to your email address." };
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send password reset email',
        });
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }))
    .mutation(async ({ input }) => {
      const { token, password } = input;

      try {
        // Use Better Auth's native password reset functionality
        await auth.api.resetPassword({
          body: {
            newPassword: password,
            token,
          },
        });

        return { success: true, message: 'Password has been reset successfully' };
      } catch (error) {
        console.error('Failed to reset password:', error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        });
      }
    }),

});





