import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const onboardingRouter = createTRPCRouter({
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().min(1, "Phone number is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.dbUser.id;

      // Update user with onboarding data
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          phone: input.phone,
          onboardedAt: new Date(),
        },
      });

      return {
        success: true,
        user: updatedUser,
      };
    }),

  checkOnboardingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await db.user.findUnique({
        where: { id: ctx.dbUser.id },
        select: {
          onboardedAt: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      return {
        isOnboarded: !!user?.onboardedAt,
        user,
      };
    }),
});

