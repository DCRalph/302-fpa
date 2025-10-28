import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Admin Conference Router Tests', () => {
  describe('admin.conference.getAll', () => {
    test('should return all conferences for admin user', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.conference.getAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Each conference should have required fields
      result.forEach(conference => {
        expect(conference.id).toBeDefined();
        expect(conference.name).toBeDefined();
        expect(conference.description).toBeDefined();
        expect(conference.startDate).toBeDefined();
        expect(conference.endDate).toBeDefined();
        expect(conference.location).toBeDefined();
        expect(conference.priceCents).toBeDefined();
        expect(conference.currency).toBeDefined();
        expect(conference.isActive).toBeDefined();
        expect(conference.maxRegistrations).toBeDefined();
        expect(conference.registrationStartDate).toBeDefined();
        expect(conference.registrationEndDate).toBeDefined();
        expect(conference.bankTransferAccountName).toBeDefined();
        expect(conference.bankTransferBranch).toBeDefined();
        expect(conference.bankTransferAccountNumber).toBeDefined();
        expect(conference.createdAt).toBeDefined();
        expect(conference.updatedAt).toBeDefined();
        expect(conference.contacts).toBeDefined();
        expect(Array.isArray(conference.contacts)).toBe(true);
        expect(conference._count).toBeDefined();
        expect(conference._count.registrations).toBeDefined();
      });
    });

    test('should be ordered by creation date (latest first)', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.conference.getAll();

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const current = new Date(result[i]!.createdAt);
          const next = new Date(result[i + 1]!.createdAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.conference.getAll()
      ).rejects.toThrow();
    });

    test('should include contact information', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const result = await adminUser.caller.admin.conference.getAll();

      result.forEach(conference => {
        conference.contacts.forEach(contact => {
          expect(contact.id).toBeDefined();
          expect(contact.name).toBeDefined();
          expect(contact.fields).toBeDefined();
        });
      });
    });
  });

  describe('admin.conference.getById', () => {
    test('should return conference details for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // First get all conferences to find one to test with
      const conferences = await adminUser.caller.admin.conference.getAll();

      if (conferences.length > 0) {
        const conferenceId = conferences[0]!.id;
        const result = await adminUser.caller.admin.conference.getById({
          id: conferenceId,
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(conferenceId);
        expect(result.name).toBeDefined();
        expect(result.description).toBeDefined();
        expect(result.startDate).toBeDefined();
        expect(result.endDate).toBeDefined();
        expect(result.location).toBeDefined();
        expect(result.priceCents).toBeDefined();
        expect(result.currency).toBeDefined();
        expect(result.isActive).toBeDefined();
        expect(result.maxRegistrations).toBeDefined();
        expect(result.registrationStartDate).toBeDefined();
        expect(result.registrationEndDate).toBeDefined();
        expect(result.bankTransferAccountName).toBeDefined();
        expect(result.bankTransferBranch).toBeDefined();
        expect(result.bankTransferAccountNumber).toBeDefined();
        expect(result.contacts).toBeDefined();
        expect(Array.isArray(result.contacts)).toBe(true);
        expect(result._count).toBeDefined();
        expect(result._count.registrations).toBeDefined();
      }
    });

    test('should return 404 for non-existent conference', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.getById({
          id: 'non-existent-conference-id',
        })
      ).rejects.toThrow();
    });

    test('should validate conference ID', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.getById({
          id: '', // Empty ID
        })
      ).rejects.toThrow();
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.conference.getById({
          id: 'some-conference-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('admin.conference.create', () => {
    test('should create a new conference for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      const conferenceData = {
        name: 'Test Conference 2025',
        description: 'A test conference for testing purposes',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
        location: 'Test Location',
        priceCents: 50000, // $500.00
        currency: 'FJD',
        isActive: true,
        maxRegistrations: 100,
        registrationStartDate: new Date('2025-01-01'),
        registrationEndDate: new Date('2025-05-31'),
        bankTransferAccountName: 'Test Account',
        bankTransferBranch: 'Test Branch',
        bankTransferAccountNumber: '1234567890',
        contacts: [
          {
            name: 'Test Contact',
            fields: {
              name: 'John Doe',
              phone: '+6791234567',
              email: 'john@test.com',
            },
          },
        ],
      };

      const result = await adminUser.caller.admin.conference.create(conferenceData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(conferenceData.name);
      expect(result.description).toBe(conferenceData.description);
      expect(result.startDate).toEqual(conferenceData.startDate);
      expect(result.endDate).toEqual(conferenceData.endDate);
      expect(result.location).toBe(conferenceData.location);
      expect(result.priceCents).toBe(conferenceData.priceCents);
      expect(result.currency).toBe(conferenceData.currency);
      expect(result.isActive).toBe(conferenceData.isActive);
      expect(result.maxRegistrations).toBe(conferenceData.maxRegistrations);
      expect(result.registrationStartDate).toEqual(conferenceData.registrationStartDate);
      expect(result.registrationEndDate).toEqual(conferenceData.registrationEndDate);
      expect(result.bankTransferAccountName).toBe(conferenceData.bankTransferAccountName);
      expect(result.bankTransferBranch).toBe(conferenceData.bankTransferBranch);
      expect(result.bankTransferAccountNumber).toBe(conferenceData.bankTransferAccountNumber);
      expect(result.contacts).toHaveLength(1);
      expect(result.contacts[0]!.name).toBe('Test Contact');
    });

    test('should validate required fields', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.create({
          name: '', // Empty name
          description: 'Test description',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
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

    test('should validate date ranges', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.create({
          name: 'Test Conference',
          description: 'Test description',
          startDate: new Date('2025-06-03'), // End date before start date
          endDate: new Date('2025-06-01'),
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

    test('should validate registration date ranges', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

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
          maxRegistrations: 100,
          registrationStartDate: new Date('2025-05-31'), // Registration end before start
          registrationEndDate: new Date('2025-01-01'),
          bankTransferAccountName: 'Test Account',
          bankTransferBranch: 'Test Branch',
          bankTransferAccountNumber: '1234567890',
          contacts: [],
        })
      ).rejects.toThrow();
    });

    test('should validate price', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

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
    });

    test('should validate max registrations', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

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

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.conference.create({
          name: 'Test Conference',
          description: 'Test description',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-03'),
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
  });

  describe('admin.conference.update', () => {
    test('should update conference details for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // First create a conference
      const conferenceData = {
        name: 'Original Conference Name',
        description: 'Original description',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
        location: 'Original Location',
        priceCents: 50000,
        currency: 'FJD',
        isActive: true,
        maxRegistrations: 100,
        registrationStartDate: new Date('2025-01-01'),
        registrationEndDate: new Date('2025-05-31'),
        bankTransferAccountName: 'Original Account',
        bankTransferBranch: 'Original Branch',
        bankTransferAccountNumber: '1234567890',
        contacts: [],
      };

      const createdConference = await adminUser.caller.admin.conference.create(conferenceData);

      // Update the conference
      const updateData = {
        id: createdConference.id,
        name: 'Updated Conference Name',
        description: 'Updated description',
        location: 'Updated Location',
        priceCents: 75000, // $750.00
        maxRegistrations: 150,
      };

      const result = await adminUser.caller.admin.conference.update(updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdConference.id);
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
      expect(result.location).toBe(updateData.location);
      expect(result.priceCents).toBe(updateData.priceCents);
      expect(result.maxRegistrations).toBe(updateData.maxRegistrations);
    });

    test('should return 404 for non-existent conference', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.update({
          id: 'non-existent-conference-id',
          name: 'Updated Name',
        })
      ).rejects.toThrow();
    });

    test('should validate conference ID', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.update({
          id: '', // Empty ID
          name: 'Updated Name',
        })
      ).rejects.toThrow();
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.conference.update({
          id: 'some-conference-id',
          name: 'Updated Name',
        })
      ).rejects.toThrow();
    });
  });

  describe('admin.conference.delete', () => {
    test('should delete conference for admin', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // First create a conference
      const conferenceData = {
        name: 'Conference to Delete',
        description: 'This conference will be deleted',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-03'),
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
      };

      const createdConference = await adminUser.caller.admin.conference.create(conferenceData);

      // Delete the conference
      const result = await adminUser.caller.admin.conference.delete({
        id: createdConference.id,
      });

      expect(result.isActive).toBe(false);
    });

    test('should return 404 for non-existent conference', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.delete({
          id: 'non-existent-conference-id',
        })
      ).rejects.toThrow();
    });

    test('should validate conference ID', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      await expect(
        adminUser.caller.admin.conference.delete({
          id: '', // Empty ID
        })
      ).rejects.toThrow();
    });

    test('should reject access for regular users', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      await expect(
        regularUser.caller.admin.conference.delete({
          id: 'some-conference-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('Conference Router Integration', () => {
    test('should maintain data consistency across conference operations', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Create a conference
      const conferenceData = {
        name: 'Integration Test Conference',
        description: 'Testing integration',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-03'),
        location: 'Integration Test Location',
        priceCents: 60000,
        currency: 'FJD',
        isActive: true,
        maxRegistrations: 200,
        registrationStartDate: new Date('2025-02-01'),
        registrationEndDate: new Date('2025-06-30'),
        bankTransferAccountName: 'Integration Account',
        bankTransferBranch: 'Integration Branch',
        bankTransferAccountNumber: '9876543210',
        contacts: [],
      };

      const createdConference = await adminUser.caller.admin.conference.create(conferenceData);

      // Get the conference by ID
      const retrievedConference = await adminUser.caller.admin.conference.getById({
        id: createdConference.id,
      });

      expect(retrievedConference.id).toBe(createdConference.id);
      expect(retrievedConference.name).toBe(conferenceData.name);

      // Update the conference
      const updatedConference = await adminUser.caller.admin.conference.update({
        id: createdConference.id,
        name: 'Updated Integration Test Conference',
      });

      expect(updatedConference.name).toBe('Updated Integration Test Conference');

      // Verify the update in the list
      const allConferences = await adminUser.caller.admin.conference.getAll();
      const foundConference = allConferences.find(c => c.id === createdConference.id);
      expect(foundConference?.name).toBe('Updated Integration Test Conference');

      // Clean up - delete the conference
      await adminUser.caller.admin.conference.delete({
        id: createdConference.id,
      });
    });

    test('should handle concurrent conference operations', async () => {
      const adminUser = getTestUser(testUsers, 'adminUser');

      // Make concurrent requests
      const promises = [
        adminUser.caller.admin.conference.getAll(),
        adminUser.caller.admin.conference.getAll(),
        adminUser.caller.admin.conference.getAll(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});

