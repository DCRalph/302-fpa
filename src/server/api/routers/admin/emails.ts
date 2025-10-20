import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminEmailsRouter = createTRPCRouter({
  // Get all emails with pagination
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "to", "subject"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
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

      const { page, limit, search, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      // Build where clause for search
      const where = search
        ? {
          OR: [
            { to: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
            { from: { contains: search, mode: "insensitive" as const } },
          ],
        }
        : {};

      // Get emails with pagination
      const [emails, totalCount] = await Promise.all([
        ctx.db.emailsSent.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
          select: {
            id: true,
            to: true,
            from: true,
            subject: true,
            provider: true,
            createdAt: true,
            html: true,
            text: true,
            replyTo: true,
          },
        }),
        ctx.db.emailsSent.count({ where }),
      ]);

      return {
        emails,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Get a single email by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const email = await ctx.db.emailsSent.findUnique({
        where: { id: input.id },
      });

      if (!email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email not found",
        });
      }

      return email;
    }),

  // Get email statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.dbUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    const [
      totalEmails,
      emailsToday,
      emailsThisWeek,
      emailsThisMonth,
    ] = await Promise.all([
      ctx.db.emailsSent.count(),
      ctx.db.emailsSent.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      ctx.db.emailsSent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      ctx.db.emailsSent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalEmails,
      emailsToday,
      emailsThisWeek,
      emailsThisMonth,
    };
  }),
});
