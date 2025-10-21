
// ============================================================================
// CATEGORIES
// ============================================================================
export const ActivityCategory = {
  AUTH: "auth",
  PROFILE: "profile",
  CONTENT: "content",
  REGISTRATION: "registration",
  CONFERENCE: "conference",
  ADMIN: "admin",
  SYSTEM: "system",
} as const;

export type ActivityCategory = (typeof ActivityCategory)[keyof typeof ActivityCategory];

// ============================================================================
// ENTITIES
// ============================================================================
export const ActivityEntity = {
  USER: "user",
  BLOG_POST: "blog_post",
  REGISTRATION: "registration",
  CONFERENCE: "conference",
  PAYMENT: "payment",
  SESSION: "session",
  COMMENT: "comment",
  ATTACHMENT: "attachment",
  REPORT: "report"
} as const;

export type ActivityEntity = (typeof ActivityEntity)[keyof typeof ActivityEntity];

// ============================================================================
// ACTIONS
// ============================================================================
export const ActivityActionEnum = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  SUBMITTED: "submitted",
  VIEWED: "viewed",
  EXPORTED: "exported",
} as const;

export type ActivityAction = (typeof ActivityActionEnum)[keyof typeof ActivityActionEnum];

// ============================================================================
// USER ACTIVITY TYPES (for user feed)
// ============================================================================
export const UserActivityType = {
  // Auth & Onboarding
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_OUT: "user_signed_out",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PASSWORD_CHANGED: "password_changed",

  // Profile
  PROFILE_UPDATED: "profile_updated",
  PROFILE_IMAGE_CHANGED: "profile_image_changed",

  // Blog Posts
  BLOG_POST_PUBLISHED: "blog_post_published",
  BLOG_POST_DRAFT_CREATED: "blog_post_draft_created",
  BLOG_POST_UPDATED: "blog_post_updated",
  BLOG_POST_DELETED: "blog_post_deleted",

  // Conferences
  CONFERENCE_ANNOUNCED: "conference_announced",
  CONFERENCE_UPDATED: "conference_updated",

  // Registrations
  CONFERENCE_REGISTRATION_SUBMITTED: "conference_registration_submitted",
  REGISTRATION_APPROVED: "registration_approved",
  REGISTRATION_DENIED: "registration_denied",
  REGISTRATION_UPDATED: "registration_updated",
  CONFERENCE_REGISTRATION_CANCELLED: "conference_registration_cancelled",
  PAYMENT_RECEIVED: "payment_received",

  // Comments & Engagement
  BLOG_COMMENT_RECEIVED: "blog_comment_received",

  // Files
  FILE_UPLOADED: "file_uploaded",
  FILE_DELETED: "file_deleted",
} as const;

export type UserActivityType = (typeof UserActivityType)[keyof typeof UserActivityType];

