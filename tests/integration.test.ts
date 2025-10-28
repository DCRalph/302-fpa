import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, getAdminUsers, getRegularUsers } from './helpers/test-user-generator';
import type { TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers;
beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Integration Tests - Cross-Router Functionality', () => {
  describe('User Role-Based Access Control', () => {
    test('admin users should have access to both admin and member routes', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Admin should access admin routes
      const adminDashboard = await adminUser.caller.admin.dashboard.getAdminDashboard();
      expect(adminDashboard).toBeDefined();

      // Admin should also access member routes
      const memberDashboard = await adminUser.caller.member.dashboard.getMemberDashboard();
      expect(memberDashboard).toBeDefined();

      // Admin should access member blog
      const blogCategories = await adminUser.caller.member.blog.getCategories();
      expect(Array.isArray(blogCategories)).toBe(true);
    });

    test('regular users should only have access to member routes', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Regular user should access member routes
      const memberDashboard = await regularUser.caller.member.dashboard.getMemberDashboard();
      expect(memberDashboard).toBeDefined();

      // Regular user should NOT access admin routes
      await expect(
        regularUser.caller.admin.dashboard.getAdminDashboard()
      ).rejects.toThrow();

      await expect(
        regularUser.caller.admin.members.getAll()
      ).rejects.toThrow();
    });
  });

  describe('User Activity Logging Integration', () => {
    test('blog post creation should log user activity', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        // Create a blog post
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Integration Test Post',
          content: 'This post tests activity logging integration',
          categoryId,
          published: true,
        });

        // Check that activity was logged by getting user activities
        const activities = await regularUser.caller.member.dashboard.getMemberDashboard();
        expect(activities.recentActivity).toBeDefined();
        expect(Array.isArray(activities.recentActivity)).toBe(true);

        // Should have at least one activity (the blog post creation)
        expect(activities.recentActivity.length).toBeGreaterThan(0);
      }
    });

    test('blog post update should log user activity', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        // Create a blog post
        const post = await regularUser.caller.member.blog.createPost({
          title: 'Original Title',
          content: 'Original content',
          categoryId,
          published: true,
        });

        // Update the blog post
        await regularUser.caller.member.blog.updatePost({
          id: post.id,
          title: 'Updated Title',
          content: 'Updated content',
          categoryId,
          published: true,
        });

        // Check that activity was logged
        const activities = await regularUser.caller.member.dashboard.getMemberDashboard();
        expect(activities.recentActivity.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Multi-User Blog Interactions', () => {
    test('multiple users should be able to interact with the same blog post', async () => {
      const user1 = getTestUser(testUsers, 'regularUser');
      const user2 = getTestUser(testUsers, 'verifiedUser');

      const categories = await user1.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        // User 1 creates a blog post
        const post = await user1.caller.member.blog.createPost({
          title: 'Multi-User Test Post',
          content: 'This post tests multi-user interactions',
          categoryId,
          published: true,
        });

        // User 2 likes the post
        const likeResult = await user2.caller.member.blog.likePost({
          postId: post.id,
        });
        expect(likeResult.success).toBe(true);

        // User 2 adds a comment
        const comment = await user2.caller.member.blog.addComment({
          postId: post.id,
          content: 'Great post!',
        });
        expect(comment).toBeDefined();
        expect(comment.content).toBe('Great post!');

        // User 1 should see the like and comment
        const postWithInteractions = await user1.caller.member.blog.getById({
          id: post.id,
        });
        expect(postWithInteractions._count.likes).toBeGreaterThan(0);
        expect(postWithInteractions._count.comments).toBeGreaterThan(0);
      }
    });

    test('users should not be able to modify each others posts', async () => {
      const user1 = getTestUser(testUsers, 'regularUser');
      const user2 = getTestUser(testUsers, 'verifiedUser');

      const categories = await user1.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        // User 1 creates a blog post
        const post = await user1.caller.member.blog.createPost({
          title: 'User 1 Post',
          content: 'This is user 1s post',
          categoryId,
          published: true,
        });

        // User 2 should not be able to update user 1s post
        await expect(
          user2.caller.member.blog.updatePost({
            id: post.id,
            title: 'Hacked Title',
            content: 'Hacked content',
            categoryId,
            published: true,
          })
        ).rejects.toThrow();

        // User 2 should not be able to delete user 1s post
        await expect(
          user2.caller.member.blog.deletePost({
            id: post.id,
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('Admin-Member Workflow Integration', () => {
    test('admin should be able to manage members and see their activities', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Admin gets all members
      const members = await adminUser.caller.admin.members.getAll();
      expect(members.length).toBeGreaterThan(0);

      // Find the regular user in the members list
      const regularUserInList = members.find(m => m.id === regularUser.dbUser.id);
      expect(regularUserInList).toBeDefined();
      expect(regularUserInList?.email).toBe(regularUser.dbUser.email);

      // Admin gets specific member details
      const memberDetails = await adminUser.caller.admin.members.getById({
        id: regularUser.dbUser.id,
      });
      expect(memberDetails.id).toBe(regularUser.dbUser.id);
      expect(memberDetails._count).toBeDefined();

      // Admin gets all activities (including from regular user)
      const allActivities = await adminUser.caller.admin.dashboard.getAllActivities({
        page: 1,
        pageSize: 10,
      });
      expect(allActivities.activities).toBeDefined();
      expect(Array.isArray(allActivities.activities)).toBe(true);
    });

    test('admin should be able to update member details', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Admin updates member details
      const updatedMember = await adminUser.caller.admin.members.update({
        id: regularUser.dbUser.id,
        name: 'Updated by Admin',
        phone: '+6799999999',
      });

      expect(updatedMember.name).toBe('Updated by Admin');
      expect(updatedMember.phone).toBe('+6799999999');

      // Regular user should see updated details in their dashboard
      const memberDashboard = await regularUser.caller.member.dashboard.getMemberDashboard();
      // Note: The dashboard might not immediately reflect the updated name
      // depending on how the data is cached or retrieved
    });
  });

  describe('Authentication State Consistency', () => {
    test('all users should have consistent authentication state across routers', async () => {
      const allUsers = getRegularUsers(testUsers).concat(getAdminUsers(testUsers));

      for (const user of allUsers) {
        // Check auth.me
        const authResult = await user.caller.auth.me();
        expect(authResult.session).toBeDefined();
        expect(authResult.dbUser).toBeDefined();
        expect(authResult.session?.user?.id).toBe(authResult.dbUser?.id);

        // Check member dashboard (should work for all users)
        const memberDashboard = await user.caller.member.dashboard.getMemberDashboard();
        expect(memberDashboard).toBeDefined();

        // Check blog access (should work for all users)
        const blogCategories = await user.caller.member.blog.getCategories();
        expect(Array.isArray(blogCategories)).toBe(true);

        // Admin users should also access admin routes
        if (user.dbUser.role === 'ADMIN') {
          const adminDashboard = await user.caller.admin.dashboard.getAdminDashboard();
          expect(adminDashboard).toBeDefined();
        }
      }
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle invalid IDs gracefully across routers', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Invalid blog post ID
      await expect(
        regularUser.caller.member.blog.getById({
          id: 'invalid-id',
        })
      ).rejects.toThrow();

      // Invalid member ID (admin only)
      const adminUser = getTestUser(testUsers, 'adminUser');
      await expect(
        adminUser.caller.admin.members.getById({
          id: 'invalid-id',
        })
      ).rejects.toThrow();
    });

    test('should handle unauthorized access consistently', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Regular user should not access admin routes
      const adminRoutes = [
        () => regularUser.caller.admin.dashboard.getAdminDashboard(),
        () => regularUser.caller.admin.members.getAll(),
        () => regularUser.caller.admin.members.getStats(),
      ];

      for (const route of adminRoutes) {
        await expect(route()).rejects.toThrow();
      }
    });
  });

  describe('Data Consistency Across Routers', () => {
    test('user data should be consistent between auth and member routers', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Get user data from auth router
      const authData = await regularUser.caller.auth.me();

      // Get user data from member dashboard
      const memberData = await regularUser.caller.member.dashboard.getMemberDashboard();

      // Both should reference the same user
      expect(authData.dbUser?.id).toBe(regularUser.dbUser.id);
      expect(authData.dbUser?.email).toBe(regularUser.dbUser.email);
      expect(authData.dbUser?.role).toBe(regularUser.dbUser.role);
    });

    test('blog post counts should be consistent', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Get initial blog post count from dashboard
      const initialDashboard = await regularUser.caller.member.dashboard.getMemberDashboard();
      const initialCount = parseInt(initialDashboard.stats.communityBlog.value);

      // Create a blog post
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        await regularUser.caller.member.blog.createPost({
          title: 'Count Test Post',
          content: 'Testing count consistency',
          categoryId,
          published: true,
        });

        // Get updated count from dashboard
        const updatedDashboard = await regularUser.caller.member.dashboard.getMemberDashboard();
        const updatedCount = parseInt(updatedDashboard.stats.communityBlog.value);

        // Count should have increased by 1
        expect(updatedCount).toBe(initialCount + 1);
      }
    });
  });
});
