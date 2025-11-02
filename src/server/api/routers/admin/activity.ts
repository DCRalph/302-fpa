import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminActivityRouter = createTRPCRouter({
  // Get all app activities (admin only)
  getAll: protectedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(1000).default(50),
          search: z.string().optional(),
          type: z.string().optional(),
          entity: z.string().optional(),
          userId: z.string().optional(),
          severity: z.array(z.enum(["INFO", "WARNING", "ERROR", "CRITICAL", "GOOD", "BAD"])).optional(),
          category: z.array(z.string()).optional(),
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

      // Destructure and set defaults for pagination and filters
      const {
        page = 1,
        limit = 50,
        search,
        type,
        entity,
        userId,
        severity,
        category,
        startDate,
        endDate,
      } = input ?? {};

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Fetch activities with filters and pagination
      const [activities, total] = await Promise.all([
        ctx.db.appActivity.findMany({
          where: {
            ...(search && {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }),
            ...(type && { type }),
            ...(entity && { entity }),
            ...(userId && { userId }),
            ...(severity && severity.length > 0 && { severity: { in: severity } }),
            ...(category && category.length > 0 && { category: { in: category } }),
            ...(startDate &&
              endDate && {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }),
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        ctx.db.appActivity.count({
          where: {
            ...(search && {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }),
            ...(type && { type }),
            ...(entity && { entity }),
            ...(userId && { userId }),
            ...(severity && severity.length > 0 && { severity: { in: severity } }),
            ...(category && category.length > 0 && { category: { in: category } }),
            ...(startDate &&
              endDate && {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }),
          },
        }),
      ]);

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      // Return activities with pagination info
      return {
        activities,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        }
      };
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

