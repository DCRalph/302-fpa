import { ReportAction } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";

export const resolveReport = protectedProcedure.input(
    z.object({
      id: z.string(),
      action: z.nativeEnum(ReportAction),
      adminNote: z.string().optional(),
    })
  ).mutation(async ({ ctx, input }) => {
    const report = await ctx.db.blogReport.update({
      where: { id: input.id },
      data: { 
        resolvedAt: new Date(), 
        resolvedById: ctx.dbUser.id,
        action: input.action,
        adminNote: input.adminNote,
      },
    });

    return report;
  });