import { type PrismaClient, type Prisma } from "@prisma/client";

// Types for activity logging
export type ActivityAction = {
  label: string;
  href: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

export type UserActivityInput = {
  userId: string | null; // null for system activities
  title: string;
  description?: string;
  icon: string;
  type: string;
  isSystem?: boolean; // If true, userId must be null
  actions?: ActivityAction[];
  metadata?: Record<string, unknown>;
};

export type AppActivityInput = {
  userId?: string;
  userName?: string;
  userEmail?: string;
  type: string;
  action: string;
  entity: string;
  entityId?: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  severity?: "info" | "warning" | "error" | "critical";
  category?: string;
};

/**
 * Logs a user-specific activity
 * This appears in the user's activity feed
 */
export async function logUserActivity(
  db: PrismaClient,
  input: UserActivityInput,
) {
  // Validate: if isSystem is true, userId must be null
  if (input.isSystem && input.userId !== null) {
    throw new Error("System activities must have userId set to null");
  }

  return await db.userActivity.create({
    data: {
      userId: input.userId,
      title: input.title,
      description: input.description,
      icon: input.icon,
      type: input.type,
      isSystem: input.isSystem ?? false,
      actions: (input.actions ?? undefined) as Prisma.InputJsonValue | undefined,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/**
 * Logs an app-wide activity for audit/admin purposes
 * This is for the complete activity log of everything happening in the app
 */
export async function logAppActivity(
  db: PrismaClient,
  input: AppActivityInput,
) {
  return await db.appActivity.create({
    data: {
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      type: input.type,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      title: input.title,
      description: input.description,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      ipAddress: input.ipAddress,
      severity: input.severity ?? "info",
      category: input.category,
    },
  });
}

/**
 * Logs both a user activity and app activity
 * Use this for actions that should appear in user feed AND be logged for audit
 */
export async function logActivity(
  db: PrismaClient,
  userActivity: UserActivityInput,
  appActivity: AppActivityInput,
) {
  await Promise.all([
    logUserActivity(db, userActivity),
    logAppActivity(db, appActivity),
  ]);
}

/**
 * Logs a system-wide activity visible to all users
 * System activities have userId set to null and are shown to everyone
 * Useful for announcements like "Registrations opened" or "New conference announced"
 */
export async function logSystemActivityForAll(
  db: PrismaClient,
  input: Omit<UserActivityInput, "isSystem" | "userId">,
) {
  // Create a single system activity with userId = null
  await db.userActivity.create({
    data: {
      userId: null, // System activities have no specific user
      title: input.title,
      description: input.description,
      icon: input.icon,
      type: input.type,
      isSystem: true,
      actions: (input.actions ?? undefined) as Prisma.InputJsonValue | undefined,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

