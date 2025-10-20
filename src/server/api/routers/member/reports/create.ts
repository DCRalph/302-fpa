import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { logAppActivity } from "~/server/api/lib/activity-logger";
import {
  ActivityActionEnum,
  ActivityEntity,
  AppActivityType,
  ActivityCategory,
  ActivitySeverity,
} from "~/server/api/lib/activity-logger";

export const createReport = protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["post", "comment"]),
        reason: z.string(),
        details: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {

      const report = await ctx.db.blogReport.create({
        data: {
          userId: ctx.dbUser.id,
          postId: input.type === "post" ? input.id : undefined,
          commentId: input.type === "comment" ? input.id : undefined,
          reason: input.reason,
          details: input.details,
        },
        include: {
          post: { select: { id: true, title: true, author: true } },
          comment: { select: { id: true, content: true, author: true } },
        },
      });

      // Get a friendly label for the target (post title or short comment preview)
      const targetLabel =
        report.post?.title ??
        (report.comment?.content ? `${report.comment.content.slice(0, 120)}${report.comment.content.length > 120 ? "…" : ""}` : `(${input.type})`);

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.REPORT_SUBMITTED,
        action: ActivityActionEnum.CREATED,
        entity: ActivityEntity.REPORT,
        entityId: report.postId ?? report.commentId as string | undefined,
        title: `Report submitted for ${input.type}: ${targetLabel}`,
        description: `A report has been submitted by ${ctx.dbUser.name ?? "a user"}`,
        category: ActivityCategory.CONTENT,
        severity: ActivitySeverity.WARNING,
        metadata: {
          reportId: input.id,
          postId: report.postId,
          commentId: report.commentId,
        },
      });

      return report;
    });