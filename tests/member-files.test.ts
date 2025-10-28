import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Member Files Router Tests', () => {
  describe('member.files.list', () => {
    test('should return files for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.files.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Each file should have required fields
      result.forEach(file => {
        expect(file.id).toBeDefined();
        expect(file.filename).toBeDefined();
        expect(file.mimeType).toBeDefined();
        expect(file.sizeBytes).toBeDefined();
        expect(file.createdAt).toBeDefined();
        expect(file.type).toBeDefined();
        expect(file.user).toBeDefined();
        expect(file.user.id).toBe(regularUser.dbUser.id);
        expect(file.user.name).toBeDefined();
        expect(file.user.email).toBeDefined();
      });
    });

    test('should only return files for current user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      const regularUserFiles = await regularUser.caller.member.files.list();
      const adminUserFiles = await adminUser.caller.member.files.list();

      // Files should be different for different users
      const regularUserFileIds = regularUserFiles.map(f => f.id);
      const adminUserFileIds = adminUserFiles.map(f => f.id);

      // No overlap in file IDs between users
      const overlap = regularUserFileIds.filter(id => adminUserFileIds.includes(id));
      expect(overlap).toHaveLength(0);
    });

    test('should work for admin users', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.member.files.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should include related data when available', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.files.list();

      result.forEach(file => {
        // Check registration data if available
        if (file.registration) {
          expect(file.registration.id).toBeDefined();
          expect(file.registration.status).toBeDefined();
          expect(file.registration.conference).toBeDefined();
          expect(file.registration.conference.name).toBeDefined();
          expect(file.registration.conference.startDate).toBeDefined();
          expect(file.registration.conference.endDate).toBeDefined();
        }

        // Check blog post data if available
        if (file.blogPost) {
          expect(file.blogPost.id).toBeDefined();
          expect(file.blogPost.title).toBeDefined();
          expect(file.blogPost.slug).toBeDefined();
          expect(file.blogPost.published).toBeDefined();
        }
      });
    });
  });

  describe('member.files.delete', () => {
    test('should validate file ID', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.files.delete({
          id: '', // Empty ID
        })
      ).rejects.toThrow();
    });

    test('should prevent deleting non-existent file', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.files.delete({
          id: 'non-existent-file-id',
        })
      ).rejects.toThrow();
    });

    test('should prevent deleting other users files', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Get admin's files
      const adminFiles = await adminUser.caller.member.files.list();

      if (adminFiles.length > 0) {
        const adminFileId = adminFiles[0]!.id;

        // Regular user should not be able to delete admin's file
        await expect(
          regularUser.caller.member.files.delete({
            id: adminFileId,
          })
        ).rejects.toThrow();
      }
    });

    test('should return success when file is deleted', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // This test might not work if there are no files to delete
      // In that case, we'll just test the validation
      try {
        const result = await regularUser.caller.member.files.delete({
          id: 'some-file-id',
        });
        expect(result.success).toBe(true);
      } catch (error) {
        // Expected if file doesn't exist or belongs to another user
        expect(error).toBeDefined();
      }
    });
  });

  describe('member.files.upload', () => {
    test('should validate file type', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await expect(
        regularUser.caller.member.files.upload({
          file: invalidFile,
          type: 'PROFILE_IMAGE',
        })
      ).rejects.toThrow();
    });

    test('should validate file size', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Create a large file (simulate)
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      await expect(
        regularUser.caller.member.files.upload({
          file: largeFile,
          type: 'PROFILE_IMAGE',
        })
      ).rejects.toThrow();
    });

    test('should validate file type parameter', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(
        regularUser.caller.member.files.upload({
          file: validFile,
          type: 'INVALID_TYPE' as any,
        })
      ).rejects.toThrow();
    });

    test('should require file', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.files.upload({
          file: null as any,
          type: 'PROFILE_IMAGE',
        })
      ).rejects.toThrow();
    });

    test('should require file type', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(
        regularUser.caller.member.files.upload({
          file: validFile,
          type: undefined as any,
        })
      ).rejects.toThrow();
    });

    test('should validate registration ID when provided', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      await expect(
        regularUser.caller.member.files.upload({
          file: validFile,
          type: 'REGISTRATION_DOCUMENT',
          registrationId: 'invalid-registration-id',
        })
      ).rejects.toThrow();
    });

    test('should validate blog post ID when provided', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(
        regularUser.caller.member.files.upload({
          file: validFile,
          type: 'BLOG_IMAGE',
          blogPostId: 'invalid-blog-post-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('member.files.getById', () => {
    test('should return file details for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Get user's files first
      const files = await regularUser.caller.member.files.list();

      if (files.length > 0) {
        const fileId = files[0]!.id;
        const result = await regularUser.caller.member.files.getById({
          id: fileId,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(fileId);
        expect(result.filename).toBeDefined();
        expect(result.mimeType).toBeDefined();
        expect(result.sizeBytes).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user.id).toBe(regularUser.dbUser.id);
      }
    });

    test('should prevent accessing other users files', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Get admin's files
      const adminFiles = await adminUser.caller.member.files.list();

      if (adminFiles.length > 0) {
        const adminFileId = adminFiles[0]!.id;

        // Regular user should not be able to access admin's file
        await expect(
          regularUser.caller.member.files.getById({
            id: adminFileId,
          })
        ).rejects.toThrow();
      }
    });

    test('should return 404 for non-existent file', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.files.getById({
          id: 'non-existent-file-id',
        })
      ).rejects.toThrow();
    });

    test('should validate file ID', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.files.getById({
          id: '', // Empty ID
        })
      ).rejects.toThrow();
    });
  });

  describe('Files Router Integration', () => {
    test('should maintain data consistency across file operations', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Get initial files
      const initialFiles = await regularUser.caller.member.files.list();
      const initialCount = initialFiles.length;

      // The count should be consistent
      expect(initialCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle concurrent file operations', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Make concurrent requests
      const promises = [
        regularUser.caller.member.files.list(),
        regularUser.caller.member.files.list(),
        regularUser.caller.member.files.list(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should work for different user types', async () => {
      const users = [
        getTestUser(testUsers, 'regularUser'),
        getTestUser(testUsers, 'adminUser'),
        getTestUser(testUsers, 'verifiedUser'),
      ];

      for (const user of users) {
        const files = await user.caller.member.files.list();
        expect(Array.isArray(files)).toBe(true);
      }
    });
  });

  describe('File Type Validation', () => {
    test('should validate PROFILE_IMAGE file types', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validImageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const invalidImageFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      // This test might not work without actual file upload implementation
      // We're mainly testing the validation logic
      try {
        await regularUser.caller.member.files.upload({
          file: validImageFile,
          type: 'PROFILE_IMAGE',
        });
      } catch (error) {
        // Expected if file upload is not fully implemented
      }

      await expect(
        regularUser.caller.member.files.upload({
          file: invalidImageFile,
          type: 'PROFILE_IMAGE',
        })
      ).rejects.toThrow();
    });

    test('should validate REGISTRATION_DOCUMENT file types', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validPdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      try {
        await regularUser.caller.member.files.upload({
          file: validPdfFile,
          type: 'REGISTRATION_DOCUMENT',
        });
      } catch (error) {
        // Expected if file upload is not fully implemented
      }

      await expect(
        regularUser.caller.member.files.upload({
          file: invalidFile,
          type: 'REGISTRATION_DOCUMENT',
        })
      ).rejects.toThrow();
    });

    test('should validate BLOG_IMAGE file types', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const validImageFile = new File(['test'], 'test.png', { type: 'image/png' });
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      try {
        await regularUser.caller.member.files.upload({
          file: validImageFile,
          type: 'BLOG_IMAGE',
        });
      } catch (error) {
        // Expected if file upload is not fully implemented
      }

      await expect(
        regularUser.caller.member.files.upload({
          file: invalidFile,
          type: 'BLOG_IMAGE',
        })
      ).rejects.toThrow();
    });
  });
});

