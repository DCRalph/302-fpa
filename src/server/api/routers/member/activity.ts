import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const memberActivityRouter = createTRPCRouter({
  // Get user's own activities (including system-wide activities)
  getMyActivities: protectedProcedure
    .input(
      z
        .object({
          take: z.number().min(1).max(100).default(20),
          cursor: z.string().nullish(),
          includeSystem: z.boolean().default(true),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { take = 20, cursor, includeSystem = true } = input ?? {};

      const activities = await ctx.db.userActivity.findMany({
        where: {
          OR: [
            { userId: ctx.dbUser.id },
            ...(includeSystem ? [{ isSystem: true }] : []),
          ],
        },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined = undefined;
      if (activities.length > take) {
        const next = activities.pop();
        nextCursor = next?.id;
      }

      return { activities, nextCursor };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.userActivity.count({
      where: {
        OR: [
          { userId: ctx.dbUser.id },
          { isSystem: true },
        ],
        readAt: null, // If readAt is null, it's unread
      },
    });

    return { count };
  }),

  // Mark activity as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only allow marking own activities as read
      const activity = await ctx.db.userActivity.findFirst({
        where: {
          id: input.id,
          OR: [
            { userId: ctx.dbUser.id },
            { isSystem: true },
          ],
        },
      });

      if (!activity) {
        throw new Error("Activity not found");
      }

      await ctx.db.userActivity.update({
        where: { id: input.id },
        data: {
          readAt: new Date(), // Setting readAt marks it as read
        },
      });

      return { success: true };
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.userActivity.updateMany({
      where: {
        OR: [
          { userId: ctx.dbUser.id },
          { isSystem: true },
        ],
        readAt: null, // Only update unread activities
      },
      data: {
        readAt: new Date(), // Setting readAt marks them as read
      },
    });

    return { success: true };
  }),

  // Delete an activity (only own activities, not system ones)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only allow deleting own activities (not system activities)
      const activity = await ctx.db.userActivity.findFirst({
        where: {
          id: input.id,
          userId: ctx.dbUser.id,
          isSystem: false,
        },
      });

      if (!activity) {
        throw new Error("Activity not found or cannot be deleted");
      }

      await ctx.db.userActivity.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

