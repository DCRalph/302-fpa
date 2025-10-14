import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// type RegistrationStatus = {
//   state: "not_registered" | "pending" | "cancelled" | "confirmed_unpaid" | "confirmed_paid" | "confirmed_partial" | "refunded";
//   title: string;
//   description: string;
//   icon: {
//     type: string;
//     name: string;
//     props: Record<string, string | number>;
//   };
//   iconColor: string;
//   badgeVariant: "default" | "secondary" | "destructive" | "outline";
//   badgeText: string;
//   badgeBgColor?: string;
//   registrationId?: string;
//   registeredDate?: string;
//   cancelledDate?: string;
//   refundedDate?: string;
//   confirmedDate?: string;
//   conferenceDate?: string;
//   registrationType?: string;
//   amount?: string | null;
//   paymentStatus?: string;
//   paymentDate?: string;
//   showActions: boolean;
//   actions?: {
//     primary?: { text: string; href: string };
//     secondary?: { text: string; href: string };
//   };
// };


export const memberDashboardRouter = createTRPCRouter({
  getMemberDashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.dbUser.id;

    const latestConference = await ctx.db.conference.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { contacts: true },
    });

    // Fetch user's latest registration with related data
    const registration = await ctx.db.registration.findFirst({
      where: { userId, conferenceId: latestConference?.id },
      orderBy: { createdAt: 'desc' },
      include: {
        ticketType: true,
        payments: true,
      },
    });

    // Determine registration status details
    let registrationStatus = null;

    if (!latestConference) {
      // No active conference
      registrationStatus = {
        state: "no_conference" as const,
        title: "No Active Conference",
        description: "There is no active conference with open registration at the moment.",
        icon: {
          type: "lucide",
          name: "Calendar",
          props: { className: "size-16" },
        },
        iconColor: "text-muted-foreground",
        badgeVariant: "secondary" as const,
        badgeText: "No Active Conference",
        showActions: false,
      };
    } else if (!registration) {
      // Not registered
      registrationStatus = {
        state: "not_registered" as const,
        title: "Not Registered Yet",
        description: "You haven't registered for the conference yet. Register now to secure your spot!",
        icon: {
          type: "lucide",
          name: "AlertCircle",
          props: { className: "size-16" },
        },
        iconColor: "text-gray-500",
        badgeVariant: "secondary" as const,
        badgeText: "Not Registered",
        showActions: true,
        actions: {
          primary: { text: "Register Now", href: "  /member-dashboard/conference-registration" },
        },
      };
    } else {

      const { status, paymentStatus, priceCents, currency, registrationType, createdAt } = registration;


      // Calculate different states based on status and payment
      if (status === "cancelled") {
        registrationStatus = {
          state: "cancelled" as const,
          title: "Registration Cancelled",
          description: "Your registration has been cancelled. If this was a mistake, please contact support or register again.",
          icon: {
            type: "lucide",
            name: "XCircle",
            props: { className: "size-16" },
          },
          iconColor: "text-red-500",
          badgeVariant: "destructive" as const,
          badgeText: "Cancelled",
          registrationId: registration.id,
          registeredDate: createdAt.toLocaleDateString(),
          cancelledDate: createdAt.toLocaleDateString(),
          showActions: true,
          actions: {
            primary: { text: "Contact Support", href: "/member-dashboard/contact-support" },
            secondary: { text: "Register Again", href: "/member-dashboard/conference-registration" },
          },
        };
      } else if (status === "pending") {
        registrationStatus = {
          state: "pending" as const,
          title: "Registration Pending Approval",
          description: "Your registration is being reviewed by our team. We'll notify you once it's approved.",
          icon: {
            type: "lucide",
            name: "Clock",
            props: { className: "size-16" },
          },
          iconColor: "text-yellow-500",
          badgeVariant: "default" as const,
          badgeText: "Pending Approval",
          registrationId: registration.id,
          registeredDate: createdAt.toLocaleDateString(),
          registrationType,
          confirmedDate: createdAt.toLocaleDateString(),
          showActions: false,
        };
      } else if (status === "confirmed") {
        // Registration is confirmed - check payment status
        if (paymentStatus === "unpaid" || paymentStatus === "pending") {
          registrationStatus = {
            state: "confirmed_unpaid" as const,
            title: "Registration Confirmed - Payment Required",
            description: "Your registration has been approved! Please complete your payment to finalize your registration.",
            icon: {
              type: "lucide",
              name: "CreditCard",
              props: { className: "size-16" },
            },
            iconColor: "text-blue-500",
            badgeVariant: "default" as const,
            badgeText: paymentStatus === "pending" ? "Payment Pending" : "Payment Required",
            registrationId: registration.id,
            registeredDate: createdAt.toLocaleDateString(),
            registrationType,
            amount: priceCents ? `${currency} $${(priceCents / 100).toFixed(2)}` : null,
            paymentStatus,
            paymentDate: createdAt.toLocaleDateString(),
            showActions: true,
            actions: {
              primary: { text: "Make Payment", href: "/member-dashboard/registration-payment" },
              secondary: { text: "View Details", href: "/member-dashboard/conference-registration" },
            },
          };
        } else if (paymentStatus === "paid") {
          registrationStatus = {
            state: "confirmed_paid" as const,
            title: "You're All Set!",
            description: "You're registered for the 133rd Fiji Principals Association Conference",
            icon: {
              type: "lucide",
              name: "CheckCircle",
              props: { className: "size-16" },
            },
            iconColor: "text-green-500",
            badgeVariant: "default" as const,
            badgeText: "Paid",
            badgeBgColor: "bg-[#198754]",
            registrationId: registration.id,
            registeredDate: createdAt.toLocaleDateString(),
            conferenceDate: "17th - 19th September 2025",
            registrationType,
            amount: priceCents ? `${currency} $${(priceCents / 100).toFixed(2)}` : null,
            paymentStatus: "Paid",
            paymentDate: createdAt.toLocaleDateString(),
            showActions: true,
            actions: {
              primary: { text: "Download Ticket", href: "/member-dashboard/ticket-download" },
              secondary: { text: "View Details", href: "/member-dashboard/conference-registration" },
            },
          };
        } else if (paymentStatus === "partial") {
          registrationStatus = {
            state: "confirmed_partial" as const,
            title: "Partial Payment Received",
            description: "We've received a partial payment. Please complete the remaining balance to finalize your registration.",
            icon: {
              type: "lucide",
              name: "AlertCircle",
              props: { className: "size-16" },
            },
            iconColor: "text-orange-500",
            badgeVariant: "default" as const,
            badgeText: "Partial Payment",
            registrationId: registration.id,
            registeredDate: createdAt.toLocaleDateString(),
            registrationType,
            amount: priceCents ? `${currency} $${(priceCents / 100).toFixed(2)}` : null,
            paymentStatus: "Partial",
            paymentDate: createdAt.toLocaleDateString(),
            showActions: true,
            actions: {
              primary: { text: "Complete Payment", href: "/member-dashboard/registration-payment" },
              secondary: { text: "View Details", href: "/member-dashboard/conference-registration" },
            },
          };
        } else if (paymentStatus === "refunded") {
          registrationStatus = {
            state: "refunded" as const,
            title: "Payment Refunded",
            description: "Your payment has been refunded. Your registration may be cancelled.",
            icon: {
              type: "lucide",
              name: "RefreshCcw",
              props: { className: "size-16" },
            },
            iconColor: "text-purple-500",
            badgeVariant: "secondary" as const,
            badgeText: "Refunded",
            registrationId: registration.id,
            registeredDate: createdAt.toLocaleDateString(),
            registrationType,
            amount: priceCents ? `${currency} $${(priceCents / 100).toFixed(2)}` : null,
            paymentStatus: "Refunded",
            paymentDate: createdAt.toLocaleDateString(),
            refundedDate: createdAt.toLocaleDateString(),
            showActions: true,
            actions: {
              primary: { text: "Contact Support", href: "/member-dashboard/contact-support" },
            },
          };
        }
      }
    }

    // Calculate stats based on registration
    const statsRegistrationValue = registration
      ? (registration.status === "confirmed" ? "Registered" : registration.status === "pending" ? "Pending" : "Cancelled")
      : "Not Registered";

    const statsPaymentValue = registration?.paymentStatus
      ? registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1)
      : "Not Paid";

    const toAgo = (d: Date) => {
      const diffMs = Date.now() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    };

    const userActivities = await ctx.db.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5, // Get last 5 activities
    });

    const activities = userActivities.map((activity) => {
      // Safely parse actions JSON
      const rawActions = activity.actions as unknown;
      const actions = Array.isArray(rawActions)
        ? rawActions
          .filter((a) => a && typeof a === 'object' && 'label' in (a as Record<string, unknown>) && 'href' in (a as Record<string, unknown>))
          .map((a) => {
            const aa = a as Record<string, unknown>;
            return {
              label: String(aa.label ?? ''),
              href: String(aa.href ?? '#'),
              variant: (aa.variant as string | undefined) ?? 'default',
            };
          })
        : [];

      // Build metadata details
      const md = (activity.metadata as unknown as Record<string, unknown>) ?? {};
      const metaLines: string[] = [];
      if (typeof md.conferenceName === 'string' && md.conferenceName) {
        metaLines.push(`Conference: ${md.conferenceName}`);
      }
      if (typeof md.registrationId === 'string' && md.registrationId) {
        metaLines.push(`Registration ID: ${md.registrationId}`);
      }
      if (typeof md.previousStatus === 'string' && typeof md.newStatus === 'string') {
        metaLines.push(`Status: ${md.previousStatus} → ${md.newStatus}`);
      }
      if (
        typeof md.previousPaymentStatus === 'string' &&
        typeof md.newPaymentStatus === 'string'
      ) {
        metaLines.push(`Payment: ${md.previousPaymentStatus} → ${md.newPaymentStatus}`);
      }

      return {
        icon: { type: 'lucide', name: activity.icon, props: { className: 'size-6 text-blue-500' } },
        title: activity.title,
        time: toAgo(activity.createdAt),
        description: activity.description ?? undefined,
        metaLines,
        actions,
      };
    });

    const recentActivity = activities.length > 0 ? activities : [
      {
        icon: { type: "lucide", name: "Info", props: { className: "size-6 text-blue-500" } },
        title: "No recent activity",
        time: "",
        description: undefined,
        metaLines: [] as string[],
        actions: [] as { label: string; href: string; variant?: string }[],
      },
    ];

    return {
      conference: latestConference,
      stats: {
        registrationStatus: {
          value: statsRegistrationValue,
          subtitle: "2025 Conference",
          icon: {
            type: "lucide",
            name: registration?.status === "confirmed" ? "CheckCircle" : registration?.status === "pending" ? "Clock" : "AlertCircle",
            props: {
              className: "h-8 w-8",
            },
          },
        },
        paymentStatus: {
          value: statsPaymentValue,
          subtitle: registration?.priceCents ? `$${(registration.priceCents / 100).toFixed(2)} Conference Fee` : "No Fee",
          icon: {
            type: "lucide",
            name: "DollarSign",
            props: {
              className: "h-8 w-8",
            },
          },
        },
        communityBlog: {
          value: String(await ctx.db.blogPost.count({ where: { authorId: userId } })),
          subtitle: "Blog Posts",
          icon: {
            type: "lucide",
            name: "BookOpen",
            props: { className: "h-8 w-8" },
          },
        },
        documents: {
          value: String(await ctx.db.attachment.count({ where: { registration: { userId } } })),
          subtitle: "Files Uploaded",
          icon: {
            type: "lucide",
            name: "FileText",
            props: { className: "h-8 w-8" },
          },
        },
      },
      registrationStatus,
      recentActivity,
    }


  }),
});