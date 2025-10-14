import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { logUserActivity, logAppActivity } from "~/server/api/lib/activity-logger";

export const onboardingRouter = createTRPCRouter({
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().min(1, "Phone number is required"),
        school: z.string().min(1, "School is required"),
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
          school: input.school,
          onboardedAt: new Date(),
        },
      });

      // Log activity
      await Promise.all([
        logUserActivity(db, {
          userId,
          title: "Welcome to the community!",
          description: "Your account setup is complete",
          icon: "UserCheck",
          type: "onboarding_completed",
          actions: [
            {
              label: "Explore Dashboard",
              href: "/member-dashboard",
              variant: "default",
            },
          ],
          metadata: {
            name: input.name,
            school: input.school,
          },
        }),
        logAppActivity(db, {
          userId,
          userName: input.name,
          userEmail: ctx.dbUser.email ?? undefined,
          type: "user_onboarded",
          action: "updated",
          entity: "user",
          entityId: userId,
          title: `User completed onboarding: ${input.name}`,
          category: "auth",
          severity: "info",
          metadata: {
            name: input.name,
            school: input.school,
          },
        }),
      ]);

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
          school: true,
        },
      });

      return {
        isOnboarded: !!user?.onboardedAt,
        user,
      };
    }),
});

