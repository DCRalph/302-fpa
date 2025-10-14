import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminActivityRouter = createTRPCRouter({
  // Get all app activities (admin only)
  getAll: protectedProcedure
    .input(
      z
        .object({
          take: z.number().min(1).max(100).default(50),
          cursor: z.string().nullish(),
          type: z.string().optional(),
          entity: z.string().optional(),
          userId: z.string().optional(),
          severity: z.enum(["info", "warning", "error", "critical"]).optional(),
          category: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const {
        take = 50,
        cursor,
        type,
        entity,
        userId,
        severity,
        category,
        startDate,
        endDate,
      } = input ?? {};

      const activities = await ctx.db.appActivity.findMany({
        where: {
          ...(type && { type }),
          ...(entity && { entity }),
          ...(userId && { userId }),
          ...(severity && { severity }),
          ...(category && { category }),
          ...(startDate &&
            endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
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

  // Get activity stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.dbUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalToday, totalThisWeek, byCategory, bySeverity] = await Promise.all([
      ctx.db.appActivity.count({
        where: {
          createdAt: { gte: dayAgo },
        },
      }),
      ctx.db.appActivity.count({
        where: {
          createdAt: { gte: weekAgo },
        },
      }),
      ctx.db.appActivity.groupBy({
        by: ["category"],
        _count: true,
        where: {
          createdAt: { gte: weekAgo },
        },
        orderBy: {
          _count: {
            category: "desc",
          },
        },
        take: 10,
      }),
      ctx.db.appActivity.groupBy({
        by: ["severity"],
        _count: true,
        where: {
          createdAt: { gte: weekAgo },
        },
      }),
    ]);

    return {
      totalToday,
      totalThisWeek,
      byCategory,
      bySeverity,
    };
  }),

  // Get activities by entity
  getByEntity: protectedProcedure
    .input(
      z.object({
        entity: z.string(),
        entityId: z.string(),
        take: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const activities = await ctx.db.appActivity.findMany({
        where: {
          entity: input.entity,
          entityId: input.entityId,
        },
        take: input.take,
        orderBy: { createdAt: "desc" },
      });

      return activities;
    }),

  // Get activities by user
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        take: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const activities = await ctx.db.appActivity.findMany({
        where: {
          userId: input.userId,
        },
        take: input.take,
        orderBy: { createdAt: "desc" },
      });

      return activities;
    }),
});

