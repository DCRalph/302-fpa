import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const blogRouter = createTRPCRouter({
  listPosts: protectedProcedure
    .input(
      z
        .object({
          q: z.string().optional(),
          filter: z.string().optional(), // category slug
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(50).default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      const where = {
        published: true,
        AND: [
          input?.q
            ? {
                OR: [
                  { title: { contains: input.q, mode: "insensitive" } },
                  { excerpt: { contains: input.q, mode: "insensitive" } },
                  { content: { contains: input.q, mode: "insensitive" } },
                ],
              }
            : {},
          input?.filter
            ? {
                categories: {
                  some: { category: { slug: input.filter } },
                },
              }
            : {},
        ],
      } as const;

      const [posts, total] = await Promise.all([
        ctx.db.blogPost.findMany({
          where,
          include: {
            author: true,
            categories: { include: { category: true } },
            _count: { select: { comments: true } },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          skip,
          take: pageSize,
        }),
        ctx.db.blogPost.count({ where }),
      ]);

      return {
        total,
        page,
        pageSize,
        items: posts.map((p) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt ?? undefined,
          content: p.content,
          coverImageUrl: p.coverImageUrl ?? undefined,
          timeAgo:
            p.publishedAt?.toLocaleDateString("en-GB") ??
            p.createdAt.toLocaleDateString("en-GB"),
          author: {
            name: p.author.name ?? p.author.email ?? "Unknown",
            role: p.author.role === "ADMIN" ? "Admin" : "Member",
            initials: (p.author.name ?? "U U")
              .split(" ")
              .map((s) => s.charAt(0).toUpperCase())
              .slice(0, 2)
              .join(""),
          },
          category: p.categories[0]?.category.name ?? "General",
          commentsCount: p._count.comments,
          likes: 0,
        })),
      };
    }),

  listCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c._count.posts,
    }));
  }),
});