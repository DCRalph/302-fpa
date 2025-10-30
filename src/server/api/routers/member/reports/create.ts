import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { logAppActivity, logUserActivity, getActivityIcon, UserActivityType } from "~/server/api/lib/activity-logger";
import {
  ActivityActionEnum,
  ActivityEntity,
  AppActivityType,
  ActivityCategory
} from "~/server/api/lib/activity-logger";
import { Severity } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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

    // check if post or comment exists
    if (input.type === "post") {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
    }

    if (input.type === "comment") {
      const comment = await ctx.db.blogComment.findUnique({
        where: { id: input.id },
      });
      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }
    }

    // check if user has already reported this content
    const existingReport = await ctx.db.blogReport.findFirst({
      where: { userId: ctx.dbUser.id, postId: input.type === "post" ? input.id : undefined, commentId: input.type === "comment" ? input.id : undefined },
    });
    if (existingReport) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "You have already reported this content" });
    }


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
        comment: { select: { id: true, postId: true, content: true, author: true } },
      },
    });

    // Get a friendly label for the target (post title or short comment preview)
    const targetLabel =
      report.post?.title ??
      (report.comment?.content ? `${report.comment.content.slice(0, 120)}${report.comment.content.length > 120 ? "…" : ""}` : `(${input.type})`);

    // Notify the author of the reported content
    if (report.post?.author.id !== ctx.dbUser.id && report.comment?.author.id !== ctx.dbUser.id) {
      await logUserActivity(ctx.db, {
        userId: report.post?.author.id ?? report.comment?.author.id ?? "",
        title: `Your ${input.type} has been reported`,
        description: `Someone reported your ${input.type}: "${targetLabel}" for "${input.reason}".`,
        icon: getActivityIcon(UserActivityType.REPORT_RECIEVED),
        type: UserActivityType.REPORT_RECIEVED,
        actions: [
          {
            label: `View ${input.type}`,
            href: `/member-dashboard/community-blog/${report.postId ?? report.comment?.postId}`,
            variant: "outline",
          },
        ],
        metadata: {
          reportId: input.id,
          postId: report.postId,
          commentId: report.commentId,
        },
      });
    }

    // Log app activity
    await logAppActivity(ctx.db, {
      userId: ctx.dbUser.id,
      userName: ctx.dbUser.name ?? undefined,
      userEmail: ctx.dbUser.email ?? undefined,
      type: AppActivityType.REPORT_SUBMITTED,
      action: ActivityActionEnum.CREATED,
      entity: ActivityEntity.REPORT,
      entityId: report.postId ?? report.commentId as string | undefined,
      title: `A report has been submitted by ${ctx.dbUser.name ?? "a user"}`,
      description: `The ${input.type}: "${targetLabel}" by ${report.post?.author.name ?? report.comment?.author.name} was reported for "${report.reason}".`,
      category: ActivityCategory.CONTENT,
      severity: Severity.WARNING,
      metadata: {
        reportId: input.id,
        postId: report.postId,
        commentId: report.commentId,
      },
    });

    return report;
  });