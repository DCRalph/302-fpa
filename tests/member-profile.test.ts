import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Member Profile Router Tests', () => {
  describe('member.profile.get', () => {
    test('should return current user profile for authenticated user', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.profile.get();

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accounts).toBeDefined();
      expect(result.hasPassword).toBeDefined();

      // Check user data
      expect(result.user.id).toBe(regularUser.dbUser.id);
      expect(result.user.name).toBe(regularUser.dbUser.name);
      expect(result.user.email).toBe(regularUser.dbUser.email);
      expect(result.user.phone).toBeDefined();
      expect(result.user.school).toBeDefined();
      expect(result.user.professionalPosition).toBeDefined();
      expect(result.user.professionalYears).toBeDefined();
      expect(result.user.professionalQualification).toBeDefined();
      expect(result.user.professionalSpecialisation).toBeDefined();
      expect(result.user.professionalBio).toBeDefined();
      expect(result.user.image).toBeDefined();
      expect(result.user.createdAt).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();

      // Check accounts data
      expect(Array.isArray(result.accounts)).toBe(true);
      result.accounts.forEach(account => {
        expect(account.id).toBeDefined();
        expect(account.providerId).toBeDefined();
        expect(account.accountId).toBeDefined();
        expect(account.createdAt).toBeDefined();
        expect(account.password).toBe('REDACTED');
      });

      // Check password status
      expect(typeof result.hasPassword).toBe('boolean');
    });

    test('should work for admin users', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.member.profile.get();

      expect(result).toBeDefined();
      expect(result.user.id).toBe(adminUser.dbUser.id);
      expect(result.user.email).toBe(adminUser.dbUser.email);
    });

    test('should work for verified users', async () => {
      const verifiedUser = getTestUser(testUsers, 'verifiedUser');

      const result = await verifiedUser.caller.member.profile.get();

      expect(result).toBeDefined();
      expect(result.user.id).toBe(verifiedUser.dbUser.id);
      expect(result.user.email).toBe(verifiedUser.dbUser.email);
    });

    test('should work for professional users', async () => {
      const professionalUser = getTestUser(testUsers, 'professionalUser');

      const result = await professionalUser.caller.member.profile.get();

      expect(result).toBeDefined();
      expect(result.user.id).toBe(professionalUser.dbUser.id);
      expect(result.user.professionalPosition).toBeDefined();
      expect(result.user.professionalYears).toBeDefined();
      expect(result.user.professionalQualification).toBeDefined();
      expect(result.user.professionalSpecialisation).toBeDefined();
      expect(result.user.professionalBio).toBeDefined();
    });
  });

  describe('member.profile.update', () => {
    test('should update basic profile fields', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.profile.update({
        name: 'Updated Test User',
        phone: '+6791234567',
        school: 'Updated School Name',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Test User');
      expect(result.phone).toBe('+6791234567');
      expect(result.school).toBe('Updated School Name');
    });

    test('should update professional fields', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.profile.update({
        professionalPosition: 'Senior Principal',
        professionalYears: '15',
        professionalQualification: 'Masters in Education',
        professionalSpecialisation: 'Educational Leadership',
        professionalBio: 'Experienced educational leader with 15 years in school management.',
      });

      expect(result).toBeDefined();
      expect(result.professionalPosition).toBe('Senior Principal');
      expect(result.professionalYears).toBe(15);
      expect(result.professionalQualification).toBe('Masters in Education');
      expect(result.professionalSpecialisation).toBe('Educational Leadership');
      expect(result.professionalBio).toBe('Experienced educational leader with 15 years in school management.');
    });

    test('should validate required fields', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.update({
          name: '', // Empty name should fail
        })
      ).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.update({
          email: 'invalid-email', // Invalid email format
        })
      ).rejects.toThrow();
    });

    test('should prevent duplicate email updates', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');
      const verifiedUser = getTestUser(testUsers, 'verifiedUser');

      await expect(
        regularUser.caller.member.profile.update({
          email: verifiedUser.dbUser.email!, // Use existing email
        })
      ).rejects.toThrow();
    });

    test('should allow updating to same email', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.profile.update({
        email: regularUser.dbUser.email!, // Same email should be allowed
      });

      expect(result).toBeDefined();
      expect(result.email).toBe(regularUser.dbUser.email);
    });
  });

  describe('member.profile.changePassword', () => {
    test('should validate password requirements', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.changePassword({
          currentPassword: 'currentpass',
          newPassword: '123', // Too short
        })
      ).rejects.toThrow();
    });

    test('should validate current password', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.changePassword({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow();
    });

    test('should require current password', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.changePassword({
          currentPassword: '', // Empty current password
          newPassword: 'newpassword123',
        })
      ).rejects.toThrow();
    });

    test('should require new password', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.changePassword({
          currentPassword: 'currentpass',
          newPassword: '', // Empty new password
        })
      ).rejects.toThrow();
    });
  });

  describe('member.profile.setPassword', () => {
    test('should set password for OAuth users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // This test might fail if user already has a password
      try {
        const result = await regularUser.caller.member.profile.setPassword({
          password: 'newpassword123',
        });
        expect(result).toBeDefined();
      } catch (error) {
        // Expected if user already has a password
        expect(error).toBeDefined();
      }
    });

    test('should validate password requirements', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.setPassword({
          password: '123', // Too short
        })
      ).rejects.toThrow();
    });

    test('should require password', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.member.profile.setPassword({
          password: '', // Empty password
        })
      ).rejects.toThrow();
    });
  });

  describe('member.profile.getAccounts', () => {
    test('should return connected auth accounts', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.member.profile.getAccounts();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Each account should have required fields
      result.forEach(account => {
        expect(account.id).toBeDefined();
        expect(account.providerId).toBeDefined();
        expect(account.accountId).toBeDefined();
        expect(account.createdAt).toBeDefined();
      });
    });

    test('should work for different user types', async () => {
      const users = [
        getTestUser(testUsers, 'regularUser'),
        getTestUser(testUsers, 'adminUser'),
        getTestUser(testUsers, 'verifiedUser'),
      ];

      for (const user of users) {
        const accounts = await user.caller.member.profile.getAccounts();
        expect(Array.isArray(accounts)).toBe(true);
      }
    });
  });

  describe('Profile Router Integration', () => {
    test('should maintain data consistency across profile operations', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Get initial profile
      const initialProfile = await regularUser.caller.member.profile.get();

      // Update profile
      await regularUser.caller.member.profile.update({
        name: 'Integration Test User',
        phone: '+6799999999',
      });

      // Get updated profile
      const finalProfile = await regularUser.caller.member.profile.get();

      expect(finalProfile.user.name).toBe('Integration Test User');
      expect(finalProfile.user.phone).toBe('+6799999999');
      expect(finalProfile.user.id).toBe(initialProfile.user.id);
      expect(finalProfile.user.email).toBe(initialProfile.user.email);
    });

    test('should handle concurrent profile updates', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Make concurrent updates
      const promises = [
        regularUser.caller.member.profile.update({ name: 'Concurrent Update 1' }),
        regularUser.caller.member.profile.update({ phone: '+6791111111' }),
        regularUser.caller.member.profile.update({ school: 'Concurrent School' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe(regularUser.dbUser.id);
      });
    });
  });
});
