import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const deleteComment = protectedProcedure
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
    });