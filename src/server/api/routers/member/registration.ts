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
  ActivitySeverity,
  getActivityIcon,
} from "~/server/api/lib/activity-logger";
import { sendConferenceRegistrationSuccessEmail } from "~/lib/email-resend";

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
        fileId: z.string().optional(),
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

      // Link uploaded file to registration if provided
      if (input.fileId) {
        await ctx.db.file.update({
          where: { id: input.fileId },
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
          dashboardUrl: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/member-dashboard/conference-registration`,
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
          severity: ActivitySeverity.INFO,
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
          severity: ActivitySeverity.INFO,
          metadata: {
            conferenceId: reg.conferenceId,
            conferenceName: reg.conference?.name,
            registrationId: reg.id,
          },
        }),
      ]);

      return reg;
    }),
});

