import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const memberBlogRouter = createTRPCRouter({
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

      const where = {
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
      } as const;

      const posts = await ctx.db.blogPost.findMany({
        where,
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          categories: { include: { category: true } },
          _count: { select: { comments: true } },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (posts.length > take) {
        const next = posts.pop();
        nextCursor = next?.id;
      }

      return { posts, nextCursor };
    }),

  create: protectedProcedure
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

      return post;
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.dbUser;
      const comment = await ctx.db.blogComment.create({
        data: {
          postId: input.postId,
          content: input.content,
          authorName: user.name ?? "Member",
          authorEmail: user.email ?? "",
          approved: true,
        },
      });
      return comment;
    }),
});

