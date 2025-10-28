import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers; 

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Member Router Tests', () => {
  describe('member.dashboard.getMemberDashboard', () => {
    test('should return dashboard data for regular user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.dashboard.getMemberDashboard();

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.registrationStatus).toBeDefined();
      expect(result.stats.paymentStatus).toBeDefined();
      expect(result.stats.communityBlog).toBeDefined();
      expect(result.stats.documents).toBeDefined();
      expect(result.recentActivity).toBeDefined();
      expect(Array.isArray(result.recentActivity)).toBe(true);
    });

    test('should return dashboard data for admin user', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.member.dashboard.getMemberDashboard();

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.registrationStatus).toBeDefined();
      expect(result.stats.paymentStatus).toBeDefined();
      expect(result.stats.communityBlog).toBeDefined();
      expect(result.stats.documents).toBeDefined();
    });

    test('should include user-specific statistics', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.dashboard.getMemberDashboard();

      expect(result.stats.registrationStatus.value).toBeDefined();
      expect(result.stats.paymentStatus.value).toBeDefined();
      expect(result.stats.communityBlog.value).toBeDefined();
      expect(result.stats.documents.value).toBeDefined();
    });
  });

  describe('member.blog.getCategories', () => {
    test('should return blog categories for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Each category should have required fields
      result.forEach(category => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
      });
    });

    test('should work for admin users', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.member.blog.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('member.blog.list', () => {
    test('should return published blog posts for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.list();

      expect(result).toBeDefined();
      expect(result.posts).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
      // expect(result.nextCursor).toBeDefined();
    });

    test('should support pagination', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.list({
        take: 5,
      });

      expect(result.posts.length).toBeLessThanOrEqual(5);
    });

    test('should support search query', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.list({
        query: 'test',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
    });

    test('should support category filtering', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.list({
        categorySlug: 'general',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
    });

    test('should filter "Your posts" correctly', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.list({
        query: 'Your posts',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.posts)).toBe(true);
      // All posts should belong to the current user
      result.posts.forEach(post => {
        expect(post.authorId).toBe(regularUser.dbUser.id);
      });
    });
  });

  describe('member.blog.createPost', () => {
    test('should create a new blog post for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // First get a category to use
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const result = await regularUser.caller.member.blog.createPost({
          title: 'Test Blog Post',
          content: 'This is a test blog post content.',
          categoryId,
          published: true,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.title).toBe('Test Blog Post');
        expect(result.content).toBe('This is a test blog post content.');
        expect(result.authorId).toBe(regularUser.dbUser.id);
        expect(result.published).toBe(true);
      }
    });

    test('should create a draft post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const result = await regularUser.caller.member.blog.createPost({
          title: 'Test Draft Post',
          content: 'This is a test draft post content.',
          categoryId,
          published: false,
        });

        expect(result).toBeDefined();
        expect(result.title).toBe('Test Draft Post');
        expect(result.published).toBe(false);
        expect(result.publishedAt).toBeNull();
      }
    });

    test('should validate required fields', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.createPost({
          title: '', // Empty title
          content: 'Content',
          categoryId: 'some-id',
          published: true,
        })
      ).rejects.toThrow();
    });
  });

  describe('member.blog.updatePost', () => {
    test('should update own blog post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // First create a post
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Original Title',
          content: 'Original content',
          categoryId,
          published: true,
        });

        // Then update it
        const result = await regularUser.caller.member.blog.updatePost({
          id: post.id,
          title: 'Updated Title',
          content: 'Updated content',
          categoryId,
          published: true,
        });

        expect(result).toBeDefined();
        expect(result.title).toBe('Updated Title');
        expect(result.content).toBe('Updated content');
      }
    });

    test('should prevent updating other users posts', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Create a post as admin
      const categories = await adminUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await adminUser.caller.member.blog.createPost({
          title: 'Admin Post',
          content: 'Admin content',
          categoryId,
          published: true,
        });

        // Try to update as regular user
        await expect(
          regularUser.caller.member.blog.updatePost({
            id: post.id,
            title: 'Hacked Title',
            content: 'Hacked content',
            categoryId,
            published: true,
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('member.blog.deletePost', () => {
    test('should delete own blog post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Post to Delete',
          content: 'This post will be deleted',
          categoryId,
          published: true,
        });

        const result = await regularUser.caller.member.blog.deletePost({
          id: post.id,
        });

        expect(result.success).toBe(true);
      }
    });

    test('should prevent deleting other users posts', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      const categories = await adminUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await adminUser.caller.member.blog.createPost({
          title: 'Admin Post',
          content: 'Admin content',
          categoryId,
          published: true,
        });

        await expect(
          regularUser.caller.member.blog.deletePost({
            id: post.id,
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('member.blog.getById', () => {
    test('should return blog post by id', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Test Post for Get',
          content: 'Content for testing get by id',
          categoryId,
          published: true,
        });

        const result = await regularUser.caller.member.blog.getById({
          id: post.id,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(post.id);
        expect(result.title).toBe('Test Post for Get');
        expect(result.author).toBeDefined();
        expect(result.category).toBeDefined();
        expect(result._count).toBeDefined();
        expect(result.isLikedByUser).toBeDefined();
      }
    });

    test('should return 404 for non-existent post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.getById({
          id: 'non-existent-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('member.blog.likePost and unlikePost', () => {
    test('should like and unlike a post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Post to Like',
          content: 'Content for liking',
          categoryId,
          published: true,
        });

        // Like the post
        const likeResult = await regularUser.caller.member.blog.likePost({
          postId: post.id,
        });

        expect(likeResult.success).toBe(true);
        expect(likeResult.likeCount).toBeDefined();

        // Check if post is liked
        const isLikedResult = await regularUser.caller.member.blog.isPostLiked({
          postId: post.id,
        });

        expect(isLikedResult.isLiked).toBe(true);

        // Unlike the post
        const unlikeResult = await regularUser.caller.member.blog.unlikePost({
          postId: post.id,
        });

        expect(unlikeResult.success).toBe(true);

        // Check if post is no longer liked
        const isLikedAfterUnlike = await regularUser.caller.member.blog.isPostLiked({
          postId: post.id,
        });

        expect(isLikedAfterUnlike.isLiked).toBe(false);
      }
    });

    test('should handle double liking gracefully', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Post for Double Like',
          content: 'Content for double liking',
          categoryId,
          published: true,
        });

        // Like the post
        await regularUser.caller.member.blog.likePost({
          postId: post.id,
        });

        // Try to like again
        const doubleLikeResult = await regularUser.caller.member.blog.likePost({
          postId: post.id,
        });

        expect(doubleLikeResult.success).toBe(false);
        expect(doubleLikeResult.message).toContain('already liked');
      }
    });
  });

  describe('member.blog comments', () => {
    test('should add comment to post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Post for Comments',
          content: 'Content for comments',
          categoryId,
          published: true,
        });

        const commentResult = await regularUser.caller.member.blog.addComment({
          postId: post.id,
          content: 'This is a test comment',
        });

        expect(commentResult).toBeDefined();
        expect(commentResult.id).toBeDefined();
        expect(commentResult.content).toBe('This is a test comment');
        expect(commentResult.authorId).toBe(regularUser.dbUser.id);
      }
    });

    test('should get comments for post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Post for Getting Comments',
          content: 'Content for getting comments',
          categoryId,
          published: true,
        });

        // Add a comment
        await regularUser.caller.member.blog.addComment({
          postId: post.id,
          content: 'Test comment',
        });

        // Get comments
        const comments = await regularUser.caller.member.blog.getComments({
          postId: post.id,
        });

        expect(comments).toBeDefined();
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);
      }
    });
  });
});
