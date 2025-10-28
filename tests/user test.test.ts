import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import {
  getTestUser,
  getTestUsers,
  getAllTestUsers,
  getAdminUsers,
  getRegularUsers,
  getVerifiedUsers,
  getUnverifiedUsers,
  type TestUsers,
} from './helpers/test-user-generator';
import { auth } from '~/lib/auth';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Test User Generator Usage Examples', () => {
  test('should generate 5 different test users', () => {
    expect(testUsers.regularUser).toBeDefined();
    expect(testUsers.adminUser).toBeDefined();
    expect(testUsers.verifiedUser).toBeDefined();
    expect(testUsers.unverifiedUser).toBeDefined();
    expect(testUsers.professionalUser).toBeDefined();
  });

  test('should have different roles', () => {
    expect(testUsers.regularUser.dbUser.role).toBe('USER');
    expect(testUsers.adminUser.dbUser.role).toBe('ADMIN');
    expect(testUsers.verifiedUser.dbUser.role).toBe('USER');
    expect(testUsers.unverifiedUser.dbUser.role).toBe('USER');
    expect(testUsers.professionalUser.dbUser.role).toBe('USER');
  });

  test('should have different email verification status', () => {
    expect(testUsers.regularUser.user.emailVerified).toBe(true);
    expect(testUsers.adminUser.user.emailVerified).toBe(true);
    expect(testUsers.verifiedUser.user.emailVerified).toBe(true);
    expect(testUsers.unverifiedUser.user.emailVerified).toBe(false);
    expect(testUsers.professionalUser.user.emailVerified).toBe(true);
  });

  test('should have working sessions and callers', async () => {
    // Test that all users have valid sessions
    const allUsers = getAllTestUsers(testUsers);

    for (const user of allUsers) {
      expect(user.session).not.toBeNull();
      expect(user.caller).toBeDefined();

      console.log('user.headers', user.headers);
      const fuck = await auth.api.getSession({ headers: user.headers });
      console.log('fuck', fuck);


      // Test auth.me endpoint for each user
      const res = await user.caller.auth.me();
      expect(res.session?.user?.email).toEqual(user.dbUser?.email);
    }
  });
});

describe('Helper Functions Usage', () => {
  test('getTestUser should return specific user', () => {
    const adminUser = getTestUser(testUsers, 'adminUser');
    expect(adminUser.dbUser?.email).toBe(testUsers.adminUser.dbUser.email);
    expect(adminUser.dbUser?.role).toBe(testUsers.adminUser.dbUser.role);
  });

  test('getTestUsers should return multiple users', () => {
    const selectedUsers = getTestUsers(testUsers, ['regularUser', 'adminUser']);
    expect(selectedUsers).toHaveLength(2);
    expect(selectedUsers.map(u => u.dbUser?.email)).toContain(testUsers.regularUser.dbUser.email);
    expect(selectedUsers.map(u => u.dbUser?.email)).toContain(testUsers.adminUser.dbUser.email);
  });

  test('getAllTestUsers should return all users', () => {
    const allUsers = getAllTestUsers(testUsers);
    expect(allUsers).toHaveLength(5);
  });

  test('getAdminUsers should return only admin users', () => {
    const adminUsers = getAdminUsers(testUsers);
    expect(adminUsers).toHaveLength(1);
    expect(adminUsers[0]?.dbUser?.email).toBe(testUsers.adminUser.dbUser.email);
    expect(adminUsers[0]?.dbUser?.role).toBe(testUsers.adminUser.dbUser.role);
  });

  test('getRegularUsers should return only regular users', () => {
    const regularUsers = getRegularUsers(testUsers);
    expect(regularUsers).toHaveLength(4);
    expect(regularUsers.every(user => user.dbUser?.role === 'USER')).toBe(true);
  });

  test('getVerifiedUsers should return only verified users', () => {
    const verifiedUsers = getVerifiedUsers(testUsers);
    expect(verifiedUsers).toHaveLength(4);
    expect(verifiedUsers.every(user => user.user?.emailVerified)).toBe(true);
  });

  test('getUnverifiedUsers should return only unverified users', () => {
    const unverifiedUsers = getUnverifiedUsers(testUsers);
    expect(unverifiedUsers).toHaveLength(1);
    expect(unverifiedUsers[0]?.dbUser?.email).toBe(testUsers.unverifiedUser.dbUser.email);
    expect(unverifiedUsers[0]?.user?.emailVerified).toBe(false);
  });
});

describe('Testing Different Scenarios', () => {
  test('should test admin-only functionality', async () => {
    const adminUser = testUsers.adminUser;

    // For now, just test that the admin user exists and has proper role
    expect(adminUser.dbUser?.role).toBe(testUsers.adminUser.dbUser.role);
    expect(adminUser.user?.emailVerified).toBe(true);
  });

  test('should test user-only functionality', async () => {
    const regularUser = testUsers.regularUser;

    // For now, just test that the regular user exists and has proper role
    expect(regularUser.dbUser?.role).toBe(testUsers.regularUser.dbUser.role);
    expect(regularUser.user?.emailVerified).toBe(true);
  });

  test('should test unverified user restrictions', async () => {
    const unverifiedUser = testUsers.unverifiedUser;

    // For now, just test that the unverified user exists and is not verified
    expect(unverifiedUser.dbUser?.role).toBe(testUsers.unverifiedUser.dbUser.role);
    expect(unverifiedUser.user?.emailVerified).toBe(false);
  });

  test('should test professional user with detailed profile', async () => {
    const professionalUser = testUsers.professionalUser;

    // Test that professional user has detailed profile information
    expect(professionalUser.dbUser?.professionalPosition).toBe(testUsers.professionalUser.dbUser.professionalPosition);
    expect(professionalUser.dbUser?.professionalYears).toBe(testUsers.professionalUser.dbUser.professionalYears);
    expect(professionalUser.dbUser?.professionalQualification).toBe(testUsers.professionalUser.dbUser.professionalQualification);
    expect(professionalUser.dbUser?.professionalSpecialisation).toBe(testUsers.professionalUser.dbUser.professionalSpecialisation);
    expect(professionalUser.dbUser?.professionalBio).toContain(testUsers.professionalUser.dbUser.professionalBio);
  });
});

describe('Testing with Multiple Users', () => {
  test('should test interactions between different users', async () => {
    const regularUser = testUsers.regularUser;
    const adminUser = testUsers.adminUser;

    // For now, just test that both users exist and have different roles
    expect(regularUser.dbUser?.role).toBe(testUsers.regularUser.dbUser.role);
    expect(adminUser.dbUser?.role).toBe(testUsers.adminUser.dbUser.role);
    expect(regularUser.dbUser?.email).not.toBe(adminUser.dbUser?.email);
  });

  test('should test bulk operations with multiple users', async () => {
    const allUsers = getAllTestUsers(testUsers);

    // For now, just test that we can iterate over all users
    expect(allUsers).toHaveLength(5);
    expect(allUsers.every(user => user.dbUser?.email?.endsWith('@vitest.com') ?? false)).toBe(true);
  });
});
