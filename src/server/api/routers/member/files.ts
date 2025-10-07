import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const filesRouter = createTRPCRouter({
  listFiles: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.dbUser.id;

    const attachments = await ctx.db.attachment.findMany({
      where: { registration: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        registrationId: true,
      },
    });

    return attachments.map((a) => ({
      id: a.id,
      url: a.url,
      filename: a.filename,
      mimeType: a.mimeType ?? undefined,
      sizeBytes: a.sizeBytes ?? undefined,
      createdAt: a.createdAt.toISOString(),
      registrationId: a.registrationId ?? undefined,
    }));
  }),
});