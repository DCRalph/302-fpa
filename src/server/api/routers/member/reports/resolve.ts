import { ReportAction, Severity } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { logAppActivity, logUserActivity, AppActivityType, ActivityActionEnum, ActivityEntity, ActivityCategory, getActivityIcon, UserActivityType } from "~/server/api/lib/activity-logger";

export const resolveReport = protectedProcedure.input(
  z.object({
    id: z.string(),
    action: z.nativeEnum(ReportAction),
    adminNote: z.string().optional().nullable(),
  })
).mutation(async ({ ctx, input }) => {
  const report = await ctx.db.blogReport.update({
    where: { id: input.id },
    data: {
      resolvedAt: new Date(),
      resolvedById: ctx.dbUser.id,
      action: input.action,
      adminNote: input.adminNote == "" ? null : input.adminNote,
    },
    include: {
      post: { select: { id: true, title: true, author: true } },
      comment: { select: { id: true, postId: true, content: true, author: true } },
    },
  });

  // Get a friendly label for the target (post title or short comment preview)
  const targetLabel =
    report.post?.title ??
    (report.comment?.content ? `${report.comment.content.slice(0, 120)}${report.comment.content.length > 120 ? "…" : ""}` : `(${report.postId ? "post" : "comment"})`);


  // Notify the author of the reported content about the resolution
  // Determine the actual author user id (post author or comment author)
  const reportedAuthorId = report.post?.author?.id ?? report.comment?.author?.id;

  if (reportedAuthorId && reportedAuthorId !== ctx.dbUser.id && input.action === ReportAction.CONTENT_DELETED) {
    await logUserActivity(ctx.db, {
      userId: reportedAuthorId,
      title: `Your ${report.postId ? "post" : "comment"} has been marked for removal`,
      description: `An admin has found that your ${report.postId ? "post" : "comment"}: "${targetLabel}" violates community guidelines and will be deleted shortly.`,
      icon: getActivityIcon(UserActivityType.CONTENT_DELETED),
      type: UserActivityType.CONTENT_DELETED,
      metadata: {
        reportId: input.id,
        postId: report.postId,
        commentId: report.commentId,
      },
    });
  }

  // Log app activity
  // Normalize admin note for logging (treat empty string as missing)
  const adminNoteText = input.adminNote && input.adminNote.trim() !== "" ? input.adminNote.trim() : "No note provided";

  await logAppActivity(ctx.db, {
    userId: ctx.dbUser.id,
    userName: ctx.dbUser.name ?? undefined,
    userEmail: ctx.dbUser.email ?? undefined,
    type: AppActivityType.REPORT_RESOLVED,
    action: ActivityActionEnum.UPDATED,
    entity: ActivityEntity.REPORT,
    entityId: report.postId ?? report.commentId as string | undefined,
    title: `A report has been resolved by Admin ${ctx.dbUser.name ?? "a user"}`,
    description: `Report resolved with action ${input.action} and message: ${adminNoteText}`,
    category: ActivityCategory.CONTENT,
    severity: Severity.GOOD,
    metadata: {
      reportId: input.id,
      postId: report.postId,
      commentId: report.commentId,
    },
  });


  return report;

});