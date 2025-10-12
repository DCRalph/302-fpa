import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminMembersRouter = createTRPCRouter({
  // Get all members
  getAll: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          role: z.enum(["USER", "ADMIN"]).optional(),
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

      const where: {
        role?: "USER" | "ADMIN";
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
        }>;
      } = {};

      if (input?.role) {
        where.role = input.role;
      }

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const members = await ctx.db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              registrations: true,
              blogPosts: true,
            },
          },
        },
      });

      return members;
    }),

  // Get a single member by ID
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

      const member = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          registrations: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              conference: {
                select: {
                  name: true,
                },
              },
            },
          },
          blogPosts: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: {
              registrations: true,
              blogPosts: true,
              sessions: true,
            },
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return member;
    }),

  // Update member details
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email").optional(),
        phone: z.string().optional(),
        role: z.enum(["USER", "ADMIN"]).optional(),
        emailVerified: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      const { id, ...updateData } = input;

      // Check if email is being changed and if it's already in use
      if (input.email) {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            email: input.email,
            id: { not: id },
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already in use by another user",
          });
        }
      }

      // Prevent user from demoting themselves from admin
      if (ctx.dbUser.id === id && input.role === "USER") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot demote yourself from admin",
        });
      }

      const member = await ctx.db.user.update({
        where: { id },
        data: updateData,
      });

      return member;
    }),

  // Delete member (soft delete - this could be enhanced)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      // Prevent user from deleting themselves
      if (ctx.dbUser.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete your own account",
        });
      }

      // Check if user has any registrations
      const userWithRegistrations = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });

      if (userWithRegistrations?._count.registrations && userWithRegistrations._count.registrations > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete user with existing registrations",
        });
      }

      await ctx.db.user.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get member statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.dbUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    const [totalMembers, totalAdmins, verifiedMembers, recentMembers] = await Promise.all([
      ctx.db.user.count({ where: { role: "USER" } }),
      ctx.db.user.count({ where: { role: "ADMIN" } }),
      ctx.db.user.count({ where: { emailVerified: true } }),
      ctx.db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalMembers,
      totalAdmins,
      verifiedMembers,
      recentMembers,
    };
  }),
});


