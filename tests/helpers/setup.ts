import { createTestUsers, type TestUsers } from "./test-user-generator";


export async function getGlobalTestUsers(): Promise<TestUsers> {
  const testUsers = await createTestUsers();
  if (!testUsers) {
    throw new Error('Test users not initialized. Make sure tests are running with proper setup.');
  }
  return testUsers;
}