// ============================================================================
// APP ACTIVITY TYPES (for admin/audit log)
// ============================================================================
export const AppActivityType = {
  // Auth Events
  USER_SIGNUP: "user_signup",
  USER_SIGNIN: "user_signin",
  USER_SIGNOUT: "user_signout",
  USER_ONBOARDED: "user_onboarded",
  PASSWORD_CHANGED: "password_changed",
  SIGNIN_NEW_DEVICE: "signin_new_device",

  // Profile Events
  PROFILE_UPDATED: "profile_updated",
  PROFILE_IMAGE_UPDATED: "profile_image_updated",

  // Blog Events
  BLOG_POST_CREATED: "blog_post_created",
  BLOG_POST_PUBLISHED: "blog_post_published",
  BLOG_POST_UPDATED: "blog_post_updated",
  BLOG_POST_DELETED: "blog_post_deleted",
  BLOG_COMMENT_CREATED: "blog_comment_created",
  BLOG_COMMENT_APPROVED: "blog_comment_approved",
  BLOG_COMMENT_DELETED: "blog_comment_deleted",

  // Report Events
  REPORT_SUBMITTED: "report_submitted",
  REPORT_RESOLVED: "report_resolved",
  REPORT_DELETED: "report_deleted",

  // Conference Events
  CONFERENCE_CREATED: "conference_created",
  CONFERENCE_UPDATED: "conference_updated",
  CONFERENCE_DEACTIVATED: "conference_deactivated",
  CONFERENCE_ACTIVATED: "conference_activated",
  CONFERENCE_DELETED: "conference_deleted",

  // Registration Events
  REGISTRATION_SUBMITTED: "registration_submitted",
  REGISTRATION_APPROVED: "registration_approved",
  REGISTRATION_DENIED: "registration_denied",
  REGISTRATION_UPDATED: "registration_updated",
  REGISTRATION_CANCELLED: "registration_cancelled",
  REGISTRATION_STATUS_CHANGED: "registration_status_changed",
  REGISTRATION_PAYMENT_STATUS_CHANGED: "registration_payment_status_changed",
  REGISTRATION_NOTE_ADDED: "registration_note_added",

  // Payment Events
  PAYMENT_CREATED: "payment_created",
  PAYMENT_CONFIRMED: "payment_confirmed",
  PAYMENT_FAILED: "payment_failed",
  PAYMENT_REFUNDED: "payment_refunded",

  // Admin Events
  MEMBER_ROLE_CHANGED: "member_role_changed",
  MEMBER_UPDATED: "member_updated",
  MEMBER_DELETED: "member_deleted",
  MEMBER_EMAIL_VERIFIED: "member_email_verified",

  // System Events
  SYSTEM_SETTINGS_UPDATED: "system_settings_updated",
  DATA_EXPORTED: "data_exported",

  // File Events
  FILE_UPLOADED: "file_uploaded",
  FILE_DELETED: "file_deleted",
} as const;

export type AppActivityType = (typeof AppActivityType)[keyof typeof AppActivityType];

// ============================================================================
// ICON MAPPINGS (for consistent UI icons)
// ============================================================================
export const ActivityIcon = {
  // Auth
  [UserActivityType.USER_SIGNED_IN]: "LogIn",
  [UserActivityType.USER_SIGNED_OUT]: "LogOut",
  [UserActivityType.ONBOARDING_COMPLETED]: "UserCheck",
  [UserActivityType.PASSWORD_CHANGED]: "Lock",

  // Profile
  [UserActivityType.PROFILE_UPDATED]: "UserCog",
  [UserActivityType.PROFILE_IMAGE_CHANGED]: "Camera",

  // Blog
  [UserActivityType.BLOG_POST_PUBLISHED]: "BookOpen",
  [UserActivityType.BLOG_POST_DRAFT_CREATED]: "FileText",
  [UserActivityType.BLOG_POST_UPDATED]: "Edit",
  [UserActivityType.BLOG_POST_DELETED]: "Trash",
  [UserActivityType.BLOG_COMMENT_RECEIVED]: "MessageCircle",

  // Conference
  [UserActivityType.CONFERENCE_ANNOUNCED]: "Calendar",
  [UserActivityType.CONFERENCE_UPDATED]: "CalendarCheck",

  // Registration
  [UserActivityType.CONFERENCE_REGISTRATION_SUBMITTED]: "CheckCircle",
  [UserActivityType.REGISTRATION_APPROVED]: "CheckCircle2",
  [UserActivityType.REGISTRATION_DENIED]: "XCircle",
  [UserActivityType.REGISTRATION_UPDATED]: "Edit3",
  [UserActivityType.CONFERENCE_REGISTRATION_CANCELLED]: "XCircle",
  [UserActivityType.PAYMENT_RECEIVED]: "DollarSign",

  // Files
  [UserActivityType.FILE_UPLOADED]: "Upload",
  [UserActivityType.FILE_DELETED]: "Trash2",
} as const;

// Helper function to get icon for activity type
export function getActivityIcon(type: string): string {
  return ActivityIcon[type as keyof typeof ActivityIcon] ?? "Bell";
}

