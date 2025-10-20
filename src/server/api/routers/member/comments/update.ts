import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const updateComment = protectedProcedure
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
    });