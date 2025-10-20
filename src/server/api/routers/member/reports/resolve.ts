import { ReportAction } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { logAppActivity, AppActivityType, ActivityActionEnum, ActivityEntity, ActivityCategory, ActivitySeverity } from "~/server/api/lib/activity-logger";


export const resolveReport = protectedProcedure.input(
  z.object({
    id: z.string(),
    action: z.nativeEnum(ReportAction),
    adminNote: z.string().optional(),
  })
).mutation(async ({ ctx, input }) => {
  const report = await ctx.db.blogReport.update({
    where: { id: input.id },
    data: {
      resolvedAt: new Date(),
      resolvedById: ctx.dbUser.id,
      action: input.action,
      adminNote: input.adminNote,
    },
  });

  // Log app activity
  await logAppActivity(ctx.db, {
    userId: ctx.dbUser.id,
    userName: ctx.dbUser.name ?? undefined,
    userEmail: ctx.dbUser.email ?? undefined,
    type: AppActivityType.REPORT_RESOLVED,
    action: ActivityActionEnum.UPDATED,
    entity: ActivityEntity.REPORT,
    entityId: report.postId ?? report.commentId as string | undefined,
    title: `Report resolved with action ${input.action} and message: ${input.adminNote ?? "No note provided"}`,
    description: `A report has been resolved by Admin ${ctx.dbUser.name ?? "a user"}`,
    category: ActivityCategory.CONTENT,
    severity: ActivitySeverity.INFO,
    metadata: {
      reportId: input.id,
      postId: report.postId,
      commentId: report.commentId,
    },
  });


  return report;
});