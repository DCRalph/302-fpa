import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  logSystemActivityForAll,
  logAppActivity,
  UserActivityType,
  AppActivityType,
  ActivityActionEnum,
  ActivityEntity,
  ActivityCategory,
  getActivityIcon,
} from "~/server/api/lib/activity-logger";
import { Severity } from "@prisma/client";

export const adminConferenceRouter = createTRPCRouter({
  // Get all conferences ordered by creation date (latest first)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.dbUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    const conferences = await ctx.db.conference.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        contacts: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    return conferences;
  }),

  // Get a single conference by ID
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

      const conference = await ctx.db.conference.findUnique({
        where: { id: input.id },
        include: {
          contacts: true,
          _count: {
            select: { registrations: true },
          },
        },
      });

      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      return conference;
    }),

  // Create a new conference
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        location: z.string().min(1, "Location is required"),
        startDate: z.date(),
        endDate: z.date(),
        registrationStartDate: z.date(),
        registrationEndDate: z.date(),
        priceCents: z.number().int().min(0),
        currency: z.string().default("FJD"),
        bankTransferAccountName: z.string().min(1, "Account name is required"),
        bankTransferBranch: z.string().min(1, "Branch is required"),
        bankTransferAccountNumber: z.string().min(1, "Account number is required"),
        maxRegistrations: z.number().int().min(0).default(0),
        isActive: z.boolean().default(true),
        contacts: z.array(
          z.object({
            name: z.string().min(1),
            email: z.string().optional(),
            phone: z.string().optional(),
            school: z.string().optional(),
          })
        ).optional().default([]),
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

      // Validate dates
      if (input.endDate < input.startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      if (input.registrationEndDate < input.registrationStartDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Registration end date must be after registration start date",
        });
      }

      const { contacts, ...conferenceData } = input;

      const conference = await ctx.db.conference.create({
        data: {
          ...conferenceData,
          contacts: {
            create: contacts.map((contact) => ({
              name: contact.name,
              fields: {
                email: contact.email,
                phone: contact.phone,
                school: contact.school,
              },
            })),
          },
        },
        include: {
          contacts: true,
        },
      });

      // Log system activity (visible to all users)
      await logSystemActivityForAll(ctx.db, {
        title: `New Conference: ${input.name}`,
        description: `${input.name} has been announced! Registration opens ${input.registrationStartDate.toLocaleDateString()}`,
        icon: getActivityIcon(UserActivityType.CONFERENCE_ANNOUNCED),
        type: UserActivityType.CONFERENCE_ANNOUNCED,
        actions: [
          {
            label: "View Details",
            href: "/member-dashboard/conference-registration",
            variant: "default",
          },
        ],
        metadata: {
          conferenceId: conference.id,
          conferenceName: input.name,
          startDate: input.startDate.toISOString(),
          endDate: input.endDate.toISOString(),
          location: input.location,
        },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.CONFERENCE_CREATED,
        action: ActivityActionEnum.CREATED,
        entity: ActivityEntity.CONFERENCE,
        entityId: conference.id,
        title: `Conference created: ${input.name}`,
        description: `Admin ${ctx.dbUser.name} created a new conference`,
        category: ActivityCategory.CONFERENCE,
        severity: Severity.INFO,
        metadata: {
          conferenceId: conference.id,
          conferenceName: input.name,
          startDate: input.startDate.toISOString(),
          endDate: input.endDate.toISOString(),
          location: input.location,
          priceCents: input.priceCents,
        },
      });

      return conference;
    }),

  // Update a conference
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        location: z.string().min(1, "Location is required").optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        registrationStartDate: z.date().optional(),
        registrationEndDate: z.date().optional(),
        priceCents: z.number().int().min(0).optional(),
        currency: z.string().optional(),
        bankTransferAccountName: z.string().min(1, "Account name is required").optional(),
        bankTransferBranch: z.string().min(1, "Branch is required").optional(),
        bankTransferAccountNumber: z.string().min(1, "Account number is required").optional(),
        maxRegistrations: z.number().int().min(0).optional(),
        isActive: z.boolean().optional(),
        contacts: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string().min(1),
            email: z.string().optional(),
            phone: z.string().optional(),
            school: z.string().optional(),
          })
        ).optional(),
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

      const { id, contacts, ...conferenceData } = input;

      // Validate dates if both are provided
      if (conferenceData.startDate && conferenceData.endDate) {
        if (conferenceData.endDate < conferenceData.startDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End date must be after start date",
          });
        }
      }

      if (conferenceData.registrationStartDate && conferenceData.registrationEndDate) {
        if (conferenceData.registrationEndDate < conferenceData.registrationStartDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Registration end date must be after registration start date",
          });
        }
      }

      // If contacts are provided, delete existing and create new ones
      if (contacts !== undefined) {
        await ctx.db.conferenceContact.deleteMany({
          where: { conferenceId: id },
        });
      }

      const conference = await ctx.db.conference.update({
        where: { id },
        data: {
          ...conferenceData,
          ...(contacts !== undefined && {
            contacts: {
              create: contacts.map((contact) => ({
                name: contact.name,
                fields: {
                  email: contact.email,
                  phone: contact.phone,
                  school: contact.school,
                },
              })),
            },
          }),
        },
        include: {
          contacts: true,
        },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.CONFERENCE_UPDATED,
        action: ActivityActionEnum.UPDATED,
        entity: ActivityEntity.CONFERENCE,
        entityId: conference.id,
        title: `Conference updated: ${conference.name}`,
        description: `Admin ${ctx.dbUser.name} updated conference details`,
        category: ActivityCategory.CONFERENCE,
        severity: Severity.INFO,
        metadata: {
          conferenceId: conference.id,
          conferenceName: conference.name,
          updatedFields: Object.keys(conferenceData),
        },
      });

      return conference;
    }),

  // Delete a conference (soft delete by setting isActive to false)
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

      const conference = await ctx.db.conference.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.CONFERENCE_DEACTIVATED,
        action: ActivityActionEnum.UPDATED,
        entity: ActivityEntity.CONFERENCE,
        entityId: conference.id,
        title: `Conference deactivated: ${conference.name}`,
        description: `Admin ${ctx.dbUser.name} deactivated the conference`,
        category: ActivityCategory.CONFERENCE,
        severity: Severity.WARNING,
        metadata: {
          conferenceId: conference.id,
          conferenceName: conference.name,
        },
      });

      return conference;
    }),

  // Toggle active status
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      const conference = await ctx.db.conference.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: input.isActive ? AppActivityType.CONFERENCE_ACTIVATED : AppActivityType.CONFERENCE_DEACTIVATED,
        action: ActivityActionEnum.UPDATED,
        entity: ActivityEntity.CONFERENCE,
        entityId: conference.id,
        title: `Conference ${input.isActive ? "activated" : "deactivated"}: ${conference.name}`,
        description: `Admin ${ctx.dbUser.name} ${input.isActive ? "activated" : "deactivated"} the conference`,
        category: ActivityCategory.CONFERENCE,
        severity: input.isActive ? Severity.INFO : Severity.WARNING,
        metadata: {
          conferenceId: conference.id,
          conferenceName: conference.name,
          isActive: input.isActive,
        },
      });

      return conference;
    }),
});

