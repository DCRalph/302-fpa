import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const memberRegistrationRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.finalConfirmation) {
        throw new Error("Final confirmation required");
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
          priceCents: 25000,
          currency: "FJD",
          metadata: {
            paymentMethod: input.paymentMethod,
            dietary: input.dietary ?? {},
            remits: input.remits ?? [],
          },
        },
      });

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
      });
      return reg;
    }),
});
