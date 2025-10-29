import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminFilesRouter = createTRPCRouter({
  // Get all files with pagination and filtering
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "filename", "sizeBytes", "mimeType"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        mimeType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const { page, limit, search, sortBy, sortOrder } = input;
      let { mimeType } = input;
      const skip = (page - 1) * limit;

      if (mimeType === "all") {
        mimeType = undefined;
      }

      // Build where clause for search and filtering
      const where: {
        OR?: Array<{ filename: { contains: string; mode: "insensitive" }; } | { mimeType: { contains: string; mode: "insensitive" }; }>;
        mimeType?: { contains: string; mode: "insensitive" };
      } = {};

      if (search) {
        where.OR = [
          { filename: { contains: search, mode: "insensitive" } },
          { mimeType: { contains: search, mode: "insensitive" } },
        ];
      }

      if (mimeType) {
        where.mimeType = { contains: mimeType, mode: "insensitive" };
      }

      // Get files with pagination
      const [files, totalCount] = await Promise.all([
        ctx.db.file.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
          select: {
            id: true,
            filename: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
            type: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            registration: {
              select: {
                id: true,
                name: true,
                email: true,
                conference: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
            blogPost: {
              select: {
                id: true,
                title: true,
                slug: true,
                published: true,
              },
            },
          },
        }),
        ctx.db.file.count({ where }),
      ]);

      return {
        files,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }),

  // Get a single file by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can access this resource",
        });
      }

      const file = await ctx.db.file.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          registration: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              school: true,
              conference: {
                select: {
                  id: true,
                  name: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
          blogPost: {
            select: {
              id: true,
              title: true,
              slug: true,
              published: true,
            },
          },
        },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return file;
    }),


  // Update file details
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        filename: z.string().min(1).optional(),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      const { id, ...updateData } = input;

      const file = await ctx.db.file.update({
        where: { id },
        data: updateData,
        include: {
          registration: {
            select: {
              id: true,
              name: true,
              email: true,
              conference: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return file;
    }),

  // Delete a file
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      const file = await ctx.db.file.findUnique({
        where: { id: input.id },
        select: { filename: true },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      await ctx.db.file.delete({
        where: { id: input.id },
      });

      return { success: true, filename: file.filename };
    }),

  // Upload a new file
  upload: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        mimeType: z.string().optional(),
        data: z.string(), // Base64 encoded data
        registrationId: z.string().optional(),
        fileType: z.enum(["PROFILE_IMAGE", "REGISTRATION_ATTACHMENT", "BLOG_IMAGE", "OTHER"]).default("OTHER"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can perform this action",
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');
      const sizeBytes = buffer.length;

      const file = await ctx.db.file.create({
        data: {
          filename: input.filename,
          mimeType: input.mimeType,
          data: buffer,
          sizeBytes,
          type: input.fileType,
          registrationId: input.registrationId?.trim() == "" ? null : input.registrationId,
          userId: ctx.dbUser.id,
        },
        include: {
          registration: {
            select: {
              id: true,
              name: true,
              email: true,
              conference: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return file;
    }),

  // Get file statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.dbUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    const [
      totalFiles,
      totalSizeBytes,
      filesToday,
      filesThisWeek,
      filesThisMonth,
      mimeTypeStats,
    ] = await Promise.all([
      ctx.db.file.count(),
      ctx.db.file.aggregate({
        _sum: { sizeBytes: true },
      }),
      ctx.db.file.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      ctx.db.file.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      ctx.db.file.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      ctx.db.file.groupBy({
        by: ['mimeType'],
        _count: { mimeType: true },
        orderBy: { _count: { mimeType: 'desc' } },
        take: 5,
      }),
    ]);

    const totalSizeMB = totalSizeBytes._sum.sizeBytes
      ? Math.round((totalSizeBytes._sum.sizeBytes / (1024 * 1024)) * 100) / 100
      : 0;

    return {
      totalFiles,
      totalSizeMB,
      filesToday,
      filesThisWeek,
      filesThisMonth,
      mimeTypeStats: mimeTypeStats.map(stat => ({
        mimeType: stat.mimeType ?? 'Unknown',
        count: stat._count.mimeType,
      })),
    };
  }),

  // Get mime type options for filtering
  getMimeTypes: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (ctx.dbUser.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access this resource",
      });
    }

    const mimeTypes = await ctx.db.file.findMany({
      select: { mimeType: true },
      distinct: ['mimeType'],
      where: { mimeType: { not: null } },
      orderBy: { mimeType: 'asc' },
    });

    return mimeTypes.map(f => f.mimeType).filter((mimeType): mimeType is string => Boolean(mimeType));
  }),
});

