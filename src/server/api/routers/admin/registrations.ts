import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
        },
      });

      return note;
    }),
});

