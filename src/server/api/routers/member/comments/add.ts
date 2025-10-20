import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
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

export const addComment = protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1).max(2000),
        parentCommentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the post and its author
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.postId },
        select: { authorId: true, title: true },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const comment = await ctx.db.blogComment.create({
        data: {
          postId: input.postId,
          content: input.content,
          authorId: ctx.dbUser.id,
          approved: true,
          parentCommentId: input.parentCommentId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              professionalPosition: true,
            },
          },
        },
      });

      // Notify post author if someone else commented
      if (post.authorId !== ctx.dbUser.id) {
        await logUserActivity(ctx.db, {
          userId: post.authorId,
          title: "New comment on your post",
          description: `${ctx.dbUser.name ?? "Someone"} commented on "${post.title}"`,
          icon: getActivityIcon(UserActivityType.BLOG_COMMENT_RECEIVED),
          type: UserActivityType.BLOG_COMMENT_RECEIVED,
          actions: [
            {
              label: "View Comment",
              href: `/member-dashboard/community-blog/${input.postId}`,
              variant: "outline",
            },
          ],
          metadata: {
            postId: input.postId,
            postTitle: post.title,
            commentId: comment.id,
            commenterName: ctx.dbUser.name,
          },
        });
      }

      // Log app activity
      await logAppActivity(ctx.db, {
        userId: ctx.dbUser.id,
        userName: ctx.dbUser.name ?? undefined,
        userEmail: ctx.dbUser.email ?? undefined,
        type: AppActivityType.BLOG_COMMENT_CREATED,
        action: ActivityActionEnum.CREATED,
        entity: ActivityEntity.COMMENT,
        entityId: comment.id,
        title: `Comment added on post: ${post.title}`,
        category: ActivityCategory.CONTENT,
        severity: ActivitySeverity.INFO,
        metadata: {
          postId: input.postId,
          postTitle: post.title,
          commentId: comment.id,
          commentLength: input.content.length,
        },
      });

      return comment;
    });