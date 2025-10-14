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
  getActivityIcon,
} from "~/server/api/lib/activity-logger";

export const adminRegistrationsRouter = createTRPCRouter({
  // Get all registrations for a conference
  getByConferenceId: protectedProcedure
    .input(z.object({ conferenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const registrations = await ctx.db.registration.findMany({
        where: { conferenceId: input.conferenceId },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: true,
          conference: {
            select: {
              name: true,
              priceCents: true,
              currency: true,
            },
          },
        },
      });

      return registrations;
    }),

  // Get a single registration with full details
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

      const registration = await ctx.db.registration.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
          conference: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              currency: true,
            },
          },
          notes: {
            include: {
              author: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          statusHistory: {
            include: {
              changedBy: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!registration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registration not found",
        });
      }

      return registration;
    }),

  // Approve a registration (set to confirmed with unpaid status)
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        note: z.string().optional(),
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

      // Get current registration
      const currentReg = await ctx.db.registration.findUnique({
        where: { id: input.id },
      });

      if (!currentReg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registration not found",
        });
      }

      // Update registration to confirmed status
      const registration = await ctx.db.registration.update({
        where: { id: input.id },
        data: {
          status: "confirmed",
          paymentStatus: "unpaid",
          statusHistory: {
            create: {
              previousStatus: currentReg.status,
              newStatus: "confirmed",
              changedById: ctx.dbUser.id,
              reason: input.note ?? "Approved by admin",
            },
          },
          ...(input.note && {
            notes: {
              create: {
                authorId: ctx.dbUser.id,
                body: input.note,
              },
            },
          }),
        },
        include: {
          conference: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Log activity for the user whose registration was approved
      if (registration.userId) {
        await logUserActivity(ctx.db, {
          userId: registration.userId,
          title: `Registration Approved!`,
          description: `Your registration for ${registration.conference?.name ?? "the conference"} has been approved`,
          icon: getActivityIcon(UserActivityType.REGISTRATION_APPROVED),
          type: UserActivityType.REGISTRATION_APPROVED,
          actions: [
            {
              label: "View Details",
              href: "/member-dashboard/conference-registration",
              variant: "default",
            },
          ],
          metadata: {
            conferenceId: registration.conferenceId,
            conferenceName: registration.conference?.name,
            registrationId: registration.id,
            approvedBy: ctx.dbUser.name,
          },
        });
      }

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.REGISTRATION_APPROVED,
        action: ActivityActionEnum.APPROVED,
        entity: ActivityEntity.REGISTRATION,
        entityId: registration.id,
        title: `Registration approved for ${registration.conference?.name ?? "conference"}`,
        description: `Admin ${ctx.dbUser.name} approved registration for ${registration.user?.name ?? registration.name}`,
        category: ActivityCategory.REGISTRATION,
        severity: ActivitySeverity.INFO,
        metadata: {
          conferenceId: registration.conferenceId,
          conferenceName: registration.conference?.name,
          registrationId: registration.id,
          userId: registration.userId,
          userName: registration.user?.name ?? registration.name,
          previousStatus: currentReg.status,
          newStatus: "confirmed",
          note: input.note,
        },
      });

      return registration;
    }),

  // Deny/Cancel a registration
  deny: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().min(1, "Reason is required"),
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

      // Get current registration
      const currentReg = await ctx.db.registration.findUnique({
        where: { id: input.id },
      });

      if (!currentReg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registration not found",
        });
      }

      // Update registration to cancelled status
      const registration = await ctx.db.registration.update({
        where: { id: input.id },
        data: {
          status: "cancelled",
          statusHistory: {
            create: {
              previousStatus: currentReg.status,
              newStatus: "cancelled",
              changedById: ctx.dbUser.id,
              reason: input.reason,
            },
          },
          notes: {
            create: {
              authorId: ctx.dbUser.id,
              body: `Registration denied: ${input.reason}`,
            },
          },
        },
        include: {
          conference: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Log activity for the user whose registration was denied
      if (registration.userId) {
        await logUserActivity(ctx.db, {
          userId: registration.userId,
          title: `Registration Denied`,
          description: `Your registration for ${registration.conference?.name ?? "the conference"} was not approved`,
          icon: getActivityIcon(UserActivityType.REGISTRATION_DENIED),
          type: UserActivityType.REGISTRATION_DENIED,
          metadata: {
            conferenceId: registration.conferenceId,
            conferenceName: registration.conference?.name,
            registrationId: registration.id,
            reason: input.reason,
          },
        });
      }

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.REGISTRATION_DENIED,
        action: ActivityActionEnum.REJECTED,
        entity: ActivityEntity.REGISTRATION,
        entityId: registration.id,
        title: `Registration denied for ${registration.conference?.name ?? "conference"}`,
        description: `Admin ${ctx.dbUser.name} denied registration for ${registration.user?.name ?? registration.name}`,
        category: ActivityCategory.REGISTRATION,
        severity: ActivitySeverity.WARNING,
        metadata: {
          conferenceId: registration.conferenceId,
          conferenceName: registration.conference?.name,
          registrationId: registration.id,
          userId: registration.userId,
          userName: registration.user?.name ?? registration.name,
          previousStatus: currentReg.status,
          newStatus: "cancelled",
          reason: input.reason,
        },
      });

      return registration;
    }),

  // Update registration status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
        paymentStatus: z.enum(["unpaid", "pending", "paid", "refunded", "partial"]).optional(),
        reason: z.string().optional(),
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

      // Get current registration
      const currentReg = await ctx.db.registration.findUnique({
        where: { id: input.id },
      });

      if (!currentReg) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registration not found",
        });
      }

      // Update registration
      const registration = await ctx.db.registration.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.paymentStatus && { paymentStatus: input.paymentStatus }),
          statusHistory: {
            create: {
              previousStatus: currentReg.status,
              newStatus: input.status,
              changedById: ctx.dbUser.id,
              reason: input.reason,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          conference: {
            select: {
              name: true,
            },
          },
        },
      });

      // Notify user if their registration status or payment status changed
      const statusChanged = currentReg.status !== input.status;
      const paymentStatusChanged = Boolean(
        input.paymentStatus && currentReg.paymentStatus !== input.paymentStatus,
      );

      if (registration.userId && (statusChanged || paymentStatusChanged)) {
        const changes: string[] = [];
        if (statusChanged) {
          changes.push(`status: ${currentReg.status} → ${input.status}`);
        }
        if (paymentStatusChanged) {
          changes.push(
            `payment: ${currentReg.paymentStatus} → ${input.paymentStatus}`,
          );
        }

        await logUserActivity(ctx.db, {
          userId: registration.userId,
          title: `Registration updated`,
          description:
            `Your registration for ${registration.conference?.name ?? "conference"} was updated` +
            (changes.length ? ` (${changes.join(", ")})` : ""),
          icon: getActivityIcon(UserActivityType.REGISTRATION_UPDATED),
          type: UserActivityType.REGISTRATION_UPDATED,
          actions: [
            {
              label: "View Details",
              href: "/member-dashboard/conference-registration",
              variant: "default",
            },
          ],
          metadata: {
            conferenceId: registration.conferenceId,
            conferenceName: registration.conference?.name,
            registrationId: registration.id,
            previousStatus: currentReg.status,
            newStatus: input.status,
            previousPaymentStatus: currentReg.paymentStatus,
            newPaymentStatus: input.paymentStatus ?? currentReg.paymentStatus,
            reason: input.reason,
          },
        });
      }

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: statusChanged
          ? AppActivityType.REGISTRATION_STATUS_CHANGED
          : AppActivityType.REGISTRATION_PAYMENT_STATUS_CHANGED,
        action: ActivityActionEnum.UPDATED,
        entity: ActivityEntity.REGISTRATION,
        entityId: registration.id,
        title: statusChanged
          ? `Registration status updated: ${currentReg.status} → ${input.status}`
          : `Registration payment updated: ${currentReg.paymentStatus} → ${input.paymentStatus}`,
        description: `Admin updated registration for ${registration.user?.name ?? registration.name}`,
        category: ActivityCategory.REGISTRATION,
        severity: ActivitySeverity.INFO,
        metadata: {
          conferenceId: registration.conferenceId,
          conferenceName: registration.conference?.name,
          registrationId: registration.id,
          userId: registration.userId,
          userName: registration.user?.name ?? registration.name,
          previousStatus: currentReg.status,
          newStatus: input.status,
          previousPaymentStatus: currentReg.paymentStatus,
          newPaymentStatus: input.paymentStatus ?? currentReg.paymentStatus,
          reason: input.reason,
        },
      });

      return registration;
    }),

  // Add a note to a registration
  addNote: protectedProcedure
    .input(
      z.object({
        registrationId: z.string(),
        note: z.string().min(1, "Note cannot be empty"),
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

      const note = await ctx.db.adminNote.create({
        data: {
          registrationId: input.registrationId,
          authorId: ctx.dbUser.id,
          body: input.note,
        },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          registration: {
            select: {
              id: true,
              name: true,
              conferenceId: true,
              conference: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.REGISTRATION_NOTE_ADDED,
        action: ActivityActionEnum.CREATED,
        entity: ActivityEntity.REGISTRATION,
        entityId: input.registrationId,
        title: `Note added to registration for ${note.registration.name}`,
        description: `Admin added note to registration`,
        category: ActivityCategory.REGISTRATION,
        severity: ActivitySeverity.INFO,
        metadata: {
          conferenceId: note.registration.conferenceId,
          conferenceName: note.registration.conference?.name,
          registrationId: input.registrationId,
          noteLength: input.note.length,
        },
      });

      return note;
    }),
});

