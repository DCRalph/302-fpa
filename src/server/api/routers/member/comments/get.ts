import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

export const getComments = protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
        const comments = await ctx.db.blogComment.findMany({
            where: {
                postId: input.postId,
                approved: true,
                parentCommentId: null, // Only get top-level comments
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
                subComments: {
                    where: {
                        approved: true,
                    },
                    orderBy: { createdAt: "asc" },
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
                },
            },
        });

        return comments;
    });