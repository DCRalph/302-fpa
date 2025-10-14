import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  logUserActivity,
  logAppActivity,
  UserActivityType,
  AppActivityType,
  ActivityActionEnum,
  ActivityEntity,
  ActivityCategory,
  ActivitySeverity,
} from "~/server/api/lib/activity-logger";

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

      // Get current member data to track changes
      const currentMember = await ctx.db.user.findUnique({
        where: { id },
        select: { name: true, email: true, role: true, emailVerified: true },
      });

      if (!currentMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      const member = await ctx.db.user.update({
        where: { id },
        data: updateData,
      });

      // Track what was updated
      const updatedFields: string[] = [];
      if (input.name !== undefined) updatedFields.push("name");
      if (input.email !== undefined) updatedFields.push("email");
      if (input.phone !== undefined) updatedFields.push("phone");
      if (input.emailVerified !== undefined) updatedFields.push("email verification");

      const roleChanged = input.role !== undefined && input.role !== currentMember.role;
      if (roleChanged) updatedFields.push("role");

      // Log activity for the member being updated if their role changed
      if (roleChanged) {
        await logUserActivity(ctx.db, {
          userId: id,
          title: `Your role was updated`,
          description: `Your role has been changed to ${input.role} by admin ${ctx.dbUser.name}`,
          icon: "Shield",
          type: UserActivityType.PROFILE_UPDATED,
          metadata: {
            previousRole: currentMember.role,
            newRole: input.role,
            updatedBy: ctx.dbUser.name,
          },
        });
      }

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: roleChanged ? AppActivityType.MEMBER_ROLE_CHANGED : AppActivityType.MEMBER_UPDATED,
        action: ActivityActionEnum.UPDATED,
        entity: ActivityEntity.USER,
        entityId: id,
        title: roleChanged
          ? `Member role changed: ${currentMember.name} (${currentMember.role} → ${input.role})`
          : `Member updated: ${member.name}`,
        description: `Admin updated member details: ${updatedFields.join(", ")}`,
        category: ActivityCategory.ADMIN,
        severity: roleChanged ? ActivitySeverity.WARNING : ActivitySeverity.INFO,
        metadata: {
          memberId: id,
          memberName: member.name,
          memberEmail: member.email,
          updatedFields,
          ...(roleChanged && {
            previousRole: currentMember.role,
            newRole: input.role,
          }),
        },
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

      // Get member details before deletion
      const memberToDelete = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: { name: true, email: true, role: true },
      });

      await ctx.db.user.delete({
        where: { id: input.id },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.MEMBER_DELETED,
        action: ActivityActionEnum.DELETED,
        entity: ActivityEntity.USER,
        entityId: input.id,
        title: `Member deleted: ${memberToDelete?.name ?? "Unknown"}`,
        description: `Admin deleted member account`,
        category: ActivityCategory.ADMIN,
        severity: ActivitySeverity.WARNING,
        metadata: {
          deletedMemberId: input.id,
          deletedMemberName: memberToDelete?.name,
          deletedMemberEmail: memberToDelete?.email,
          deletedMemberRole: memberToDelete?.role,
        },
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


