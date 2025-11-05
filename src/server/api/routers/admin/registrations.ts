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
  getActivityIcon,
} from "~/server/api/lib/activity-logger";
import { sendRegistrationStatusUpdateEmail } from "~/lib/email-resend";
import { Severity } from "@prisma/client";
import { env } from "~/env";

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
          attachments: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
              sizeBytes: true,
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
              professionalPosition: true,
              professionalYears: true,
              professionalQualification: true,
              professionalSpecialisation: true,
              professionalBio: true,
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
          attachments: {
            select: {
              id: true,
              filename: true,
              mimeType: true,
              sizeBytes: true,
              createdAt: true,
            },
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

      // Send status update email
      try {
        await sendRegistrationStatusUpdateEmail({
          name: registration.user?.name ?? registration.name,
          email: registration.user?.email ?? registration.email,
          conferenceName: registration.conference?.name ?? "Conference",
          registrationId: registration.id,
          previousStatus: currentReg.status,
          newStatus: "confirmed",
          previousPaymentStatus: currentReg.paymentStatus,
          newPaymentStatus: "unpaid",
          reason: input.note,
          dashboardUrl: `${env.APP_URL ?? "http://localhost:3000"}/member-dashboard/conference-registration`,
        });
      } catch (error: unknown) {
        console.error("Failed to send registration status update email:", error instanceof Error ? error.message : String(error));
        // Don't throw error to prevent approval failure due to email issues
      }

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
        severity: Severity.GOOD,
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

      // Send status update email
      try {
        await sendRegistrationStatusUpdateEmail({
          name: registration.user?.name ?? registration.name,
          email: registration.user?.email ?? registration.email,
          conferenceName: registration.conference?.name ?? "Conference",
          registrationId: registration.id,
          previousStatus: currentReg.status,
          newStatus: "cancelled",
          reason: input.reason,
          dashboardUrl: `${env.APP_URL ?? "http://localhost:3000"}/member-dashboard/conference-registration`,
        });
      } catch (error: unknown) {
        console.error("Failed to send registration status update email:", error instanceof Error ? error.message : String(error));
        // Don't throw error to prevent denial failure due to email issues
      }

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
        severity: Severity.BAD,
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
        // Send status update email
        try {
          await sendRegistrationStatusUpdateEmail({
            name: registration.user?.name ?? registration.name,
            email: registration.user?.email ?? registration.email,
            conferenceName: registration.conference?.name ?? "Conference",
            registrationId: registration.id,
            previousStatus: currentReg.status,
            newStatus: input.status,
            previousPaymentStatus: currentReg.paymentStatus,
            newPaymentStatus: input.paymentStatus ?? currentReg.paymentStatus,
            reason: input.reason,
            dashboardUrl: `${env.APP_URL ?? "http://localhost:3000"}/member-dashboard/conference-registration`,
          });
        } catch (error: unknown) {
          console.error("Failed to send registration status update email:", error instanceof Error ? error.message : String(error));
          // Don't throw error to prevent status update failure due to email issues
        }

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
        severity: Severity.INFO,
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
        severity: Severity.INFO,
        metadata: {
          conferenceId: note.registration.conferenceId,
          conferenceName: note.registration.conference?.name,
          registrationId: input.registrationId,
          noteLength: input.note.length,
        },
      });

      return note;
    }),

  // Add manual payment to registration
  addPayment: protectedProcedure
    .input(
      z.object({
        registrationId: z.string(),
        amountCents: z.number().int().min(1),
        currency: z.string().default("FJD"),
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

      // Get registration details
      const registration = await ctx.db.registration.findUnique({
        where: { id: input.registrationId },
        include: {
          conference: {
            select: {
              name: true,
              priceCents: true,
              currency: true,
            },
          },
        },
      });

      if (!registration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Registration not found",
        });
      }

      // Create payment record
      const payment = await ctx.db.payment.create({
        data: {
          registrationId: input.registrationId,
          provider: "manual",
          amountCents: input.amountCents,
          currency: input.currency,
          status: "succeeded",
          metadata: {
            reason: input.reason,
            addedBy: ctx.dbUser.id,
            addedByName: ctx.dbUser.name,
          },
        },
      });

      // Calculate total paid amount
      const totalPaid = await ctx.db.payment.aggregate({
        where: {
          registrationId: input.registrationId,
          status: "succeeded",
        },
        _sum: {
          amountCents: true,
        },
      });

      const expectedAmount = registration.priceCents ?? registration.conference?.priceCents ?? 0;
      const totalPaidAmount = totalPaid._sum.amountCents ?? 0;

      // Update payment status based on amount paid
      let newPaymentStatus = registration.paymentStatus;
      if (totalPaidAmount >= expectedAmount && expectedAmount > 0) {
        newPaymentStatus = "paid";
      } else if (totalPaidAmount > 0) {
        newPaymentStatus = "partial";
      }

      // Update registration payment status if it changed
      if (newPaymentStatus !== registration.paymentStatus) {
        await ctx.db.registration.update({
          where: { id: input.registrationId },
          data: { paymentStatus: newPaymentStatus },
        });
      }

      // Log activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? "Admin",
        userEmail: ctx.dbUser.email ?? "",
        type: "payment_created",
        action: ActivityActionEnum.CREATED,
        entity: ActivityEntity.PAYMENT,
        entityId: payment.id,
        title: "Manual Payment Added",
        description: `Added ${input.currency} $${(input.amountCents / 100).toFixed(2)} payment for ${registration.name}`,
        category: ActivityCategory.REGISTRATION,
        severity: Severity.INFO,
        metadata: {
          registrationId: input.registrationId,
          amountCents: input.amountCents,
          currency: input.currency,
          reason: input.reason,
          conferenceId: registration.conferenceId,
          conferenceName: registration.conference?.name,
        },
      });

      return payment;
    }),

  // Delete payment from registration
  deletePayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
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

      // Get payment details
      const payment = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          registration: {
            include: {
              conference: {
                select: {
                  name: true,
                  priceCents: true,
                  currency: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      // Delete the payment
      await ctx.db.payment.delete({
        where: { id: input.paymentId },
      });

      // Recalculate total paid amount
      const totalPaid = await ctx.db.payment.aggregate({
        where: {
          registrationId: payment.registrationId,
          status: "succeeded",
        },
        _sum: {
          amountCents: true,
        },
      });

      const expectedAmount = payment.registration.priceCents ?? payment.registration.conference?.priceCents ?? 0;
      const totalPaidAmount = totalPaid._sum.amountCents ?? 0;

      // Update payment status based on remaining amount
      let newPaymentStatus = payment.registration.paymentStatus;
      if (totalPaidAmount >= expectedAmount && expectedAmount > 0) {
        newPaymentStatus = "paid";
      } else if (totalPaidAmount > 0) {
        newPaymentStatus = "partial";
      } else {
        newPaymentStatus = "unpaid";
      }

      // Update registration payment status if it changed
      if (newPaymentStatus !== payment.registration.paymentStatus) {
        await ctx.db.registration.update({
          where: { id: payment.registrationId },
          data: { paymentStatus: newPaymentStatus },
        });
      }

      // Log activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? "Admin",
        userEmail: ctx.dbUser.email ?? "",
        type: "payment_created",
        action: ActivityActionEnum.DELETED,
        entity: ActivityEntity.PAYMENT,
        entityId: input.paymentId,
        title: "Payment Deleted",
        description: `Deleted ${payment.currency} $${(payment.amountCents / 100).toFixed(2)} payment for ${payment.registration.name}`,
        category: ActivityCategory.REGISTRATION,
        severity: Severity.INFO,
        metadata: {
          paymentId: input.paymentId,
          registrationId: payment.registrationId,
          amountCents: payment.amountCents,
          currency: payment.currency,
          reason: input.reason,
          conferenceId: payment.registration.conferenceId,
          conferenceName: payment.registration.conference?.name,
        },
      });

      return { success: true };
    }),
});

