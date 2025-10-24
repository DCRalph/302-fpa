import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  logUserActivity,
  logAppActivity,
  UserActivityType,
  AppActivityType,
  ActivityActionEnum,
  ActivityEntity,
  ActivityCategory,
  getActivityIcon,
} from "~/server/api/lib/activity-logger";
import { Severity } from "@prisma/client";

export const memberFilesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // List files for the current user only
    const files = await ctx.db.file.findMany({
      where: {
        userId: ctx.dbUser.id,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        type: true,
        registrationId: true,
        blogPostId: true,
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
            status: true,
            conference: {
              select: {
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
    return files;
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.file.findUnique({
        where: { id: input.id },
        select: { filename: true },
      });

      await ctx.db.file.delete({ where: { id: input.id } });

      // Log activity
      if (file) {
        await Promise.all([
          logUserActivity(ctx.db, {
            userId: ctx.dbUser.id,
            title: `File deleted: ${file.filename}`,
            description: "Your file has been removed",
            icon: getActivityIcon(UserActivityType.FILE_DELETED),
            type: UserActivityType.FILE_DELETED,
            metadata: {
              attachmentId: input.id,
              filename: file.filename,
            },
          }),
          logAppActivity(ctx.db, {
            userId: ctx.dbUser.id,
            userName: ctx.dbUser.name ?? undefined,
            userEmail: ctx.dbUser.email ?? undefined,
            type: AppActivityType.FILE_DELETED,
            action: ActivityActionEnum.DELETED,
            entity: ActivityEntity.ATTACHMENT,
            entityId: input.id,
            title: `File deleted: ${file.filename}`,
            category: ActivityCategory.CONTENT,
            severity: Severity.INFO,
            metadata: {
              attachmentId: input.id,
              filename: file.filename,
            },
          }),
        ]);
      }

      return { success: true };
    }),

  upload: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        mimeType: z.string().optional(),
        data: z.string(), // Base64 encoded data
        sizeBytes: z.number().max(5 * 1024 * 1024), // 5MB limit
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check file size limit
      if (input.sizeBytes > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');

      // Create file record
      const file = await ctx.db.file.create({
        data: {
          userId: ctx.dbUser.id,
          filename: input.filename,
          mimeType: input.mimeType,
          data: buffer,
          sizeBytes: input.sizeBytes,
          type: "REGISTRATION_ATTACHMENT",
          registrationId: null, // Will be linked later during registration
        },
      });

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `File uploaded: ${input.filename}`,
          description: "Your file has been saved and will be attached to your registration",
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.ATTACHMENT,
          entityId: file.id,
          title: `File uploaded: ${input.filename}`,
          category: ActivityCategory.CONTENT,
          severity: Severity.INFO,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
          },
        }),
      ]);

      return {
        fileId: file.id,
        filename: file.filename,
        size: file.sizeBytes,
      };
    }),

  uploadProfileImage: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        mimeType: z.string().optional(),
        data: z.string(), // Base64 encoded data
        sizeBytes: z.number().max(5 * 1024 * 1024), // 5MB limit
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check file size limit
      if (input.sizeBytes > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Validate image type
      if (input.mimeType && !input.mimeType.startsWith('image/')) {
        throw new Error("Only image files are allowed for profile images");
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');

      // Delete any existing profile image for this user
      await ctx.db.file.deleteMany({
        where: {
          userId: ctx.dbUser.id,
          type: "PROFILE_IMAGE",
        },
      });

      // Create file record
      const file = await ctx.db.file.create({
        data: {
          userId: ctx.dbUser.id,
          filename: input.filename,
          mimeType: input.mimeType,
          data: buffer,
          sizeBytes: input.sizeBytes,
          type: "PROFILE_IMAGE",
          registrationId: null, // Profile images are not linked to registrations
        },
      });

      // Update user's profile image URL (without domain)
      const downloadUrl = `/api/files/profile-image/${ctx.dbUser.id}?fileId=${file.id}`;
      await ctx.db.user.update({
        where: { id: ctx.dbUser.id },
        data: { image: downloadUrl },
      });

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Profile image updated`,
          description: "Your profile image has been updated successfully. Previous profile image was replaced.",
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
            replaced: true,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.ATTACHMENT,
          entityId: file.id,
          title: `Profile image updated: ${input.filename}`,
          description: "Previous profile image was replaced",
          category: ActivityCategory.CONTENT,
          severity: Severity.INFO,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
            replaced: true,
          },
        }),
      ]);

      return {
        fileId: file.id,
        filename: file.filename,
        size: file.sizeBytes,
        downloadUrl,
      };
    }),

  uploadBlogImage: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        mimeType: z.string().optional(),
        data: z.string(), // Base64 encoded data
        sizeBytes: z.number().max(5 * 1024 * 1024), // 5MB limit
        blogPostId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check file size limit
      if (input.sizeBytes > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Validate image type
      if (input.mimeType && !input.mimeType.startsWith('image/')) {
        throw new Error("Only image files are allowed for blog images");
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.data, 'base64');

      // Delete any existing blog image for this blog post
      // await ctx.db.file.deleteMany({
      //   where: {
      //     userId: ctx.dbUser.id,
      //     type: "BLOG_IMAGE",
      //     blogPostId: input.blogPostId,
      //   },
      // });

      // Create file record
      const file = await ctx.db.file.create({
        data: {
          userId: ctx.dbUser.id,
          filename: input.filename,
          mimeType: input.mimeType,
          data: buffer,
          sizeBytes: input.sizeBytes,
          type: "BLOG_IMAGE",
          blogPostId: input.blogPostId,
        },
      });

      const downloadUrl = `/api/files/blog-image/${file.id}?fileId=${file.id}`;


      // Update blog post with image
      if (input.blogPostId) {
        await ctx.db.blogPost.update({
          where: { id: input.blogPostId },
          data: {
            coverImageUrl: downloadUrl,
          },
        });
      }

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Blog image uploaded: ${input.filename}`,
          description: "Your blog image has been uploaded successfully",
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
            blogPostId: input.blogPostId,
          },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.CREATED,
          entity: ActivityEntity.ATTACHMENT,
          entityId: file.id,
          title: `Blog image uploaded: ${input.filename}`,
          category: ActivityCategory.CONTENT,
          severity: Severity.INFO,
          metadata: {
            fileId: file.id,
            filename: input.filename,
            sizeBytes: input.sizeBytes,
            blogPostId: input.blogPostId,
          },
        }),
      ]);

      return {
        fileId: file.id,
        filename: file.filename,
        size: file.sizeBytes,
        downloadUrl,
      };
    }),

  // Attach an existing uploaded blog image file to a blog post
  attachToBlogPost: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileId, postId } = input;

      // Verify file exists and belongs to current user
      const file = await ctx.db.file.findUnique({ where: { id: fileId } });
      if (!file) {
        throw new Error("File not found");
      }
      if (file.userId !== ctx.dbUser.id) {
        throw new Error("Not authorized to attach this file");
      }

      // Verify post exists and belongs to current user
      const post = await ctx.db.blogPost.findUnique({ where: { id: postId } });
      if (!post) {
        throw new Error("Post not found");
      }
      if (post.authorId !== ctx.dbUser.id) {
        throw new Error("Not authorized to attach image to this post");
      }

      // Update the file to set the blogPostId
      await ctx.db.file.update({ where: { id: fileId }, data: { blogPostId: postId } });

      // Update blog post cover image url
      const downloadUrl = `/api/files/blog-image/${fileId}?fileId=${fileId}`;
      await ctx.db.blogPost.update({ where: { id: postId }, data: { coverImageUrl: downloadUrl } });

      // Log activity
      await Promise.all([
        logUserActivity(ctx.db, {
          userId: ctx.dbUser.id,
          title: `Attached image to post: ${post.title}`,
          description: "Your uploaded image has been attached to your blog post",
          icon: getActivityIcon(UserActivityType.FILE_UPLOADED),
          type: UserActivityType.FILE_UPLOADED,
          metadata: { fileId, postId },
        }),
        logAppActivity(ctx.db, {
          userId: ctx.dbUser.id,
          userName: ctx.dbUser.name ?? undefined,
          userEmail: ctx.dbUser.email ?? undefined,
          type: AppActivityType.FILE_UPLOADED,
          action: ActivityActionEnum.UPDATED,
          entity: ActivityEntity.BLOG_POST,
          entityId: postId,
          title: `Attached image ${file.filename} to post ${post.title}`,
          category: ActivityCategory.CONTENT,
          severity: Severity.INFO,
          metadata: { fileId, postId },
        }),
      ]);

      return { success: true };
    }),
});

