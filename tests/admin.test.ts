import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { type TestUsers, getTestUser } from './helpers/test-user-generator';

let testUsers: TestUsers;
beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
}); 


describe('Admin Router Tests', () => {
  describe('admin.dashboard.getAdminDashboard', () => {
    test('should return dashboard data for admin user', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.dashboard.getAdminDashboard();

      expect(result).toBeDefined();
      expect(result.adminName).toBe(adminUser.dbUser.name);
      expect(result.stats).toBeDefined();
      expect(result.stats.users).toBeDefined();
      expect(result.stats.conference).toBeDefined();
      expect(result.stats.totalPayments).toBeDefined();
      expect(result.recentActivity).toBeDefined();
      expect(result.recentRegistrations).toBeDefined();
    });

    test('should include user statistics', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.dashboard.getAdminDashboard();

      expect(result.stats.users.value).toBeDefined();
      expect(result.stats.users.subtitle).toBe('Total Members');
      expect(result.stats.conference.value).toBeDefined();
      expect(result.stats.conference.subtitle).toBeDefined();
      expect(result.stats.totalPayments.value).toBeDefined();
      expect(result.stats.totalPayments.subtitle).toBe('Total Collected');
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.dashboard.getAdminDashboard()
      ).rejects.toThrow();
    });
  });

  describe('admin.dashboard.getAllActivities', () => {
    test('should return paginated activities for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.dashboard.getAllActivities({
        page: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(result.activities).toBeDefined();
      expect(Array.isArray(result.activities)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.totalCount).toBeDefined();
      expect(result.pagination.totalPages).toBeDefined();
      expect(result.pagination.hasNextPage).toBeDefined();
      expect(result.pagination.hasPrevPage).toBeDefined();
    });

    test('should handle different page sizes', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.dashboard.getAllActivities({
        page: 1,
        pageSize: 5,
      });

      expect(result.pagination.pageSize).toBe(5);
      expect(result.activities.length).toBeLessThanOrEqual(5);
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.dashboard.getAllActivities({
          page: 1,
          pageSize: 10,
        })
      ).rejects.toThrow();
    });
  });

  describe('admin.members.getAll', () => {
    test('should return all members for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.members.getAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(5); // At least our test users

      // Check that our test users are included
      const testEmails = result.map(user => user.email);
      expect(testEmails).toContain('admin@vitest.com');
      expect(testEmails).toContain('regular@vitest.com');
    });

    test('should filter by role', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const adminUsers = await adminUser.caller.admin.members.getAll({ role: 'ADMIN' });
      const regularUsers = await adminUser.caller.admin.members.getAll({ role: 'USER' });

      expect(adminUsers.every(user => user.role === 'ADMIN')).toBe(true);
      expect(regularUsers.every(user => user.role === 'USER')).toBe(true);
    });

    test('should search by name and email', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const searchResults = await adminUser.caller.admin.members.getAll({
        search: 'regular'
      });

      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some(user => user.email?.includes('regular@vitest.com'))).toBe(true);
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.members.getAll()
      ).rejects.toThrow();
    });
  });

  describe('admin.members.getById', () => {
    test('should return member details for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await adminUser.caller.admin.members.getById({
        id: regularUser.dbUser.id,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(regularUser.dbUser.id);
      expect(result.email).toBe(regularUser.dbUser.email);
      expect(result.name).toBe(regularUser.dbUser.name);
      expect(result.role).toBe('USER');
      expect(result._count).toBeDefined();
      expect(result._count.registrations).toBeDefined();
      expect(result._count.blogPosts).toBeDefined();
    });

    test('should return 404 for non-existent member', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.members.getById({
          id: 'non-existent-id',
        })
      ).rejects.toThrow();
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.members.getById({
          id: regularUser.dbUser.id,
        })
      ).rejects.toThrow();
    });
  });

  describe('admin.members.update', () => {
    test('should update member details for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await adminUser.caller.admin.members.update({
        id: regularUser.dbUser.id,
        name: 'Updated Test User',
        phone: '+6791234567',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Test User');
      expect(result.phone).toBe('+6791234567');
    });

    test('should prevent admin from demoting themselves', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.members.update({
          id: adminUser.dbUser.id,
          role: 'USER',
        })
      ).rejects.toThrow();
    });

    test('should prevent duplicate email updates', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');
      const regularUser = getTestUser(testUsers, 'regularUser');
      const verifiedUser = getTestUser(testUsers, 'verifiedUser');

      await expect(
        adminUser.caller.admin.members.update({
          id: regularUser.dbUser.id,
          email: verifiedUser.dbUser.email ?? '', // Use existing email
        })
      ).rejects.toThrow();
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.members.update({
          id: regularUser.dbUser.id,
          name: 'Updated Name',
        })
      ).rejects.toThrow();
    });
  });

  describe('admin.members.getStats', () => {
    test('should return member statistics for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.members.getStats();

      expect(result).toBeDefined();
      expect(result.totalMembers).toBeDefined();
      expect(result.totalAdmins).toBeDefined();
      expect(result.verifiedMembers).toBeDefined();
      expect(result.recentMembers).toBeDefined();

      expect(result.totalMembers).toBeGreaterThanOrEqual(4); // Our regular test users
      expect(result.totalAdmins).toBeGreaterThanOrEqual(1); // Our admin test user
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.members.getStats()
      ).rejects.toThrow();
    });
  });

  describe('admin.members.delete', () => {
    test('should prevent admin from deleting themselves', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.members.delete({
          id: adminUser.dbUser.id,
        })
      ).rejects.toThrow();
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.members.delete({
          id: regularUser.dbUser.id,
        })
      ).rejects.toThrow();
    });
  });

  describe('admin.dashboard.getConferenceAnalytics', () => {
    test('should return conference analytics for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.dashboard.getConferenceAnalytics();

      // This might return null if no conferences exist, which is fine
      if (result) {
        expect(result.conference).toBeDefined();
        expect(result.summary).toBeDefined();
        expect(result.financial).toBeDefined();
        expect(result.breakdown).toBeDefined();
        expect(result.trend).toBeDefined();
        expect(result.recentRegistrations).toBeDefined();
      }
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.dashboard.getConferenceAnalytics()
      ).rejects.toThrow();
    });
  });
});
