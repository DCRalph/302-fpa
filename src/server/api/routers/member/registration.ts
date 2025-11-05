import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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
import { sendConferenceRegistrationSuccessEmail } from "~/lib/email-resend";
import { Severity } from "@prisma/client";
import { env } from "~/env";

export const memberRegistrationRouter = createTRPCRouter({
  getLatestConference: protectedProcedure.query(async ({ ctx }) => {

    const conference = await ctx.db.conference.findFirst({
      where: {
        isActive: true,
      },
      include: { contacts: true },
      orderBy: { createdAt: "desc" },
    });

    // Return conference info along with registration status
    if (!conference) {
      return null;
    }

    return conference;
  }),

  // Get user's registration for a specific conference
  getMyRegistrationForConference: protectedProcedure
    .input(z.object({ conferenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const registration = await ctx.db.registration.findFirst({
        where: {
          userId: ctx.dbUser.id,
          conferenceId: input.conferenceId,
        },
        include: {
          conference: {
            select: {
              name: true,
              priceCents: true,
              currency: true,
              startDate: true,
              endDate: true,
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return registration;
    }),

  submit: protectedProcedure
    .input(
      z.object({
        conferenceId: z.string().min(1),
        participantName: z.string().min(1),
        school: z.string().min(1),
        email: z.string().email(),
        mobile: z.string().min(3),
        paymentMethod: z.enum(["levy", "deposit"]).default("levy"),
        dietary: z.object({
          day1: z.enum(["veg", "non-veg"]).optional(),
          day2Conference: z.enum(["veg", "non-veg"]).optional(),
          day2Closing: z.enum(["veg", "non-veg"]).optional(),
        }).optional(),
        remits: z.array(z.string().min(1)).max(2).optional(),
        finalConfirmation: z.boolean(),
        fileIds: z.array(z.string()).max(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.finalConfirmation) {
        throw new Error("Final confirmation required");
      }

      // Get the conference to use its price
      const conference = await ctx.db.conference.findUnique({
        where: { id: input.conferenceId },
      });

      if (!conference) {
        throw new Error("Conference not found");
      }

      // Check if conference is active
      if (!conference.isActive) {
        throw new Error("This conference is no longer active");
      }

      // Check if registration is open
      const now = new Date();
      if (now < conference.registrationStartDate) {
        throw new Error("Registration has not yet opened for this conference");
      }
      if (now > conference.registrationEndDate) {
        throw new Error("Registration has closed for this conference");
      }

      // Check if user already has a registration for this conference
      const existingRegistration = await ctx.db.registration.findFirst({
        where: {
          userId: ctx.dbUser.id,
          conferenceId: input.conferenceId,
          status: { not: "cancelled" }, // Allow re-registration if previous was cancelled
        },
      });

      if (existingRegistration) {
        throw new Error(
          "You have already registered for this conference. Please check your registration status."
        );
      }

      // Check capacity if limited
      if (conference.maxRegistrations > 0) {
        const confirmedCount = await ctx.db.registration.count({
          where: {
            conferenceId: input.conferenceId,
            status: "confirmed",
          },
        });

        if (confirmedCount >= conference.maxRegistrations) {
          throw new Error("This conference has reached maximum capacity");
        }
      }

      const registration = await ctx.db.registration.create({
        data: {
          name: input.participantName,
          school: input.school,
          email: input.email,
          phone: input.mobile,
          position: "Member",
          experience: "",
          registrationType: "standard",
          status: "pending",
          paymentStatus: "unpaid",
          userId: ctx.dbUser.id,
          conferenceId: input.conferenceId,
          priceCents: conference.priceCents,
          currency: conference.currency,
          metadata: {
            paymentMethod: input.paymentMethod,
            dietary: input.dietary ?? {},
            remits: input.remits ?? [],
          },
        },
      });

      // Link uploaded files to registration if provided
      if (input.fileIds && input.fileIds.length > 0) {
        await ctx.db.file.updateMany({
          where: { id: { in: input.fileIds } },
          data: { registrationId: registration.id },
        });
      }

      // Send registration success email
      try {
        const conferenceDate = conference.startDate && conference.endDate
          ? `${new Date(conference.startDate).toLocaleDateString()} - ${new Date(conference.endDate).toLocaleDateString()}`
          : 'TBA';

        await sendConferenceRegistrationSuccessEmail({
          name: input.participantName,
          email: input.email,
          conferenceName: conference.name,
          conferenceDate,
          conferenceLocation: conference.location ?? 'TBA',
          registrationId: registration.id,
          paymentMethod: input.paymentMethod,
          dashboardUrl: `${env.APP_URL ?? "http://localhost:3000"}/member-dashboard/conference-registration`,
        });
      } catch (error: unknown) {
        console.error("Failed to send registration success email:", error instanceof Error ? error.message : String(error));
        // Don't throw error to prevent registration failure due to email issues
      }

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Registered for ${conference.name}`,
          description: "Your registration is pending approval",
          icon: getActivityIcon(UserActivityType.CONFERENCE_REGISTRATION_SUBMITTED),
          type: UserActivityType.CONFERENCE_REGISTRATION_SUBMITTED,
          actions: [
            {
              label: "View Registration",
              href: "/member-dashboard/conference-registration",
              variant: "default",
            },
          ],
          metadata: {
            conferenceId: conference.id,
            conferenceName: conference.name,
            registrationId: registration.id,
            status: "pending",
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.REGISTRATION_SUBMITTED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.REGISTRATION,
          entityId: registration.id,
          title: `Registration submitted for ${conference.name}`,
          description: `${ctx.dbUser.name ?? input.participantName} registered for ${conference.name}`,
          category: ActivityCategory.REGISTRATION,
          severity: Severity.INFO,
          metadata: {
            conferenceId: conference.id,
            conferenceName: conference.name,
            registrationId: registration.id,
            paymentMethod: input.paymentMethod,
          },
        }),
      ]);

      return { success: true, registration };
    }),

  getMyLatest: protectedProcedure.query(async ({ ctx }) => {
    const reg = await ctx.db.registration.findFirst({
      where: { userId: ctx.dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { ticketType: true, payments: true },
    });
    return reg;
  }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reg = await ctx.db.registration.update({
        where: { id: input.id },
        data: { status: "cancelled" },
        include: {
          conference: {
            select: { name: true },
          },
        },
      });

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Cancelled registration for ${reg.conference?.name ?? "conference"}`,
          description: "Your registration has been cancelled",
          icon: getActivityIcon(UserActivityType.CONFERENCE_REGISTRATION_CANCELLED),
          type: UserActivityType.CONFERENCE_REGISTRATION_CANCELLED,
          metadata: {
            conferenceId: reg.conferenceId,
            conferenceName: reg.conference?.name,
            registrationId: reg.id,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.REGISTRATION_CANCELLED,
          action: ActivityActionEnum.CANCELLED,
          entity: ActivityEntity.REGISTRATION,
          entityId: reg.id,
          title: `Registration cancelled for ${reg.conference?.name ?? "conference"}`,
          category: ActivityCategory.REGISTRATION,
          severity: Severity.INFO,
          metadata: {
            conferenceId: reg.conferenceId,
            conferenceName: reg.conference?.name,
            registrationId: reg.id,
          },
        }),
      ]);

      return reg;
    }),

  addFiles: protectedProcedure
    .input(z.object({
      registrationId: z.string(),
      fileIds: z.array(z.string()).max(3)
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the registration belongs to the user
      const registration = await ctx.db.registration.findFirst({
        where: {
          id: input.registrationId,
          userId: ctx.dbUser.id,
        },
        include: {
          conference: {
            select: { name: true }
          }
        }
      });

      if (!registration) {
        throw new Error("Registration not found or access denied");
      }

      // Check if registration is still active (not cancelled)
      if (registration.status === "cancelled") {
        throw new Error("Cannot add files to a cancelled registration");
      }

      // Get current file count for this registration
      const currentFileCount = await ctx.db.file.count({
        where: { registrationId: input.registrationId }
      });

      if (currentFileCount + input.fileIds.length > 3) {
        throw new Error("Maximum 3 files allowed per registration");
      }

      // Link the files to the registration
      await ctx.db.file.updateMany({
        where: {
          id: { in: input.fileIds },
          userId: ctx.dbUser.id, // Ensure user owns the files
        },
        data: { registrationId: input.registrationId },
      });

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Added files to ${registration.conference?.name ?? "conference"} registration`,
          description: `${input.fileIds.length} file(s) added to your registration`,
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
          metadata: {
            registrationId: input.registrationId,
            fileCount: input.fileIds.length,
            fileIds: input.fileIds,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.ATTACHMENT,
          entityId: input.registrationId,
          title: `Files added to registration`,
          description: `${ctx.dbUser.name ?? "User"} added ${input.fileIds.length} file(s) to their registration`,
          category: ActivityCategory.CONTENT,
          severity: Severity.INFO,
          metadata: {
            registrationId: input.registrationId,
            fileCount: input.fileIds.length,
            fileIds: input.fileIds,
          },
        }),
      ]);

      return { success: true, fileCount: input.fileIds.length };
    }),

  getRegistrationFiles: protectedProcedure
    .input(z.object({ registrationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the registration belongs to the user
      const registration = await ctx.db.registration.findFirst({
        where: {
          id: input.registrationId,
          userId: ctx.dbUser.id,
        },
      });

      if (!registration) {
        throw new Error("Registration not found or access denied");
      }

      // Get files for this registration
      const files = await ctx.db.file.findMany({
        where: { registrationId: input.registrationId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          filename: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      });

      return files;
    }),
});

