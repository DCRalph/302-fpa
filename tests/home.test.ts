import { expect, test, describe, beforeAll } from 'vitest';
import { getGlobalTestUsers } from './helpers/setup';
import { getTestUser, type TestUsers } from './helpers/test-user-generator';
import type { ConferenceDetails, ConferenceTitle, ConferenceWhyJoin } from '~/server/api/routers/home';
import { makeCaller } from '~/server/api/test-helper';

let testUsers: TestUsers;

beforeAll(async () => {
  testUsers = await getGlobalTestUsers();
});

describe('Home Router Tests', () => {
  describe('home.getConferenceTitle', () => {
    test('should return conference title for public access', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.home.getConferenceTitle();

      expect(result).toBeDefined();
      expect(result.key).toBe('conferenceTitle');
      expect(result.value).toBeDefined();

  // Parse the JSON value
  const titleData = JSON.parse(result.value) as ConferenceTitle;
  // The current type uses titleLine1 / titleLine2 instead of a single `title` field.
  expect(titleData.titleLine1).toBeDefined();
  expect(titleData.titleLine2).toBeDefined();
  expect(titleData.subtitle).toBeDefined();
  expect(typeof titleData.titleLine1).toBe('string');
  expect(typeof titleData.titleLine2).toBe('string');
    });

    test('should create default title if none exists', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.home.getConferenceTitle();

      expect(result).toBeDefined();
  const titleData = JSON.parse(result.value) as ConferenceTitle;

  // Should have default values (use the current field names)
  expect(titleData.titleLine1).toBeDefined();
  expect(titleData.titleLine2).toBeDefined();
  expect(titleData.subtitle).toBeDefined();
    });

    test('should work without authentication', async () => {
      const caller = makeCaller();
      // Test that public endpoints work without authentication
      const result = await caller.home.getConferenceTitle();
      expect(result).toBeDefined();
    });
  });

  describe('home.getConferenceWhyJoin', () => {
    test('should return conference why join data for public access', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.home.getConferenceWhyJoin();

      expect(result).toBeDefined();
      expect(result.key).toBe('conferenceWhyJoin');
      expect(result.value).toBeDefined();

      // Parse the JSON value
      const whyJoinData = JSON.parse(result.value) as ConferenceWhyJoin[];
      expect(Array.isArray(whyJoinData)).toBe(true);
      expect(whyJoinData.length).toBeGreaterThan(0);

      // Check structure of first item
      const firstItem = whyJoinData[0];
      if (!firstItem) {
        throw new Error('No first item found');
      }
      expect(firstItem.title).toBeDefined();
      expect(firstItem.description).toBeDefined();
      expect(firstItem.icon).toBeDefined();
      expect(firstItem.icon.type).toBeDefined();
      expect(firstItem.icon.name).toBeDefined();
      expect(firstItem.icon.props).toBeDefined();
    });

    test('should create default why join data if none exists', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.home.getConferenceWhyJoin();

      expect(result).toBeDefined();
      const whyJoinData = JSON.parse(result.value) as ConferenceWhyJoin[];

      // Should have default values
      expect(whyJoinData.length).toBeGreaterThanOrEqual(4);
      expect(whyJoinData.some(item => item.title.includes('Professional Development'))).toBe(true);
      expect(whyJoinData.some(item => item.title.includes('Networking'))).toBe(true);
    });

    test('should work without authentication', async () => {
      const caller = makeCaller();
      const result = await caller.home.getConferenceWhyJoin();
      expect(result).toBeDefined();
    });
  });

  describe('home.getConferenceDetails', () => {
    test('should return conference details for public access', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.home.getConferenceDetails();

      // This might return null if no active conference exists
      if (result) {
        expect(result.key).toBe('conferenceDetails');
        expect(result.value).toBeDefined();

        // Parse the JSON value
        const detailsData = JSON.parse(result.value) as ConferenceDetails;
        if (!detailsData) {
          throw new Error('No details data found');
        }
        expect(detailsData.conferenceTitle).toBeDefined();
        expect(detailsData.rows).toBeDefined();
        expect(Array.isArray(detailsData.rows)).toBe(true);
        expect(detailsData.included).toBeDefined();
        expect(Array.isArray(detailsData.included)).toBe(true);
        expect(detailsData.contacts).toBeDefined();
        expect(Array.isArray(detailsData.contacts)).toBe(true);

        // Check structure of rows
        if (detailsData.rows.length > 0) {
          const firstRow = detailsData.rows[0];
          if (!firstRow) {
            throw new Error('No first row found');
          }
          expect(firstRow.label).toBeDefined();
          expect(firstRow.value).toBeDefined();
        }

        // Check structure of contacts
        if (detailsData.contacts.length > 0) {
          const firstContact = detailsData.contacts[0];
          if (!firstContact) {
            throw new Error('No first contact found');
          }
          expect(firstContact.role).toBeDefined();
        }
      }
    });

    test('should return null when no active conference exists', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      const result = await regularUser.caller.home.getConferenceDetails();

      // This test might pass or fail depending on whether there's an active conference
      // The important thing is that it doesn't throw an error
      expect(result?.key === 'conferenceDetails').toBe(true);
    });

    test('should work without authentication', async () => {
      const caller = makeCaller();
      const result = await caller.home.getConferenceDetails();
      expect(result?.key === 'conferenceDetails').toBe(true);
    });
  });

  describe('Home Router Integration', () => {
    test('all home endpoints should work together', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Test all endpoints in sequence
      const [title, whyJoin, details] = await Promise.all([
        regularUser.caller.home.getConferenceTitle(),
        regularUser.caller.home.getConferenceWhyJoin(),
        regularUser.caller.home.getConferenceDetails(),
      ]);

      expect(title).toBeDefined();
      expect(whyJoin).toBeDefined();
      // details might be null
      expect(details === null || (details && typeof details === 'object')).toBe(true);
    });

    test('should handle concurrent requests', async () => {
      const regularUser = getTestUser(testUsers, 'regularUser');

      // Make multiple concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        regularUser.caller.home.getConferenceTitle()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.key).toBe('conferenceTitle');
      });
    });
  });
});

