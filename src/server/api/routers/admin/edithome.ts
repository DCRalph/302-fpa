import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import type { ConferenceTitle, ConferenceWhyJoin, ConferenceDetails } from "~/server/api/routers/home";

export const editHomeRouter = createTRPCRouter({
  changeConferenceTitle: adminProcedure
    .input(z.object({
      title: z.string(),
      subtitle: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.siteSettings.upsert({
        where: { key: "conferenceTitle" },
        create: { key: "conferenceTitle", value: JSON.stringify(input) },
        update: { value: JSON.stringify(input) },
      });
      return updated.value;
    }),

  changeConferenceWhyJoin: adminProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.object({
              type: z.string(),
              name: z.string(),
              props: z.object({ className: z.string() }),
            }),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.siteSettings.upsert({
        where: { key: "conferenceWhyJoin" },
        create: { key: "conferenceWhyJoin", value: JSON.stringify(input.items) },
        update: { value: JSON.stringify(input.items) },
      });
      return updated;
    }),

  changeConferenceDetails: adminProcedure
    .input(
      z.object({
        conferenceTitle: z.string(),
        rows: z.array(z.object({ label: z.string(), value: z.string() })),
        included: z.array(z.string()),
        contacts: z.array(
          z.object({
            role: z.string(),
            name: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.siteSettings.upsert({
        where: { key: "conferenceDetails" },
        create: { key: "conferenceDetails", value: JSON.stringify(input) },
        update: { value: JSON.stringify(input) },
      });
      return updated;
    }),
});