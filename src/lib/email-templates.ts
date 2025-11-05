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

export interface OnboardingWelcomeEmailData {
  name: string;
  email: string;
  school: string;
  dashboardUrl: string;
}

export interface ConferenceRegistrationSuccessEmailData {
  name: string;
  email: string;
  conferenceName: string;
  conferenceDate: string;
  conferenceLocation: string;
  registrationId: string;
  paymentMethod: string;
  dashboardUrl: string;
}

export interface RegistrationStatusUpdateEmailData {
  name: string;
  email: string;
  conferenceName: string;
  registrationId: string;
  previousStatus: string;
  newStatus: string;
  previousPaymentStatus?: string;
  newPaymentStatus?: string;
  reason?: string;
  dashboardUrl: string;
}

export interface EmailVerificationEmailData {
  name: string;
  email: string;
  verificationUrl: string;
  expiresIn: string;
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

// Onboarding completion welcome email template
export function createOnboardingWelcomeEmail(
  data: OnboardingWelcomeEmailData
): EmailTemplate {
  const { name, school, dashboardUrl } = data;

  return {
    subject: 'Welcome to the Fiji Principles Association Community!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome to the Community</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">Welcome to the Community!</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Congratulations ${name}!</h2>

            <p style="margin: 0 0 12px 0;">
              Your onboarding is complete! You're now a full member of the Fiji Principles Association community.
            </p>

            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                Welcome to our community from <strong>${school}</strong>!
              </p>
              <p style="margin: 0 0 12px 0;">
                As a member, you now have access to:
              </p>
              <ul style="${list}">
                <li>Member dashboard with exclusive resources</li>
                <li>Community blog and discussions</li>
                <li>Conference registration and networking</li>
                <li>Professional development opportunities</li>
                <li>File sharing and collaboration tools</li>
              </ul>
            </div>

            <div style="text-align: left; margin: 24px 0 12px 0;">
              <a href="${dashboardUrl}" style="${button}">Access Your Dashboard</a>
            </div>

            <p style="margin: 0 0 12px 0;">
              We're excited to have you join our community of professionals dedicated to advancing principles and best practices.
            </p>

            <p style="${muted}; margin: 20px 0 0 0;">
              If you have any questions or need assistance, don't hesitate to reach out to our support team.
            </p>

            <p style="margin: 16px 0 0 0;">Welcome aboard!<br>Fiji Principles Association Team</p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to the Fiji Principles Association Community!

Congratulations ${name}!

Your onboarding is complete! You're now a full member of the Fiji Principles Association community.

Welcome to our community from ${school}!

As a member, you now have access to:
- Member dashboard with exclusive resources
- Community blog and discussions
- Conference registration and networking
- Professional development opportunities
- File sharing and collaboration tools

Access your dashboard: ${dashboardUrl}

We're excited to have you join our community of professionals dedicated to advancing principles and best practices.

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Welcome aboard!
Fiji Principles Association Team
    `.trim(),
  };
}

// Conference registration success email template
export function createConferenceRegistrationSuccessEmail(
  data: ConferenceRegistrationSuccessEmailData
): EmailTemplate {
  const { name, conferenceName, conferenceDate, conferenceLocation, registrationId, paymentMethod, dashboardUrl } = data;

  return {
    subject: `Registration Confirmed: ${conferenceName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Registration Confirmed</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">Registration Confirmed!</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Congratulations ${name}!</h2>

            <p style="margin: 0 0 12px 0;">
              Your registration for <strong>${conferenceName}</strong> has been successfully submitted and is pending approval.
            </p>

            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                Conference Details:
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${conferenceName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${conferenceDate}</p>
              <p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${conferenceLocation}</p>
              <p style="margin: 0 0 8px 0;"><strong>Registration ID:</strong> ${registrationId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Payment Method:</strong> ${paymentMethod === 'levy' ? 'Levy Payment' : 'Deposit Payment'}</p>
            </div>

            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                What happens next?
              </p>
              <ul style="${list}">
                <li>Your registration is currently pending approval</li>
                <li>You will receive a confirmation email once approved</li>
                <li>Payment instructions will be provided upon approval</li>
                <li>Conference materials will be shared closer to the event</li>
              </ul>
            </div>

            <div style="text-align: left; margin: 24px 0 12px 0;">
              <a href="${dashboardUrl}" style="${button}">View Registration Status</a>
            </div>

            <p style="margin: 0 0 12px 0;">
              We're excited to have you join us for this important event. If you have any questions about your registration, please don't hesitate to contact us.
            </p>

            <p style="${muted}; margin: 20px 0 0 0;">
              This is an automated confirmation. Please keep this email for your records.
            </p>

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association Team</p>
          </div>
        </body>
      </html>
    `,
    text: `
Registration Confirmed: ${conferenceName}

Congratulations ${name}!

Your registration for ${conferenceName} has been successfully submitted and is pending approval.

Conference Details:
- Event: ${conferenceName}
- Date: ${conferenceDate}
- Location: ${conferenceLocation}
- Registration ID: ${registrationId}
- Payment Method: ${paymentMethod === 'levy' ? 'Levy Payment' : 'Deposit Payment'}

What happens next?
- Your registration is currently pending approval
- You will receive a confirmation email once approved
- Payment instructions will be provided upon approval
- Conference materials will be shared closer to the event

View your registration status: ${dashboardUrl}

We're excited to have you join us for this important event. If you have any questions about your registration, please don't hesitate to contact us.

This is an automated confirmation. Please keep this email for your records.

Best regards,
Fiji Principles Association Team
    `.trim(),
  };
}

// Registration status update email template
export function createRegistrationStatusUpdateEmail(
  data: RegistrationStatusUpdateEmailData
): EmailTemplate {
  const {
    name,
    conferenceName,
    registrationId,
    previousStatus,
    newStatus,
    previousPaymentStatus,
    newPaymentStatus,
    reason,
    dashboardUrl
  } = data;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'confirmed': return 'Approved';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPaymentStatusDisplay = (status: string) => {
    switch (status) {
      case 'unpaid': return 'Unpaid';
      case 'pending': return 'Payment Pending';
      case 'paid': return 'Paid';
      case 'refunded': return 'Refunded';
      case 'partial': return 'Partially Paid';
      default: return status;
    }
  };

  const isApproval = newStatus === 'confirmed';
  const isCancellation = newStatus === 'cancelled';
  const hasPaymentUpdate = previousPaymentStatus && newPaymentStatus && previousPaymentStatus !== newPaymentStatus;

  const subject = isApproval
    ? `Registration Approved: ${conferenceName}`
    : isCancellation
      ? `Registration Update: ${conferenceName}`
      : `Registration Status Updated: ${conferenceName}`;

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Registration Status Update</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">${isApproval ? 'Registration Approved!' : 'Registration Status Update'}</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Hello ${name},</h2>

            <p style="margin: 0 0 12px 0;">
              ${isApproval
        ? `Great news! Your registration for <strong>${conferenceName}</strong> has been approved.`
        : `Your registration for <strong>${conferenceName}</strong> has been updated.`
      }
            </p>

            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                Registration Details:
              </p>
              <p style="margin: 0 0 8px 0;"><strong>Event:</strong> ${conferenceName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Registration ID:</strong> ${registrationId}</p>
              <p style="margin: 0 0 8px 0;"><strong>Status:</strong> ${getStatusDisplay(previousStatus)} → <strong>${getStatusDisplay(newStatus)}</strong></p>
              ${hasPaymentUpdate ? `<p style="margin: 0 0 8px 0;"><strong>Payment Status:</strong> ${getPaymentStatusDisplay(previousPaymentStatus)} → <strong>${getPaymentStatusDisplay(newPaymentStatus)}</strong></p>` : ''}
            </div>

            ${isApproval ? `
            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                Next Steps:
              </p>
              <ul style="${list}">
                <li>Complete your payment to secure your spot</li>
                <li>You will receive payment instructions shortly</li>
                <li>Conference materials will be shared closer to the event</li>
                <li>Check your dashboard for updates</li>
              </ul>
            </div>
            ` : ''}

            ${isCancellation ? `
            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                Important Information:
              </p>
              <p style="margin: 0 0 8px 0;">Your registration has been cancelled. If you believe this is an error, please contact us immediately.</p>
              ${reason ? `<p style="margin: 0 0 8px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            ` : ''}

            ${reason && !isCancellation ? `
            <div style="${card}">
              <p style="margin: 0 0 8px 0;"><strong>Admin Note:</strong> ${reason}</p>
            </div>
            ` : ''}

            <div style="text-align: left; margin: 24px 0 12px 0;">
              <a href="${dashboardUrl}" style="${button}">View Registration Details</a>
            </div>

            <p style="margin: 0 0 12px 0;">
              ${isApproval
        ? 'We look forward to seeing you at the conference! If you have any questions, please don\'t hesitate to contact us.'
        : 'If you have any questions about this update, please contact our support team.'
      }
            </p>

            <p style="${muted}; margin: 20px 0 0 0;">
              This is an automated notification. Please keep this email for your records.
            </p>

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association Team</p>
          </div>
        </body>
      </html>
    `,
    text: `
${subject}

Hello ${name},

${isApproval
        ? `Great news! Your registration for ${conferenceName} has been approved.`
        : `Your registration for ${conferenceName} has been updated.`
      }

Registration Details:
- Event: ${conferenceName}
- Registration ID: ${registrationId}
- Status: ${getStatusDisplay(previousStatus)} → ${getStatusDisplay(newStatus)}
${hasPaymentUpdate ? `- Payment Status: ${getPaymentStatusDisplay(previousPaymentStatus)} → ${getPaymentStatusDisplay(newPaymentStatus)}` : ''}

${isApproval ? `
Next Steps:
- Complete your payment to secure your spot
- You will receive payment instructions shortly
- Conference materials will be shared closer to the event
- Check your dashboard for updates
` : ''}

${isCancellation ? `
Important Information:
Your registration has been cancelled. If you believe this is an error, please contact us immediately.
${reason ? `Reason: ${reason}` : ''}
` : ''}

${reason && !isCancellation ? `Admin Note: ${reason}` : ''}

View your registration details: ${dashboardUrl}

${isApproval
        ? 'We look forward to seeing you at the conference! If you have any questions, please don\'t hesitate to contact us.'
        : 'If you have any questions about this update, please contact our support team.'
      }

This is an automated notification. Please keep this email for your records.

Best regards,
Fiji Principles Association Team
    `.trim(),
  };
}

// Email verification template
export function createEmailVerificationEmail(
  data: EmailVerificationEmailData
): EmailTemplate {
  const { name, email, verificationUrl, expiresIn } = data;

  return {
    subject: 'Verify your email address - Fiji Principles Association',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Verify Your Email</title>
        </head>
        <body style="${baseContainer}">
          <div style="${headerBar}">
            <h1 style="${headerTitle}">Verify your email address</h1>
          </div>

          <div style="${bodyBlock}">
            <h2 style="margin: 0 0 12px 0; font-size: 18px;">Hi ${name},</h2>

            <p style="margin: 0 0 12px 0;">
              Thank you for signing up with Fiji Principles Association! To complete your registration and secure your account, please verify your email address (<strong>${email}</strong>).
            </p>

            <div style="text-align: left; margin: 20px 0;">
              <a href="${verificationUrl}" style="${button}">Verify Email Address</a>
            </div>

            <p style="margin: 0 0 8px 0;"><strong>Note:</strong> This verification link expires in ${expiresIn}.</p>
            <p style="${muted}; margin: 0 0 12px 0;">For security, this link can be used only once.</p>

            <div style="${card}">
              <p style="margin: 0 0 12px 0; font-weight: 600;">
                Why verify your email?
              </p>
              <ul style="${list}">
                <li>Secure your account</li>
                <li>Receive important notifications</li>
                <li>Reset your password if needed</li>
                <li>Access all member features</li>
              </ul>
            </div>

            <p style="${muted}; margin: 12px 0 0 0;">
              If you did not create an account with Fiji Principles Association, you can safely ignore this email.
            </p>

            <p style="margin: 16px 0 0 0;">Best regards,<br>Fiji Principles Association</p>
          </div>
        </body>
      </html>
    `,
    text: `
Verify your email address - Fiji Principles Association

Hi ${name},

Thank you for signing up with Fiji Principles Association! To complete your registration and secure your account, please verify your email address (${email}).

Verify your email: ${verificationUrl}

Note: This verification link expires in ${expiresIn}.
For security, this link can be used only once.

Why verify your email?
- Secure your account
- Receive important notifications
- Reset your password if needed
- Access all member features

If you did not create an account with Fiji Principles Association, you can safely ignore this email.

Best regards,
Fiji Principles Association
    `.trim(),
  };
}