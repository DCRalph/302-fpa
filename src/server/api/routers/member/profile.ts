import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { auth } from "~/lib/auth";

export const memberProfileRouter = createTRPCRouter({
  // Fetch current user's profile and linked accounts
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.dbUser.id;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        school: true,
        professionalPosition: true,
        professionalYears: true,
        professionalQualification: true,
        professionalSpecialisation: true,
        professionalBio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const accounts = await ctx.db.account.findMany({
      where: { userId },
      select: { id: true, providerId: true, accountId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return { user, accounts };
  }),

  // Update profile fields on the User model
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional().nullable(),
        school: z.string().optional().nullable(),
        professionalPosition: z.string().optional().nullable(),
        professionalYears: z.string().optional().nullable(),
        professionalQualification: z.string().optional().nullable(),
        professionalSpecialisation: z.string().optional().nullable(),
        professionalBio: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.dbUser.id;

      // If email is being changed, ensure it's not already used by another user
      if (input.email) {
        const existing = await ctx.db.user.findFirst({
          where: { email: input.email, id: { not: userId } },
        });
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
        }
      }

      const updated = await ctx.db.user.update({
        where: { id: userId },
        data: {
          name: input.name ?? undefined,
          email: input.email ?? undefined,
          phone: input.phone ?? undefined,
          school: input.school ?? undefined,
          professionalPosition: input.professionalPosition == "" ? null : input.professionalPosition,
          professionalYears: input.professionalYears == "" ? null : parseInt(input.professionalYears ?? "0"),
          professionalQualification: input.professionalQualification ?? undefined,
          professionalSpecialisation: input.professionalSpecialisation ?? undefined,
          professionalBio: input.professionalBio ?? undefined,
          image: input.image ?? undefined,
        },
      });

      // Determine what was updated for activity title
      const updatedFields = [];
      if (input.name !== undefined) updatedFields.push("name");
      if (input.email !== undefined) updatedFields.push("email");
      if (input.phone !== undefined) updatedFields.push("phone");
      if (input.school !== undefined) updatedFields.push("school");
      if (input.professionalPosition !== undefined) updatedFields.push("position");
      if (input.professionalYears !== undefined) updatedFields.push("experience");
      if (input.professionalQualification !== undefined) updatedFields.push("qualification");
      if (input.professionalSpecialisation !== undefined) updatedFields.push("specialisation");
      if (input.professionalBio !== undefined) updatedFields.push("bio");
      if (input.image !== undefined) updatedFields.push("profile image");

      // Log activity
      await ctx.db.userActivity.create({
        data: {
          userId: ctx.dbUser.id,
          title: `Updated profile: ${updatedFields.join(", ")}`,
          icon: "UserCog",
          activity: "profile_updated",
          metadata: {
            updatedFields,
          },
        },
      });

      return updated;
    }),

  // Change password using the Better Auth API (delegates hashing & session handling)
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // better-auth exposes an API handler we can call server-side. It expects the
        // current request headers so it can authenticate the user session.
        const res = await auth.api.changePassword({
          headers: ctx.headers,
          body: {
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
          },
        });

        // Log activity
        await ctx.db.userActivity.create({
          data: {
            userId: ctx.dbUser.id,
            title: "Changed password",
            icon: "Lock",
            activity: "password_changed",
            metadata: {},
          },
        });

        return res;
      } catch (err) {
        throw new TRPCError({ code: "BAD_REQUEST", message: (err as { message?: string })?.message ?? "Failed to change password" });
      }
    }),

  // Return connected auth accounts for the user
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.dbUser.id;
    const accounts = await ctx.db.account.findMany({
      where: { userId },
      select: { id: true, providerId: true, accountId: true, createdAt: true },
    });
    return accounts;
  }),
});
