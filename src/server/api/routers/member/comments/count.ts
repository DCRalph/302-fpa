import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

export const getCommentCount = protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const count = await ctx.db.blogComment.count({
        where: {
          postId: input.postId,
          approved: true,
        },
      });

      return { count };
    });