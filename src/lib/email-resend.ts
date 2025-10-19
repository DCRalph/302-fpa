import { Resend } from 'resend';
import { env } from '~/env';
import {
  createWelcomeEmail,
  createPasswordResetEmail,
  createConferenceInvitationEmail,
  createNotificationEmail,
  type WelcomeEmailData,
  type PasswordResetEmailData,
  type ConferenceInvitationEmailData,
  type NotificationEmailData
} from './email-templates';

// Create Resend instance
export const resend = new Resend(env.RESEND_API_KEY);
// export const resend = new Resend("d");

// Email configuration
export const EMAIL_CONFIG = {
  from: env.RESEND_FROM_EMAIL,
  replyTo: env.RESEND_REPLY_EMAIL,
  // from: "Fiji Principles association <no-reply@fijiprinciples.org>",
  // replyTo: "support@fijiprinciples.org",
} as const;


// Helper function to send emails with error handling
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text,
      replyTo: replyTo ?? EMAIL_CONFIG.replyTo,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}


// Convenience functions for sending common emails
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const template = createWelcomeEmail(data);
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const template = createPasswordResetEmail(data);
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendConferenceInvitationEmail(data: ConferenceInvitationEmailData) {
  const template = createConferenceInvitationEmail(data);
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendNotificationEmail(data: NotificationEmailData) {
  const template = createNotificationEmail(data);
  return sendEmail({
    to: data.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// Bulk email sending function
export async function sendBulkEmails({
  recipients,
  subject,
  html,
  text,
  replyTo,
}: {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const results = [];
  const batchSize = 10; // Resend allows up to 50 recipients per batch

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    try {
      const result = await sendEmail({
        to: batch,
        subject,
        html,
        text,
        replyTo,
      });
      results.push({ batch, success: true, result });
    } catch (error) {
      results.push({ batch, success: false, error });
    }
  }

  return results;
}

