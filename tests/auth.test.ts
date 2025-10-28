import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from "./helpers/setup"
import { getTestUser, getAdminUsers, getRegularUsers, type TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers;
beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
}); 

describe('Auth Router Tests', () => {
  describe('auth.me endpoint', () => {
    test('should return user session and dbUser for authenticated admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.auth.me();

      expect(result.session).toBeDefined();
      expect(result.dbUser).toBeDefined();
      expect(result.session?.user?.email).toBe(adminUser.user.email);
      expect(result.dbUser?.email).toBe(adminUser.dbUser.email);
      expect(result.dbUser?.role).toBe('ADMIN');
    });

    test('should return user session and dbUser for authenticated regular user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.auth.me();

      expect(result.session).toBeDefined();
      expect(result.dbUser).toBeDefined();
      expect(result.session?.user?.email).toBe(regularUser.user.email);
      expect(result.dbUser?.email).toBe(regularUser.dbUser.email);
      expect(result.dbUser?.role).toBe('USER');
    });

    test('should return user session and dbUser for verified user', async () => {
      const verifiedUser = getTestUser(testUsers, 'verifiedUser');

      const result = await verifiedUser.caller.auth.me();

      expect(result.session).toBeDefined();
      expect(result.dbUser).toBeDefined();
      expect(result.session?.user?.email).toBe(verifiedUser.user.email);
      expect(result.dbUser?.email).toBe(verifiedUser.dbUser.email);
      expect(result.dbUser?.emailVerified).toBe(true);
    });

    test('should return user session and dbUser for unverified user', async () => {
      const unverifiedUser = getTestUser(testUsers, 'unverifiedUser');

      const result = await unverifiedUser.caller.auth.me();

      expect(result.session).toBeDefined();
      expect(result.dbUser).toBeDefined();
      expect(result.session?.user?.email).toBe(unverifiedUser.user.email);
      expect(result.dbUser?.email).toBe(unverifiedUser.dbUser.email);
      expect(result.dbUser?.emailVerified).toBe(false);
    });

    test('should return user session and dbUser for professional user', async () => {
      const professionalUser = getTestUser(testUsers, 'professionalUser');

      const result = await professionalUser.caller.auth.me();

      expect(result.session).toBeDefined();
      expect(result.dbUser).toBeDefined();
      expect(result.session?.user?.email).toBe(professionalUser.user.email);
      expect(result.dbUser?.email).toBe(professionalUser.dbUser.email);
      expect(result.dbUser?.professionalPosition).toBeDefined();
    });
  });

  describe('auth.requestPasswordReset endpoint', () => {
    test('should successfully request password reset for existing user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.auth.requestPasswordReset({
        email: regularUser.dbUser.email!,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('password reset link has been sent');
    });

    test('should handle password reset request for non-existing user gracefully', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // This should not throw an error even for non-existing users
      // (Better Auth handles this internally)
      const result = await regularUser.caller.auth.requestPasswordReset({
        email: 'nonexistent@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('password reset link has been sent');
    });

    test('should validate email format', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.auth.requestPasswordReset({
          email: 'invalid-email',
        })
      ).rejects.toThrow();
    });
  });

  describe('auth.resetPassword endpoint', () => {
    test('should validate password requirements', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.auth.resetPassword({
          token: 'valid-token',
          password: '123', // Too short
        })
      ).rejects.toThrow();
    });

    test('should validate token format', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.auth.resetPassword({
          token: '', // Empty token
          password: 'validpassword123',
        })
      ).rejects.toThrow();
    });
  });

  describe('Authentication state consistency', () => {
    test('all test users should have consistent session and dbUser data', async () => {
      const allUsers = getRegularUsers(testUsers).concat(getAdminUsers(testUsers));

      for (const user of allUsers) {
        const result = await user.caller.auth.me();

        // Session and dbUser should match
        expect(result.session?.user?.id).toBe(result.dbUser?.id);
        expect(result.session?.user?.email).toBe(result.dbUser?.email);

        // Role should be consistent
        expect(result.dbUser?.role).toBe(user.dbUser.role);

        // Email verification should be consistent
        expect(result.dbUser?.emailVerified).toBe(user.dbUser.emailVerified);
      }
    });

    test('admin users should have ADMIN role', async () => {
      const adminUsers = getAdminUsers(testUsers);

      for (const admin of adminUsers) {
        const result = await admin.caller.auth.me();
        expect(result.dbUser?.role).toBe('ADMIN');
      }
    });

    test('regular users should have USER role', async () => {
      const regularUsers = getRegularUsers(testUsers);

      for (const user of regularUsers) {
        const result = await user.caller.auth.me();
        expect(result.dbUser?.role).toBe('USER');
      }
    });
  });
});
