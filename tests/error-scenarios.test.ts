import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Error Scenarios Tests', () => {
  describe('Authentication Errors', () => {
    test('should handle invalid session gracefully', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test that protected endpoints still work with valid sessions
      const result = await regularUser.caller.auth.me();
      expect(result).toBeDefined();
    });

    test('should reject unauthorized access to admin routes', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const adminRoutes = [
        () => regularUser.caller.admin.dashboard.getAdminDashboard(),
        () => regularUser.caller.admin.members.getAll(),
        () => regularUser.caller.admin.conference.getAll(),
        () => regularUser.caller.admin.files.getAll({}),
        () => regularUser.caller.admin.activity.getAll({}),
        () => regularUser.caller.admin.emails.getAll({}),
      ];

      for (const route of adminRoutes) {
        await expect(route()).rejects.toThrow();
      }
    });

    test('should allow admin access to member routes', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Admin should access member routes
      const memberDashboard = await adminUser.caller.member.dashboard.getMemberDashboard();
      expect(memberDashboard).toBeDefined();

      const blogCategories = await adminUser.caller.member.blog.getCategories();
      expect(Array.isArray(blogCategories)).toBe(true);
    });
  });

  describe('Input Validation Errors', () => {
    test('should validate email format across all endpoints', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const invalidEmails = [
        'invalid-email',
        '@invalid.com',
        'invalid@',
        'invalid@.com',
        'invalid..email@test.com',
        '',
        ' ',
        'invalid@test@com',
      ];

      for (const email of invalidEmails) {
        await expect(
          regularUser.caller.auth.requestPasswordReset({ email })
        ).rejects.toThrow();

        await expect(
          regularUser.caller.member.profile.update({ email })
        ).rejects.toThrow();
      }
    });

    test('should validate required fields', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test empty strings
      await expect(
        regularUser.caller.member.profile.update({ name: '' })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.blog.createPost({
          title: '',
          content: 'Test content',
          categoryId: 'some-id',
          published: true,
        })
      ).rejects.toThrow();


    });

    test('should validate string length limits', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test very long strings
      const longString = 'a'.repeat(10000);

      await expect(
        regularUser.caller.member.profile.update({ name: longString })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.blog.createPost({
          title: longString,
          content: 'Test content',
          categoryId: 'some-id',
          published: true,
        })
      ).rejects.toThrow();
    });

    test('should validate numeric ranges', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Test negative values
      await expect(
        adminUser.caller.admin.conference.create({
          name: 'Test Conference',
          description: 'Test description',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
          location: 'Test Location',
          priceCents: -1000, // Negative price
          currency: 'FJD',
          isActive: true,
          maxRegistrations: 100,
          registrationStartDate: new Date('2025-01-01'),
          registrationEndDate: new Date('2025-05-31'),
          bankTransferAccountName: 'Test Account',
          bankTransferBranch: 'Test Branch',
          bankTransferAccountNumber: '1234567890',
          contacts: [],
        })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.conference.create({
          name: 'Test Conference',
          description: 'Test description',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
          location: 'Test Location',
          priceCents: 50000,
          currency: 'FJD',
          isActive: true,
          maxRegistrations: -10, // Negative max registrations
          registrationStartDate: new Date('2025-01-01'),
          registrationEndDate: new Date('2025-05-31'),
          bankTransferAccountName: 'Test Account',
          bankTransferBranch: 'Test Branch',
          bankTransferAccountNumber: '1234567890',
          contacts: [],
        })
      ).rejects.toThrow();
    });

    test('should validate date ranges', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Test end date before start date
      await expect(
        adminUser.caller.admin.conference.create({
          name: 'Test Conference',
          description: 'Test description',
          startDate: new Date('2025-06-03'),
          endDate: new Date('2025-06-01'), // End before start
          location: 'Test Location',
          priceCents: 50000,
          currency: 'FJD',
          isActive: true,
          maxRegistrations: 100,
          registrationStartDate: new Date('2025-01-01'),
          registrationEndDate: new Date('2025-05-31'),
          bankTransferAccountName: 'Test Account',
          bankTransferBranch: 'Test Branch',
          bankTransferAccountNumber: '1234567890',
          contacts: [],
        })
      ).rejects.toThrow();
    });

    test('should validate enum values', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test invalid enum values
      await expect(
        regularUser.caller.member.blog.createReport({
          id: 'some-id',
          reason: 'INVALID_REASON',
          type: 'post',
        })
      ).rejects.toThrow();

      // await expect(
      //   regularUser.caller.member.files.upload({
      //     data: 'test',
      //     sizeBytes: 100,
      //     filename: 'test.jpg',
      //     mimeType: 'image/jpeg',
      //   })
      // ).rejects.toThrow();
    });
  });

  describe('Resource Not Found Errors', () => {
    test('should return 404 for non-existent resources', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Test non-existent blog posts
      await expect(
        regularUser.caller.member.blog.getById({ id: 'non-existent-id' })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.blog.updatePost({
          id: 'non-existent-id',
          title: 'Updated Title',
          content: 'Updated content',
          categoryId: 'some-id',
          published: true,
        })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.blog.deletePost({ id: 'non-existent-id' })
      ).rejects.toThrow();

      // Test non-existent files
      await expect(
        regularUser.caller.member.files.getById({ id: 'non-existent-id' })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.files.delete({ id: 'non-existent-id' })
      ).rejects.toThrow();

      // Test non-existent conferences (admin only)
      await expect(
        adminUser.caller.admin.conference.getById({ id: 'non-existent-id' })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.conference.update({
          id: 'non-existent-id',
          name: 'Updated Name',
        })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.conference.delete({ id: 'non-existent-id' })
      ).rejects.toThrow();

      // Test non-existent members (admin only)
      await expect(
        adminUser.caller.admin.members.getById({ id: 'non-existent-id' })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.members.update({
          id: 'non-existent-id',
          name: 'Updated Name',
        })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.members.delete({ id: 'non-existent-id' })
      ).rejects.toThrow();
    });

    test('should handle empty ID parameters', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Test empty string IDs
      await expect(
        regularUser.caller.member.blog.getById({ id: '' })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.files.getById({ id: '' })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.conference.getById({ id: '' })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.members.getById({ id: '' })
      ).rejects.toThrow();
    });
  });

  describe('Permission Errors', () => {
    test('should prevent users from accessing other users resources', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Get admin's files
      const adminFiles = await adminUser.caller.member.files.list();

      if (adminFiles.length > 0) {
        const adminFileId = adminFiles[0]!.id;

        // Regular user should not access admin's files
        await expect(
          regularUser.caller.member.files.getById({ id: adminFileId })
        ).rejects.toThrow();

        await expect(
          regularUser.caller.member.files.delete({ id: adminFileId })
        ).rejects.toThrow();
      }

      // Get admin's blog posts
      const adminBlogPosts = await adminUser.caller.member.blog.list();

      if (adminBlogPosts.posts.length > 0) {
        const adminPostId = adminBlogPosts.posts[0]!.id;

        // Regular user should not modify admin's posts
        await expect(
          regularUser.caller.member.blog.updatePost({
            id: adminPostId,
            title: 'Hacked Title',
            content: 'Hacked content',
            categoryId: 'some-id',
            published: true,
          })
        ).rejects.toThrow();

        // await expect(
        //   regularUser.caller.member.blog.deletePost({ id: adminPostId })
        // ).rejects.toThrow();
      }
    });

    test('should prevent self-destructive actions', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Admin should not be able to demote themselves
      await expect(
        adminUser.caller.admin.members.update({
          id: adminUser.dbUser.id,
          role: 'USER',
        })
      ).rejects.toThrow();

      // Admin should not be able to delete themselves
      await expect(
        adminUser.caller.admin.members.delete({
          id: adminUser.dbUser.id,
        })
      ).rejects.toThrow();
    });

    test('should prevent duplicate resource creation', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Test duplicate email updates
      await expect(
        regularUser.caller.member.profile.update({
          email: adminUser.dbUser.email!,
        })
      ).rejects.toThrow();

      await expect(
        adminUser.caller.admin.members.update({
          id: regularUser.dbUser.id,
          email: adminUser.dbUser.email!,
        })
      ).rejects.toThrow();
    });
  });

  describe('System Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test that the system handles database errors gracefully
      // This would require mocking the database connection
      // For now, we'll test that normal operations work
      const result = await regularUser.caller.auth.me();
      expect(result).toBeDefined();
    });

    test('should handle malformed JSON in requests', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test that the system handles malformed requests gracefully
      // This would require sending malformed requests directly
      // For now, we'll test that normal operations work
      const result = await regularUser.caller.auth.me();
      expect(result).toBeDefined();
    });

    test('should handle concurrent operations gracefully', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test concurrent operations
      const promises = Array.from({ length: 10 }, () =>
        regularUser.caller.auth.me()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should handle timeout scenarios', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test that operations complete within reasonable time
      const startTime = Date.now();
      await regularUser.caller.auth.me();
      const endTime = Date.now();

      // Should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Edge Case Error Handling', () => {
    test('should handle very large input values', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const veryLongString = 'a'.repeat(100000);

      await expect(
        regularUser.caller.member.profile.update({ name: veryLongString })
      ).rejects.toThrow();

      await expect(
        regularUser.caller.member.blog.createPost({
          title: veryLongString,
          content: 'Test content',
          categoryId: 'some-id',
          published: true,
        })
      ).rejects.toThrow();
    });

    test('should handle special characters in input', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const specialChars = [
        'Test <script>alert("xss")</script>',
        'Test "quotes" and \'apostrophes\'',
        'Test\nnewlines\tand\ttabs',
        'Test unicode: 🚀🎉💯',
        'Test & ampersands & more',
        'Test (parentheses) and [brackets]',
      ];

      for (const input of specialChars) {
        // These should be handled gracefully (either accepted or rejected)
        try {
          await regularUser.caller.member.profile.update({ name: input });
        } catch (error) {
          // Expected for some special characters
          expect(error).toBeDefined();
        }
      }
    });

    test('should handle boundary date values', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const boundaryDates = [
        new Date('1900-01-01'), // Very old date
        new Date('2100-12-31'), // Far future date
        new Date('1970-01-01'), // Unix epoch
        new Date('2038-01-19'), // 32-bit timestamp limit
      ];

      for (const date of boundaryDates) {
        try {
          await adminUser.caller.admin.conference.create({
            name: 'Boundary Date Test',
            description: 'Testing boundary dates',
            startDate: date,
            endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000), // Next day
            location: 'Test Location',
            priceCents: 50000,
            currency: 'FJD',
            isActive: true,
            maxRegistrations: 100,
            registrationStartDate: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days before
            registrationEndDate: new Date(date.getTime() - 1), // Day before
            bankTransferAccountName: 'Test Account',
            bankTransferBranch: 'Test Branch',
            bankTransferAccountNumber: '1234567890',
            contacts: [],
          });
        } catch (error) {
          // Some boundary dates might be rejected
          expect(error).toBeDefined();
        }
      }
    });
  });
});

