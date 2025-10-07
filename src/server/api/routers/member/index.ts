import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { memberDashboardRouter } from "./dash";
import { blogRouter } from "./blog";
import { filesRouter } from "./files";
import { z } from "zod";

export const memberRouter = createTRPCRouter({
  dashboard: memberDashboardRouter,
  blog: blogRouter,
  files: filesRouter,

  registerForConference: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(3),
        school: z.string().min(1),
        registrationType: z.string().default("standard"),
        dietary: z.string().optional(),
        accommodation: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Determine price from active ticket type if any
      const ticketType = await ctx.db.ticketType.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } });

      const registration = await ctx.db.registration.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          school: input.school,
          registrationType: input.registrationType,
          dietary: input.dietary,
          accommodation: input.accommodation,
          message: input.message,
          userId: ctx.dbUser.id,
          ticketTypeId: ticketType?.id,
          priceCents: ticketType?.priceCents ?? null,
          currency: ticketType?.currency ?? "FJD",
          status: "pending",
          paymentStatus: "unpaid",
        },
      });

      // Add initial status history entry
      await ctx.db.registrationStatusHistory.create({
        data: {
          registrationId: registration.id,
          previousStatus: null,
          newStatus: "pending",
          changedById: ctx.dbUser.id,
          reason: "User submitted registration",
        },
      });

      return registration;
    }),
});