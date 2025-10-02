import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const editHomeRouter = createTRPCRouter({
  upsertSiteSetting: adminProcedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { key, value, description } = input;

      const updated = await ctx.db.siteSettings.upsert({
        where: { key },
        create: { key, value, description },
        update: { value, description },
      });

      return updated;
    }),
});