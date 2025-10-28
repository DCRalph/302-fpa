import { generatePrismaUsers, cleanupTestUsers } from "./test-user-generator";

export async function setup() {
  console.log("[globalSetup] Setting up test users once for all workers...");
  await generatePrismaUsers();
  console.log("✅ [globalSetup] Test users ready");
}

export async function teardown() {
  console.log("[globalTeardown] Cleaning up test users once...");
  await cleanupTestUsers();
  console.log("✅ [globalTeardown] Cleaned up");
}