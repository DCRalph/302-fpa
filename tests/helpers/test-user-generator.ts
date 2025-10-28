import { randomUUID } from "crypto";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { makeCaller } from "~/server/api/test-helper";
import type { User as PrismaUser, UserRole } from "@prisma/client";
import type {
  Session as BetterAuthSession,
  User as BetterAuthUser,
} from "better-auth";


export interface TestUser {
  password: string;
  session: BetterAuthSession;
  user: BetterAuthUser;
  dbUser: PrismaUser;
  headers: Headers;
  caller: ReturnType<typeof makeCaller>;
}

export interface TestUsers {
  regularUser: TestUser;
  adminUser: TestUser;
  verifiedUser: TestUser;
  unverifiedUser: TestUser;
  professionalUser: TestUser;
}

export interface TestUserData {
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  phone?: string;
  school?: string;
  professionalPosition?: string;
  professionalYears?: number;
  professionalQualification?: string;
  professionalSpecialisation?: string;
  professionalBio?: string;
}

export const testUsersData: {
  [key in keyof TestUsers]: TestUserData;
} = {
  regularUser: {
    email: "regular@vitest.com",
    name: "Regular Test User",
    role: "USER",
    emailVerified: true,
    professionalPosition: "Teacher",
    professionalYears: 5,
    professionalQualification: "Bachelor of Education",
    professionalSpecialisation: "Mathematics",
    professionalBio: "Experienced mathematics teacher with 5 years of experience.",
  },
  adminUser: {
    email: "admin@vitest.com",
    name: "Admin Test User",
    role: "ADMIN",
    emailVerified: true,
    professionalPosition: "Principal",
    professionalYears: 10,
    professionalQualification: "Master of Education",
    professionalSpecialisation: "Educational Leadership",
    professionalBio: "Educational leader with extensive administrative experience.",
  },
  verifiedUser: {
    email: "verified@vitest.com",
    name: "Verified Test User",
    role: "USER",
    emailVerified: true,
    phone: "+6791234567",
    school: "Test University",
    professionalPosition: "Professor",
    professionalYears: 15,
    professionalQualification: "PhD in Physics",
    professionalSpecialisation: "Quantum Mechanics",
    professionalBio: "Distinguished professor specializing in quantum mechanics research.",
  },
  unverifiedUser: {
    email: "unverified@vitest.com",
    name: "Unverified Test User",
    role: "USER",
    emailVerified: false,
    professionalPosition: "Research Assistant",
    professionalYears: 2,
    professionalQualification: "Master of Science",
    professionalSpecialisation: "Data Science",
    professionalBio: "Early career researcher in data science.",
  },
  professionalUser: {
    email: "professional@vitest.com",
    name: "Professional Test User",
    role: "USER",
    emailVerified: true,
    phone: "+6799876543",
    school: "Professional Institute",
    professionalPosition: "Senior Lecturer",
    professionalYears: 8,
    professionalQualification: "Master of Business Administration",
    professionalSpecialisation: "Strategic Management",
    professionalBio: "Senior lecturer with expertise in strategic management and business development.",
  },
}

/**
 * Generates 5 test users with different roles and characteristics for testing.
 * Throws on any failure; does not return partials.
 */
export async function generatePrismaUsers(): Promise<PrismaUser[]> {
  await cleanupTestUsers();

  const [regularUser, adminUser, verifiedUser, unverifiedUser, professionalUser] =
    await Promise.all([
      createPrismaUser(testUsersData.regularUser),
      createPrismaUser(testUsersData.adminUser),
      createPrismaUser(testUsersData.verifiedUser),
      createPrismaUser(testUsersData.unverifiedUser),
      createPrismaUser(testUsersData.professionalUser),
    ]);


  return [regularUser, adminUser, verifiedUser, unverifiedUser, professionalUser];
}


/**
 * Creates a single test user with the specified properties.
 * Returns a fully-populated, non-nullable TestUser or throws on failure.
 */
async function createPrismaUser(userData: TestUserData): Promise<PrismaUser> {
  const passwordRaw = userData.email;
  const hashedPassword = await (await auth.$context).password.hash(passwordRaw);

  // Create user + credential account
  const user = await db.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      emailVerified: userData.emailVerified,
      role: userData.role,
      phone: userData.phone,
      school: userData.school,
      professionalPosition: userData.professionalPosition,
      professionalYears: userData.professionalYears,
      professionalQualification: userData.professionalQualification,
      professionalSpecialisation: userData.professionalSpecialisation,
      professionalBio: userData.professionalBio,
      accounts: {
        create: {
          id: randomUUID(),
          providerId: "credential",
          accountId: userData.email,
          password: hashedPassword,
        },
      },
    },
  });

  return user
}

