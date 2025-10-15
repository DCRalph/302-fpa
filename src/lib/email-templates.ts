// Email template types (unchanged)
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  name: string;
  email: string;
  resetUrl: string;
  expiresIn: string;
}

export interface ConferenceInvitationEmailData {
  name: string;
  email: string;
  conferenceName: string;
  conferenceDate: string;
  registrationUrl: string;
}

export interface NotificationEmailData {
  name: string;
  email: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

// Shared inline styles for consistency
const baseContainer = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  line-height: 1.6;
  color: #111827;
  background-color: #ffffff;
  max-width: 640px;
  margin: 0 auto;
  padding: 0;
`;

const headerBar = `
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 28px 32px;
  text-align: left;
  border-radius: 12px 12px 0 0;
`;

const headerTitle = `
  color: #ffffff;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const bodyBlock = `
  background: #f9fafb;
  padding: 28px 32px;
  border-radius: 0 0 12px 12px;
`;

const card = `
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin: 18px 0;
`;

const button = `
  background: #4f46e5;
  color: #ffffff !important;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 8px;
  display: inline-block;
  font-weight: 600;
  font-size: 14px;
`;

const buttonDanger = `
  background: #dc2626;
  color: #ffffff !important;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 8px;
  display: inline-block;
  font-weight: 600;
  font-size: 14px;
`;

const muted = `
  color: #6b7280;
`;

const list = `
  padding-left: 18px;
  margin: 12px 0 0 0;
`;

// Welcome email template
export function createWelcomeEmail(
  data: WelcomeEmailData
): EmailTemplate {
  const { name, email, loginUrl } = data;

  return {
    subject: 'Welcome to Fiji Principles Association',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">Welcome to Fiji Principles Association</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Hi ${name},</h2>

            <p style="margin: 0 0 12px 0;">
              Thanks for joining Fiji Principles Association. Your account has
              been created with <strong>${email}</strong>.
            </p>

            <div style="${card}">
              <p style="margin: 0 0 12px 0;">
                You can now access your member dashboard to:
              </p>
              <ul style="${list}">
                <li>Browse member-only resources</li>
                <li>Contribute to our community discussions</li>
                <li>Register for upcoming conferences</li>
                <li>Connect with fellow members</li>
              </ul>
            </div>

            <div style="text-align: left; margin: 24px 0 12px 0;">
              <a href="${loginUrl}" style="${button}">Open Dashboard</a>
            </div>

            <p style="${muted}; margin: 20px 0 0 0;">
              If you need assistance, reply to this email and our team will be
              happy to help.
            </p>

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association</p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Fiji Principles Association

Hi ${name},

Thanks for joining Fiji Principles Association. Your account has been created with ${email}.

You can now access your member dashboard to:
- Browse member-only resources
- Contribute to our community discussions
- Register for upcoming conferences
- Connect with fellow members

Open your dashboard: ${loginUrl}

If you need assistance, reply to this email and our team will be happy to help.

Best regards,
Fiji Principles Association
    `.trim(),
  };
}

// Password reset email template
export function createPasswordResetEmail(
  data: PasswordResetEmailData
): EmailTemplate {
  const { name, email, resetUrl, expiresIn } = data;

  return {
    subject: 'Reset your Fiji Principles Association password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Reset</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">Password reset request</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Hi ${name},</h2>

            <p style="margin: 0 0 12px 0;">
              We received a request to reset the password for your Fiji
              Principles Association account (<strong>${email}</strong>).
            </p>

            <div style="text-align: left; margin: 20px 0;">
              <a href="${resetUrl}" style="${buttonDanger}">Reset password</a>
            </div>

            <p style="margin: 0 0 8px 0;"><strong>Note:</strong> This link expires in ${expiresIn}.</p>
            <p style="${muted}; margin: 0 0 12px 0;">For security, this link can be used only once.</p>

            <p style="${muted}; margin: 12px 0 0 0;">
              If you did not request a password reset, you can safely ignore this
              message—your password will remain unchanged.
            </p>

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association</p>
          </div>
        </body>
      </html>
    `,
    text: `
Password reset request

Hi ${name},

We received a request to reset the password for your Fiji Principles Association account (${email}).

Reset your password: ${resetUrl}

Note: This link expires in ${expiresIn}.
For security, this link can be used only once.

If you did not request a password reset, you can ignore this message—your password will remain unchanged.

Best regards,
Fiji Principles Association
    `.trim(),
  };
}

// Conference invitation email template
export function createConferenceInvitationEmail(
  data: ConferenceInvitationEmailData
): EmailTemplate {
  const { name, conferenceName, conferenceDate, registrationUrl } = data;

  return {
    subject: `Invitation: ${conferenceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Conference Invitation</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">Conference invitation</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Hi ${name},</h2>

            <p style="margin: 0 0 12px 0;">
              You’re invited to <strong>${conferenceName}</strong>.
            </p>

            <div style="${card}">
              <p style="margin: 0;">
                <strong>Date:</strong> ${conferenceDate}
              </p>
            </div>

            <p style="margin: 0 0 12px 0;">
              Join peers and industry experts for insights, collaboration, and
              networking.
            </p>

            <div style="text-align: left; margin: 20px 0;">
              <a href="${registrationUrl}" style="${button}">Register now</a>
            </div>

            <p style="${muted}; margin: 12px 0 0 0;">
              Seats may be limited—early registration is recommended.
            </p>

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association</p>
          </div>
        </body>
      </html>
    `,
    text: `
Conference invitation

Hi ${name},

You’re invited to ${conferenceName}.
Date: ${conferenceDate}

Join peers and industry experts for insights, collaboration, and networking.

Register now: ${registrationUrl}

Best regards,
Fiji Principles Association
    `.trim(),
  };
}

// Notification email template
export function createNotificationEmail(
  data: NotificationEmailData
): EmailTemplate {
  const { name, title, message, actionUrl, actionText } = data;

  const actionBlock =
    actionUrl && actionText
      ? `
        <div style="text-align: left; margin: 20px 0 8px 0;">
          <a href="${actionUrl}" style="${button}">${actionText}</a>
        </div>
      `
      : '';

  const actionTextFallback =
    actionUrl && actionText ? `${actionText}: ${actionUrl}` : '';

  return {
    subject: `Fiji Principles Association: ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${title}</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">${title}</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Hi ${name},</h2>

            <div style="${card}">
              <p style="margin: 0;">${message}</p>
            </div>

            ${actionBlock}

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association</p>
          </div>
        </body>
      </html>
    `,
    text: `
${title}

Hi ${name},

${message}

${actionTextFallback}

Best regards,
Fiji Principles Association
    `.trim(),
  };
}