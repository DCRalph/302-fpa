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
    const files = await ctx.db.file.findMany({
      where: {
        OR: [
          { registrationId: latestReg?.id ?? undefined },
          { registrationId: null },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        registrationId: true,
        registration: {
          select: {
            id: true,
            status: true,
            conference: {
              select: {
                name: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });
    return files;
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.file.findUnique({
        where: { id: input.id },
        select: { filename: true },
      });

      await ctx.db.file.delete({ where: { id: input.id } });

      // Log activity
      if (file) {
        await Promise.all([
          logUserActivity(ctx.db, {
            userId: ctx.dbUser.id,
            title: `File deleted: ${file.filename}`,
            description: "Your file has been removed",
            icon: getActivityIcon(UserActivityType.FILE_DELETED),
            type: UserActivityType.FILE_DELETED,
            metadata: {
              attachmentId: input.id,
              filename: file.filename,
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
            title: `File deleted: ${file.filename}`,
            category: ActivityCategory.CONTENT,
            severity: ActivitySeverity.INFO,
            metadata: {
              attachmentId: input.id,
              filename: file.filename,
            },
          }),
        ]);
      }

      return { success: true };
    }),

  upload: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        mimeType: z.string().optional(),
        data: z.string(), // Base64 encoded data
        sizeBytes: z.number().max(5 * 1024 * 1024), // 5MB limit
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check file size limit
      if (input.sizeBytes > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');

      // Create file record
      const file = await ctx.db.file.create({
        data: {
          userId: ctx.dbUser.id,
          filename: input.filename,
          mimeType: input.mimeType,
          data: buffer,
          sizeBytes: input.sizeBytes,
          registrationId: null, // Will be linked later during registration
        },
      });

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `File uploaded: ${input.filename}`,
          description: "Your file has been saved and will be attached to your registration",
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.ATTACHMENT,
          entityId: file.id,
          title: `File uploaded: ${input.filename}`,
          category: ActivityCategory.CONTENT,
          severity: ActivitySeverity.INFO,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
          },
        }),
      ]);

      return {
        fileId: file.id,
        filename: file.filename,
        size: file.sizeBytes,
      };
    }),
});

