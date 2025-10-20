import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

export const getReports = protectedProcedure
    .input(
      z
        .object({
          take: z.number().min(1).max(50).default(20),
          cursor: z.string().nullish(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { take = 20, cursor } = input ?? {};

      const reports = await ctx.db.blogReport.findMany({
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          post: { select: { id: true, title: true, author: true } },
          comment: { select: { id: true, content: true, author: true } },
          user: { select: { id: true, name: true } },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (reports.length > take) {
        const next = reports.pop();
        nextCursor = next?.id;
      }

      return { reports, nextCursor };
    });