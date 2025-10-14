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
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
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
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.ATTACHMENT,
          entityId: attachment.id,
          title: `File uploaded: ${input.filename}`,
          category: ActivityCategory.CONTENT,
          severity: ActivitySeverity.INFO,
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
            icon: getActivityIcon(UserActivityType.FILE_DELETED),
            type: UserActivityType.FILE_DELETED,
            metadata: {
              attachmentId: input.id,
              filename: attachment.filename,
            },
          }),
          logAppActivity(ctx.db, {
            userId: ctx.dbUser.id,
            userName: ctx.dbUser.name ?? undefined,
            userEmail: ctx.dbUser.email ?? undefined,
            type: AppActivityType.FILE_DELETED,
            action: ActivityActionEnum.DELETED,
            entity: ActivityEntity.ATTACHMENT,
            entityId: input.id,
            title: `File deleted: ${attachment.filename}`,
            category: ActivityCategory.CONTENT,
            severity: ActivitySeverity.INFO,
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