export async function createTestUsers(): Promise<TestUsers> {
  const [regularUser, adminUser, verifiedUser, unverifiedUser, professionalUser] =
    await Promise.all([
      createTestUser(testUsersData.regularUser),
      createTestUser(testUsersData.adminUser),
      createTestUser(testUsersData.verifiedUser),
      createTestUser(testUsersData.unverifiedUser),
      createTestUser(testUsersData.professionalUser),
    ]);

  return {
    regularUser,
    adminUser,
    verifiedUser,
    unverifiedUser,
    professionalUser,
  };
}


export async function createTestUser(userData: TestUserData): Promise<TestUser> {
  const prismaUser = await db.user.findFirst({
    where: { email: userData.email },
  });
  if (!prismaUser) {
    throw new Error(`User with email ${userData.email} not found`);
  }

  // Sign in to get session and cookie
  const signInRes = await auth.api.signInEmail({
    body: { email: userData.email, password: userData.email },
    returnHeaders: true,
  });

  const headersFromSignIn = new Headers(signInRes.headers);
  const setCookie = headersFromSignIn.get("Set-Cookie");
  if (!setCookie) {
    throw new Error("Sign-in did not return Set-Cookie header");
  }

  const authTokenPart = setCookie
    .split(";")
    .map((s) => s.trim())
    .find((c) => c.startsWith("auth_token="));

  if (!authTokenPart) {
    throw new Error("auth_token cookie not found after sign-in");
  }

  const authTokenValue = authTokenPart.split("=")[1];
  if (!authTokenValue) {
    throw new Error("auth_token value missing");
  }

  const headers = new Headers();
  // Set both cookie formats that Better Auth might expect
  headers.set("Cookie", `auth_token=${authTokenValue}; __Secure-auth_token=${authTokenValue}`);
  headers.set("user-agent", "vitest");
  headers.set("host", "localhost:3000");
  headers.set("origin", "http://localhost:3000");
  headers.set("referer", "http://localhost:3000");

  const sessionRes = await auth.api.getSession({ headers });
  if (!sessionRes?.user || !sessionRes?.session) {
    throw new Error("Failed to retrieve authenticated session");
  }

  const caller = makeCaller({
    dbUser: prismaUser,
    session: sessionRes,
    headers,
  });

  return {
    password: userData.email,
    session: sessionRes.session,
    user: sessionRes.user,
    dbUser: prismaUser,
    headers,
    caller,
  };
}

/**
 * Cleans up all test users from the database.
 * Call this in beforeEach/afterEach hooks.
 */
export async function cleanupTestUsers(): Promise<void> {
  const testEmails = Object.values(testUsersData).map((user) => user.email);

  await db.user.deleteMany({
    where: { email: { in: testEmails } },
  });
}

/**
 * Helper functions: they now operate on non-nullable TestUser.
 */

export function getTestUser(
  testUsers: TestUsers,
  userType: keyof TestUsers
): TestUser {
  return testUsers[userType];
}

export function getTestUsers(
  testUsers: TestUsers,
  userTypes: (keyof TestUsers)[]
): TestUser[] {
  return userTypes.map((type) => testUsers[type]);
}

export function getAllTestUsers(testUsers: TestUsers): TestUser[] {
  return Object.values(testUsers) as TestUser[];
}

export function getAdminUsers(testUsers: TestUsers): TestUser[] {
  return getAllTestUsers(testUsers).filter((u) => u.dbUser.role === "ADMIN");
}

export function getRegularUsers(testUsers: TestUsers): TestUser[] {
  return getAllTestUsers(testUsers).filter((u) => u.dbUser.role === "USER");
}

export function getVerifiedUsers(testUsers: TestUsers): TestUser[] {
  // Prefer DB truth for emailVerified; session.user.emailVerified may differ by provider
  return getAllTestUsers(testUsers).filter((u) => u.dbUser.emailVerified);
}

export function getUnverifiedUsers(testUsers: TestUsers): TestUser[] {
  return getAllTestUsers(testUsers).filter((u) => !u.dbUser.emailVerified);
}

