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
} from "~/server/api/lib/activity-logger";
import { Severity } from "@prisma/client";

export const adminMembersRouter = createTRPCRouter({
  // Get all members
  getAll: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          role: z.enum(["USER", "ADMIN"]).optional(),
          approved: z.boolean().optional(), // Filter by approval status
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
        signUpApprovedAt?: { not: null } | null;
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          email?: { contains: string; mode: "insensitive" };
        }>;
      } = {};

      if (input?.role) {
        where.role = input.role;
      }

      // Filter by approval status
      if (input?.approved !== undefined) {
        if (input.approved) {
          where.signUpApprovedAt = { not: null };
        } else {
          where.signUpApprovedAt = null;
        }
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
        severity: roleChanged ? Severity.WARNING : Severity.INFO,
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
        severity: Severity.WARNING,
        metadata: {
          deletedMemberId: input.id,
          deletedMemberName: memberToDelete?.name,
          deletedMemberEmail: memberToDelete?.email,
          deletedMemberRole: memberToDelete?.role,
        },
      });

      return { success: true };
    }),

  // Approve user signup
  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      // Get member details before approval
      const memberToApprove = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: { name: true, email: true, signUpApprovedAt: true },
      });

      if (!memberToApprove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      if (memberToApprove.signUpApprovedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already approved",
        });
      }

      const member = await ctx.db.user.update({
        where: { id: input.id },
        data: { signUpApprovedAt: new Date() },
      });

      // Log user activity for the approved member
      await logUserActivity(ctx.db, {
        userId: input.id,
        title: `Account approved`,
        description: `Your account has been approved by an administrator. You can now access all platform features.`,
        icon: "CheckCircle",
        type: UserActivityType.PROFILE_UPDATED,
        metadata: {
          approvedBy: ctx.dbUser.name,
          approvedAt: new Date().toISOString(),
        },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.MEMBER_UPDATED,
        action: ActivityActionEnum.APPROVED,
        entity: ActivityEntity.USER,
        entityId: input.id,
        title: `Member signup approved: ${memberToApprove.name ?? "Unknown"}`,
        description: `Admin approved member signup`,
        category: ActivityCategory.ADMIN,
        severity: Severity.GOOD,
        metadata: {
          memberId: input.id,
          memberName: memberToApprove.name,
          memberEmail: memberToApprove.email,
        },
      });

      return member;
    }),

  // Unapprove user signup
  unapprove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      // Prevent user from unapproving themselves
      // if (ctx.dbUser.id === input.id) {
      //   throw new TRPCError({
      //     code: "BAD_REQUEST",
      //     message: "You cannot unapprove your own account",
      //   });
      // }

      // Get member details before unapproval
      const memberToUnapprove = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: { name: true, email: true, signUpApprovedAt: true },
      });

      if (!memberToUnapprove) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      if (!memberToUnapprove.signUpApprovedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not approved",
        });
      }

      const member = await ctx.db.user.update({
        where: { id: input.id },
        data: { signUpApprovedAt: null },
      });

      // Log user activity for the unapproved member
      await logUserActivity(ctx.db, {
        userId: input.id,
        title: `Account access revoked`,
        description: `Your account approval has been revoked by an administrator. You will no longer be able to access platform features until re-approved.`,
        icon: "XCircle",
        type: UserActivityType.PROFILE_UPDATED,
        metadata: {
          unapprovedBy: ctx.dbUser.name,
          unapprovedAt: new Date().toISOString(),
        },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.MEMBER_UPDATED,
        action: ActivityActionEnum.REJECTED,
        entity: ActivityEntity.USER,
        entityId: input.id,
        title: `Member signup unapproved: ${memberToUnapprove.name ?? "Unknown"}`,
        description: `Admin revoked member signup approval`,
        category: ActivityCategory.ADMIN,
        severity: Severity.WARNING,
        metadata: {
          memberId: input.id,
          memberName: memberToUnapprove.name,
          memberEmail: memberToUnapprove.email,
        },
      });

      return member;
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

    const [totalMembers, totalAdmins, verifiedMembers, recentMembers, unapprovedMembers] = await Promise.all([
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
      ctx.db.user.count({ where: { signUpApprovedAt: null } }),
    ]);

    return {
      totalMembers,
      totalAdmins,
      verifiedMembers,
      recentMembers,
      unapprovedMembers,
    };
  }),
});


