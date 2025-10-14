import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { logUserActivity, logAppActivity } from "~/server/api/lib/activity-logger";

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
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `File uploaded: ${input.filename}`,
          description: "Your file has been saved",
          icon: "Upload",
          type: "file_uploaded",
          metadata: {
            attachmentId: attachment.id,
            filename: input.filename,
            registrationId: latestReg?.id,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: "file_uploaded",
          action: "created",
          entity: "attachment",
          entityId: attachment.id,
          title: `File uploaded: ${input.filename}`,
          category: "file",
          severity: "info",
          metadata: {
            attachmentId: attachment.id,
            filename: input.filename,
            registrationId: latestReg?.id,
          },
        }),
      ]);

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
        await Promise.all([
          logUserActivity(ctx.db, {
            userId: ctx.dbUser.id,
            title: `File deleted: ${attachment.filename}`,
            description: "Your file has been removed",
            icon: "Trash2",
            type: "file_deleted",
            metadata: {
              attachmentId: input.id,
              filename: attachment.filename,
            },
          }),
          logAppActivity(ctx.db, {
            userId: ctx.dbUser.id,
            userName: ctx.dbUser.name ?? undefined,
            userEmail: ctx.dbUser.email ?? undefined,
            type: "file_deleted",
            action: "deleted",
            entity: "attachment",
            entityId: input.id,
            title: `File deleted: ${attachment.filename}`,
            category: "file",
            severity: "info",
            metadata: {
              attachmentId: input.id,
              filename: attachment.filename,
            },
          }),
        ]);
      }

      return { success: true };
    }),
});

