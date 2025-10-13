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

      // Log activity
      await ctx.db.userActivity.create({
        data: {
          userId: ctx.dbUser.id,
          title: `Uploaded file: ${input.filename}`,
          icon: "Upload",
          activity: "file_uploaded",
          metadata: {
            attachmentId: attachment.id,
            filename: input.filename,
            registrationId: latestReg?.id,
          },
        },
      });

      return attachment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const attachment = await ctx.db.attachment.findUnique({
        where: { id: input.id },
        select: { filename: true },
      });

      await ctx.db.attachment.delete({ where: { id: input.id } });

      // Log activity
      if (attachment) {
        await ctx.db.userActivity.create({
          data: {
            userId: ctx.dbUser.id,
            title: `Deleted file: ${attachment.filename}`,
            icon: "Trash2",
            activity: "file_deleted",
            metadata: {
              attachmentId: input.id,
              filename: attachment.filename,
            },
          },
        });
      }

      return { success: true };
    }),
});

