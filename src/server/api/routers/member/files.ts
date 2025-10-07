import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const memberFilesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // List files for the user's latest registration, falling back to unattached files
    const latestReg = await ctx.db.registration.findFirst({
      where: { userId: ctx.dbUser.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    const attachments = await ctx.db.attachment.findMany({
      where: {
        OR: [
          { registrationId: latestReg?.id ?? undefined },
          { registrationId: null },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return attachments;
  }),

  addByUrl: protectedProcedure
    .input(z.object({ url: z.string().url(), filename: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const latestReg = await ctx.db.registration.findFirst({
        where: { userId: ctx.dbUser.id },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      const attachment = await ctx.db.attachment.create({
        data: {
          registrationId: latestReg?.id ?? null,
          url: input.url,
          filename: input.filename,
          mimeType: null,
          sizeBytes: null,
        },
      });
      return attachment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.attachment.delete({ where: { id: input.id } });
      return { success: true };
    }),
});

