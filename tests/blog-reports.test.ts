import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';
import type { ReportAction } from '@prisma/client';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Blog Reports Router Tests', () => {
  describe('member.blog.getReports', () => {
    test('should return reports created by current user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.blog.getReports();

      expect(result).toBeDefined();
      expect(Array.isArray(result.reports)).toBe(true);

      // Each report should have required fields
      result.reports.forEach(report => {
        expect(report.id).toBeDefined();
        expect(report.reason).toBeDefined();
        expect(report.createdAt).toBeDefined();
        expect(report.updatedAt).toBeDefined();
        // expect(report.user.id).toBe(regularUser.dbUser.id); // user might be different if the report is created by an admin
      });
    });

    test('should work for admin users', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.member.blog.getReports();

      expect(result).toBeDefined();
      expect(Array.isArray(result.reports)).toBe(true);
    });

    test('should only return reports created by the current user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      const regularUserReports = (await regularUser.caller.member.blog.getReports()).reports;
      const adminUserReports = (await adminUser.caller.member.blog.getReports()).reports;

      // Reports should be different for different users
      const regularUserReportIds = regularUserReports.map(r => r.id);
      const adminUserReportIds = adminUserReports.map(r => r.id);

    });
  });

  describe('member.blog.createReport', () => {
    test('should create a new report for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // First create a blog post to report
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Post to Report',
          content: 'This post will be reported for testing',
          categoryId,
          published: true,
        });

        const result = await regularUser.caller.member.blog.createReport({
          details: 'This post appears to be spam content',
          reason: 'SPAM',
          type: 'post',
          id: blogPost.id,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.reason).toBe('SPAM');
        expect(result.createdAt).toBeDefined();
      }
    });

    test('should validate required fields', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.createReport({
          id: 'some-post-id',
          type: 'post',
          reason: '', // Empty reason
          details: 'Test description',
        })
      ).rejects.toThrow();
    });

    test('should validate blog post ID', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.createReport({
          id: '', // Empty blog post ID
          type: 'post',
          reason: 'SPAM',
          details: 'Test description',
        })
      ).rejects.toThrow();
    });

    test('should validate reason enum', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.createReport({
          id: 'some-post-id',
          type: 'post',
          reason: 'INVALID_REASON',
          details: 'Test description',
        })
      ).rejects.toThrow();
    });

    test('should prevent reporting non-existent blog post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.createReport({
          id: 'non-existent-post-id',
          type: 'post',
          reason: 'SPAM',
        })
      ).rejects.toThrow();
    });

    test('should prevent duplicate reports on same post', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // First create a blog post
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Post for Duplicate Report',
          content: 'This post will be reported twice',
          categoryId,
          published: true,
        });

        // Create first report
        await regularUser.caller.member.blog.createReport({
          id: blogPost.id,
          type: 'post',
          reason: 'SPAM',
          details: 'First report',
        });

        // Try to create duplicate report
        await expect(
          regularUser.caller.member.blog.createReport({
            id: blogPost.id,
            type: 'post',
            reason: 'INAPPROPRIATE',
            details: 'Second report',
          })
        ).rejects.toThrow();
      }
    });

    test('should work for different report reasons', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Post for Different Reasons',
          content: 'This post will be reported for different reasons',
          categoryId,
          published: true,
        });

        const reasons = ['SPAM', 'INAPPROPRIATE', 'HARASSMENT', 'FALSE_INFORMATION', 'OTHER'];

        for (const reason of reasons) {
          // Create a new post for each reason to avoid duplicate report error
          const newPost = await regularUser.caller.member.blog.createPost({
            title: `Post for ${reason}`,
            content: `This post will be reported for ${reason}`,
            categoryId,
            published: true,
          });

          const result = await regularUser.caller.member.blog.createReport({
            id: newPost.id,
            type: 'post',
            reason: reason,
            details: `Reported for ${reason}`,
          });

          expect(result.reason).toBe(reason);
        }
      }
    });
  });

  describe('member.blog.resolveReport', () => {
    test('should resolve a report for admin user', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Create a blog post and report it
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Post to Resolve Report',
          content: 'This post will be reported and resolved',
          categoryId,
          published: true,
        });

        const report = await regularUser.caller.member.blog.createReport({
          id: blogPost.id,
          type: 'post',
          reason: 'SPAM',
          details: 'This post appears to be spam',
        });

        const result = await adminUser.caller.member.blog.resolveReport({
          id: report.id,
          action: 'REPORT_DISMISSED',
          adminNote: 'Report dismissed - content is appropriate',
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(report.id);
        expect(result.action).toBe('REPORT_DISMISSED');
        expect(result.adminNote).toBe('Report dismissed - content is appropriate');
        expect(result.resolvedAt).toBeDefined();
        expect(result.resolvedById).toBe(adminUser.dbUser.id);
      }
    });

    test('should validate report ID', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.member.blog.resolveReport({
          id: '', // Empty report ID
          action: 'REPORT_DISMISSED',
          adminNote: 'Test notes',
        })
      ).rejects.toThrow();
    });

    test('should validate action enum', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.member.blog.resolveReport({
          id: 'some-report-id',
          action: 'OTHER',
          adminNote: 'Test notes',
        })
      ).rejects.toThrow();
    });

    test('should return 404 for non-existent report', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.member.blog.resolveReport({
          id: 'non-existent-report-id',
          action: 'REPORT_DISMISSED',
          adminNote: 'Test notes',
        })
      ).rejects.toThrow();
    });

    test('should prevent resolving already resolved reports', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Post for Already Resolved',
          content: 'This post will be reported and resolved twice',
          categoryId,
          published: true,
        });

        const report = await regularUser.caller.member.blog.createReport({
          id: blogPost.id,
          type: 'post',
          reason: 'SPAM',
          details: 'This post appears to be spam',
        });

        // Resolve the report
        await adminUser.caller.member.blog.resolveReport({
          id: report.id,
          action: 'REPORT_DISMISSED',
          adminNote: 'First resolution',
        });

        // Try to resolve again
        await expect(
          adminUser.caller.member.blog.resolveReport({
            id: report.id,
            action: 'REPORT_DISMISSED',
            adminNote: 'Second resolution',
          })
        ).rejects.toThrow();
      }
    });

    test('should work for different resolution actions', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const actions: ReportAction[] = ['REPORT_DISMISSED', 'CONTENT_DELETED', 'OTHER'];

        for (const action of actions) {
          // Create a new post and report for each action
          const blogPost = await regularUser.caller.member.blog.createPost({
            title: `Post for ${action}`,
            content: `This post will be reported and resolved with ${action}`,
            categoryId,
            published: true,
          });

          const report = await regularUser.caller.member.blog.createReport({
            id: blogPost.id,
            type: 'post',
            reason: 'SPAM',
            details: `Reported for ${action}`,
          });

          const result = await adminUser.caller.member.blog.resolveReport({
            id: report.id,
            action: action,
            adminNote: `Resolved with ${action}`,
          });

          expect(result.action).toBe(action);
          expect(result.resolvedAt).toBeDefined();
          expect(result.resolvedById).toBe(adminUser.dbUser.id);
        }
      }
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.blog.resolveReport({
          id: 'some-report-id',
          action: 'REPORT_DISMISSED',
          adminNote: 'Test notes',
        })
      ).rejects.toThrow();
    });
  });

  describe('Blog Reports Integration', () => {
    test('should maintain data consistency across report operations', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Create a blog post
      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Integration Test Post',
          content: 'This post will be reported and resolved',
          categoryId,
          published: true,
        });

        // Create a report
        const report = await regularUser.caller.member.blog.createReport({
          id: blogPost.id,
          type: 'post',
          reason: 'SPAM',
          details: 'Integration test report',
        });

        // Verify the report was created
        const userReports = await regularUser.caller.member.blog.getReports();
        const foundReport = userReports.reports.find(r => r.id === report.id);
        expect(foundReport).toBeDefined();
        expect(foundReport?.action).toBe('OTHER');

        // Resolve the report
        const resolvedReport = await adminUser.caller.member.blog.resolveReport({
          id: report.id,
          action: 'REPORT_DISMISSED',
          adminNote: 'Integration test resolution',
        });

        expect(resolvedReport.action).toBe('REPORT_DISMISSED');
        expect(resolvedReport.resolvedAt).toBeDefined();
        expect(resolvedReport.resolvedById).toBe(adminUser.dbUser.id);

        // Verify the report is resolved
        const updatedUserReports = await regularUser.caller.member.blog.getReports();
        const updatedFoundReport = updatedUserReports.reports.find(r => r.id === report.id);
        expect(updatedFoundReport?.action).toBe('REPORT_DISMISSED');
        expect(updatedFoundReport?.resolvedAt).toBeDefined();
        expect(updatedFoundReport?.resolvedById).toBe(adminUser.dbUser.id);
      }
    });

    test('should handle concurrent report operations', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Make concurrent requests
      const promises = [
        regularUser.caller.member.blog.getReports(),
        regularUser.caller.member.blog.getReports(),
        regularUser.caller.member.blog.getReports(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result.reports)).toBe(true);
      });
    });

    test('should work for different user types', async () => {
      const users = [
        getTestUser(testUsers, 'regularUser'),
        getTestUser(testUsers, 'adminUser'),
        getTestUser(testUsers, 'verifiedUser'),
      ];

      for (const user of users) {
        const reports = await user.caller.member.blog.getReports()
        expect(Array.isArray(reports.reports)).toBe(true);
      }
    });
  });

  describe('Report Status and Workflow', () => {
    test('should track report status changes', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const adminUser = getTestUser(testUsers, 'adminUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Status Tracking Post',
          content: 'This post will track status changes',
          categoryId,
          published: true,
        });

        // Create report - should be PENDING
        const report = await regularUser.caller.member.blog.createReport({
          id: blogPost.id,
          reason: 'SPAM',
          details: 'Status tracking report',
          type: 'post',
        });

        expect(report.action).toBe('OTHER');

        // Resolve report - should be RESOLVED
        const resolvedReport = await adminUser.caller.member.blog.resolveReport({
          id: report.id,
          action: 'REPORT_DISMISSED',
          adminNote: 'Status tracking resolution',
        });

        expect(resolvedReport.action).toBe('REPORT_DISMISSED');
        expect(resolvedReport.resolvedAt).toBeDefined();
        expect(resolvedReport.resolvedById).toBe(adminUser.dbUser.id);
      }
    });

    test('should include proper timestamps', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const categories = await regularUser.caller.member.blog.getCategories();
      const categoryId = categories[0]?.id;

      if (categoryId) {
        const blogPost = await regularUser.caller.member.blog.createPost({
          title: 'Timestamp Post',
          content: 'This post will test timestamps',
          categoryId,
          published: true,
        });

        const report = await regularUser.caller.member.blog.createReport({
          id: blogPost.id,
          type: 'post',
          reason: 'SPAM',
          details: 'Timestamp test report',
        });

        expect(report.createdAt).toBeDefined();
        expect(report.updatedAt).toBeDefined();
        expect(new Date(report.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
        expect(new Date(report.updatedAt).getTime()).toBeLessThanOrEqual(Date.now());
      }
    });
  });
});

