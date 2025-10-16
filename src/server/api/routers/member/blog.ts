import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type Prisma } from "@prisma/client";
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

export const memberBlogRouter = createTRPCRouter({
  // Get a list of all posts that match the search query and are published
  list: protectedProcedure
    .input(
      z
        .object({
          query: z.string().optional(),
          categorySlug: z.string().optional(),
          take: z.number().min(1).max(50).default(10),
          cursor: z.string().nullish(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { query, categorySlug, take = 10, cursor } = input ?? {};

      const where: Prisma.BlogPostWhereInput = {
        AND: [
          query
            ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
                { author: { name: { contains: query, mode: "insensitive" } } },
              ],
            }
            : {},
          categorySlug
            ? { categories: { some: { category: { slug: categorySlug } } } }
            : {},
          { published: true },
        ],
      };

      const posts = await ctx.db.blogPost.findMany({
        where,
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, professionalPosition: true, image: true } },
          categories: { include: { category: true } },
          _count: { select: { comments: true, likes: true } },
        },
      });

      // Check which posts are liked by the current user
      const postIds = posts.map((p) => p.id);
      const userLikes = await ctx.db.blogPostLike.findMany({
        where: {
          userId: ctx.dbUser.id,
          postId: { in: postIds },
        },
        select: { postId: true },
      });

      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      const postsWithLikeStatus = posts.map((post) => ({
        ...post,
        isLikedByUser: likedPostIds.has(post.id),
      }));

      let nextCursor: string | undefined = undefined;
      if (postsWithLikeStatus.length > take) {
        const next = postsWithLikeStatus.pop();
        nextCursor = next?.id;
      }

      return { posts: postsWithLikeStatus, nextCursor };
    }),

  // Create a post
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        content: z.string().min(1),
        categorySlugs: z.array(z.string()).optional(),
        published: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, categorySlugs, published } = input;

      const post = await ctx.db.blogPost.create({
        data: {
          title,
          content,
          authorId: ctx.dbUser.id,
          published,
          publishedAt: published ? new Date() : null,
        },
      });

      if (categorySlugs && categorySlugs.length > 0) {
        const categories = await ctx.db.blogCategory.findMany({
          where: { slug: { in: categorySlugs } },
          select: { id: true },
        });
        if (categories.length > 0) {
          await ctx.db.blogPostCategory.createMany({
            data: categories.map((c) => ({ postId: post.id, categoryId: c.id })),
            skipDuplicates: true,
          });
        }
      }

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: published ? `Published: ${title}` : `Created draft: ${title}`,
          description: published ? "Your blog post is now live" : "Your draft has been saved",
          icon: getActivityIcon(published ? UserActivityType.BLOG_POST_PUBLISHED : UserActivityType.BLOG_POST_DRAFT_CREATED),
          type: published ? UserActivityType.BLOG_POST_PUBLISHED : UserActivityType.BLOG_POST_DRAFT_CREATED,
          actions: [
            {
              label: "View Post",
              href: `/member-dashboard/community-blog/${post.id}/edit`,
              variant: "outline",
            },
          ],
          metadata: {
            postId: post.id,
            postTitle: title,
            published,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.BLOG_POST_CREATED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.BLOG_POST,
          entityId: post.id,
          title: `Blog post created: ${title}`,
          description: published ? "Published" : "Draft",
          category: ActivityCategory.CONTENT,
          severity: ActivitySeverity.INFO,
          metadata: {
            postId: post.id,
            postTitle: title,
            published,
            categorySlugs,
          },
        }),
      ]);

      return post;
    }),

  // Get a list of the users current posts regardless if they are published or not
  myPosts: protectedProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.db.blogPost.findMany({
        where: { authorId: ctx.dbUser.id },
        orderBy: { createdAt: "desc" },
        include: {
          categories: { include: { category: true } },
          _count: { select: { comments: true, likes: true } },
        },
      });

      // Check which posts are liked by the current user
      const postIds = posts.map((p) => p.id);
      const userLikes = await ctx.db.blogPostLike.findMany({
        where: {
          userId: ctx.dbUser.id,
          postId: { in: postIds },
        },
        select: { postId: true },
      });

      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      const postsWithLikeStatus = posts.map((post) => ({
        ...post,
        isLikedByUser: likedPostIds.has(post.id),
      }));

      return postsWithLikeStatus;
    }),

  // Update member details
  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3),
        content: z.string().min(1),
        categorySlugs: z.array(z.string()).optional(),
        published: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, categorySlugs, ...updateData } = input;

      // Get the current post to check authorization
      const currentPost = await ctx.db.blogPost.findUnique({
        where: { id },
        select: { authorId: true, title: true, published: true },
      });

      if (!currentPost || currentPost.authorId !== ctx.dbUser.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this post",
        });
      }

      const post = await ctx.db.blogPost.update({
        where: { id },
        data: {
          ...updateData,
          publishedAt: updateData.published && !currentPost.published ? new Date() : undefined,
        },
      });

      // Update categories if provided
      if (categorySlugs !== undefined) {
        // Remove existing categories
        await ctx.db.blogPostCategory.deleteMany({
          where: { postId: id },
        });

        // Add new categories
        if (categorySlugs.length > 0) {
          const categories = await ctx.db.blogCategory.findMany({
            where: { slug: { in: categorySlugs } },
            select: { id: true },
          });
          if (categories.length > 0) {
            await ctx.db.blogPostCategory.createMany({
              data: categories.map((c) => ({ postId: post.id, categoryId: c.id })),
              skipDuplicates: true,
            });
          }
        }
      }

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Updated: ${input.title}`,
          description: updateData.published ? "Blog post updated" : "Draft updated",
          icon: getActivityIcon(UserActivityType.BLOG_POST_UPDATED),
          type: UserActivityType.BLOG_POST_UPDATED,
          actions: [
            {
              label: "View Post",
              href: `/member-dashboard/community-blog/${post.id}/edit`,
              variant: "outline",
            },
          ],
          metadata: {
            postId: post.id,
            postTitle: input.title,
            published: updateData.published,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.BLOG_POST_UPDATED,
          action: ActivityActionEnum.UPDATED,
          entity: ActivityEntity.BLOG_POST,
          entityId: post.id,
          title: `Blog post updated: ${input.title}`,
          description: `Updated blog post`,
          category: ActivityCategory.CONTENT,
          severity: ActivitySeverity.INFO,
          metadata: {
            postId: post.id,
            postTitle: input.title,
            published: updateData.published,
            wasPublished: currentPost.published,
            categorySlugs,
          },
        }),
      ]);

      return post;
    }),

  // Delete a post
  deletePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only allow deleting own posts
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
        select: { authorId: true, title: true },
      });
      if (!post || post.authorId !== ctx.dbUser.id) {
        throw new Error("Not authorized to delete this post");
      }

      // Delete associated categories and the post itself
      await ctx.db.blogPostCategory.deleteMany({ where: { postId: input.id } });
      await ctx.db.blogPost.delete({ where: { id: input.id } });
      
      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Deleted: ${post.title}`,
          description: "Your blog post has been deleted",
          icon: getActivityIcon(UserActivityType.BLOG_POST_DELETED),
          type: UserActivityType.BLOG_POST_DELETED,
          metadata: {
            postId: input.id,
            postTitle: post.title,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.BLOG_POST_DELETED,
          action: ActivityActionEnum.DELETED,
          entity: ActivityEntity.BLOG_POST,
          entityId: input.id,
          title: `Blog post deleted: ${post.title}`,
          category: ActivityCategory.CONTENT,
          severity: ActivitySeverity.INFO,
          metadata: {
            postId: input.id,
            postTitle: post.title,
          },
        }),
      ]);

      return { success: true };
    }),

  // Get a single post by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.blogPost.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              professionalPosition: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          likes: {
            where: {
              userId: ctx.dbUser.id,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return {
        ...post,
        isLikedByUser: post.likes.length > 0,
        likes: undefined, // Remove the likes array since we only need the count
      };
    }),

  // Add a comment to a post
  likePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already liked
      const existingLike = await ctx.db.blogPostLike.findFirst({
        where: {
          postId: input.postId,
          userId: ctx.dbUser.id,
        },
      });

      if (existingLike) {
        return { success: false, message: "Post already liked" };
      }

      await ctx.db.blogPostLike.create({
        data: {
          postId: input.postId,
          userId: ctx.dbUser.id,
        },
      });

      // Get updated like count
      const likeCount = await ctx.db.blogPostLike.count({
        where: { postId: input.postId },
      });

      return { success: true, likeCount };
    }),

  unlikePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db.blogPostLike.findFirst({
        where: {
          postId: input.postId,
          userId: ctx.dbUser.id,
        },
      });

      if (!existingLike) {
        return { success: false, message: "Post not liked" };
      }

      await ctx.db.blogPostLike.delete({
        where: { id: existingLike.id },
      });

      // Get updated like count
      const likeCount = await ctx.db.blogPostLike.count({
        where: { postId: input.postId },
      });

      return { success: true, likeCount };
    }),

  isPostLiked: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const like = await ctx.db.blogPostLike.findFirst({
        where: {
          postId: input.postId,
          userId: ctx.dbUser.id,
        },
      });

      return { isLiked: !!like };
    }),

  // Add comment
  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1).max(2000),
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
              href: `/member-dashboard/community-blog/${input.postId}/edit`,
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
    }),

  // Update comment
  updateComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {

      // Get the post and its author
      const currentComment = await ctx.db.blogComment.findUnique({
        where: { id: input.id },
        select: { authorId: true, content: true },
      });

      if (!currentComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      const comment = await ctx.db.blogComment.update({
        where: { id: input.id },
        data: {
          ...input,
        },
      });

      return comment;
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {

      // Get the comment
      const comment = await ctx.db.blogComment.findUnique({
        where: { id: input.id },
        select: { authorId: true, content: true },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      await ctx.db.blogComment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getComments: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.db.blogComment.findMany({
        where: {
          postId: input.postId,
          approved: true,
        },
        orderBy: { createdAt: "desc" },
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

      return comments;
    }),

  getCommentCount: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.blogComment.count({
        where: {
          postId: input.postId,
          approved: true,
        },
      });

      return { count };
    }),
});


