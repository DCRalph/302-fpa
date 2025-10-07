import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

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

    // Fetch user's latest registration with related info
    const registration = await ctx.db.registration.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        ticketType: true,
        payments: true,
        statusHistory: true,
      },
    });

    // Fetch counts for dashboard stats
    const [totalPublishedBlogPosts, totalUserAttachments] = await Promise.all([
      ctx.db.blogPost.count({ where: { published: true } }),
      ctx.db.attachment.count({
        where: {
          registration: { userId },
        },
      }),
    ]);

    // Get conference date from settings if available
    const conferenceDetailsSetting = await ctx.db.siteSettings.findUnique({
      where: { key: "conferenceDetails" },
    });
    let conferenceDate: string | undefined = undefined;
    if (conferenceDetailsSetting) {
      try {
        const parsed = JSON.parse(conferenceDetailsSetting.value) as {
          rows?: { label: string; value: string }[];
        };
        const dateRow = parsed?.rows?.find((r) => r.label.toLowerCase() === "date");
        conferenceDate = dateRow?.value;
      } catch {
        // ignore parse errors, leave undefined
      }
    }

    // Determine registration status details
    let registrationStatus: null | {
      state:
        | "not_registered"
        | "pending"
        | "cancelled"
        | "confirmed_unpaid"
        | "confirmed_paid"
        | "confirmed_partial"
        | "refunded";
      title: string;
      description: string;
      icon: { type: string; name: string; props: Record<string, string | number> };
      iconColor: string;
      badgeVariant: "default" | "secondary" | "destructive" | "outline";
      badgeText: string;
      badgeBgColor?: string;
      registrationId?: string;
      registeredDate?: string;
      cancelledDate?: string;
      refundedDate?: string;
      confirmedDate?: string;
      conferenceDate?: string;
      registrationType?: string;
      amount?: string | null;
      paymentStatus?: string;
      paymentDate?: string;
      showActions: boolean;
      actions?: {
        primary?: { text: string; href: string };
        secondary?: { text: string; href: string };
      };
    } = null;

    const formatCurrency = (cents?: number | null, currency?: string) => {
      if (!cents || cents <= 0) return null;
      const amount = (cents / 100).toFixed(2);
      return `${currency ?? "FJD"} $${amount}`;
    };

    const toDisplayDate = (d?: Date | null) =>
      d ? d.toLocaleDateString("en-GB") : undefined;

    if (!registration) {
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
          primary: { text: "Register Now", href: "/member-dashboard/conference-registration" },
        },
      };
    } else {
      const {
        status,
        paymentStatus,
        priceCents,
        currency,
        registrationType,
        createdAt,
        updatedAt,
        id,
      } = registration;

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
          registrationId: id,
          registeredDate: toDisplayDate(createdAt),
          cancelledDate: toDisplayDate(updatedAt ?? createdAt),
          showActions: true,
          actions: {
            primary: { text: "Contact Support", href: "/contact" },
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
          registrationId: id,
          registeredDate: toDisplayDate(createdAt),
          registrationType,
          confirmedDate: toDisplayDate(updatedAt ?? createdAt),
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
            registrationId: id,
            registeredDate: toDisplayDate(createdAt),
            registrationType,
            amount: formatCurrency(priceCents, currency),
            paymentStatus,
            paymentDate: toDisplayDate(updatedAt ?? createdAt),
            conferenceDate: conferenceDate,
            showActions: true,
            actions: {
              primary: { text: "Make Payment", href: "/payment" },
              secondary: { text: "View Details", href: "/registration/details" },
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
            registrationId: id,
            registeredDate: toDisplayDate(createdAt),
            conferenceDate: conferenceDate,
            registrationType,
            amount: formatCurrency(priceCents, currency),
            paymentStatus: "Paid",
            paymentDate: toDisplayDate(updatedAt ?? createdAt),
            showActions: true,
            actions: {
              primary: { text: "Download Ticket", href: "/ticket/download" },
              secondary: { text: "View Details", href: "/registration/details" },
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
            registrationId: id,
            registeredDate: toDisplayDate(createdAt),
            registrationType,
            amount: formatCurrency(priceCents, currency),
            paymentStatus: "Partial",
            paymentDate: toDisplayDate(updatedAt ?? createdAt),
            showActions: true,
            actions: {
              primary: { text: "Complete Payment", href: "/payment" },
              secondary: { text: "View Details", href: "/registration/details" },
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
            registrationId: id,
            registeredDate: toDisplayDate(createdAt),
            registrationType,
            amount: formatCurrency(priceCents, currency),
            paymentStatus: "Refunded",
            paymentDate: toDisplayDate(updatedAt ?? createdAt),
            refundedDate: toDisplayDate(updatedAt ?? createdAt),
            showActions: true,
            actions: {
              primary: { text: "Contact Support", href: "/contact" },
            },
          };
        }
      }
    }

    // Calculate stats based on registration
    const statsRegistrationValue = registration
      ? registration.status === "confirmed"
        ? "Registered"
        : registration.status === "pending"
          ? "Pending"
          : "Cancelled"
      : "Not Registered";

    const statsPaymentValue = registration?.paymentStatus
      ? registration.paymentStatus.charAt(0).toUpperCase() +
        registration.paymentStatus.slice(1)
      : "Not Paid";

    return {
      stats: {
        registrationStatus: {
          value: statsRegistrationValue,
          subtitle: "2025 Conference",
          icon: {
            type: "lucide",
            name:
              registration?.status === "confirmed"
                ? "CheckCircle"
                : registration?.status === "pending"
                  ? "Clock"
                  : "AlertCircle",
            props: {
              className: "h-8 w-8",
            },
          },
        },
        paymentStatus: {
          value: statsPaymentValue,
          subtitle: registration?.priceCents
            ? `$${(registration.priceCents / 100).toFixed(2)} Conference Fee`
            : "No Fee",
          icon: {
            type: "lucide",
            name: "DollarSign",
            props: {
              className: "h-8 w-8",
            },
          },
        },
        communityBlog: {
          value: String(totalPublishedBlogPosts),
          subtitle: "Blog Posts",
          icon: {
            type: "lucide",
            name: "BookOpen",
            props: {
              className: "h-8 w-8",
            },
          },
        },
        documents: {
          value: String(totalUserAttachments),
          subtitle: "Files Uploaded",
          icon: {
            type: "lucide",
            name: "FileText",
            props: {
              className: "h-8 w-8",
            },
          },
        },
      },
      registrationStatus,
      recentActivity: (() => {
        const items: {
          icon: { type: string; name: string; props: Record<string, string | number> };
          title: string;
          time: string;
          createdAt: Date;
        }[] = [];
        if (registration) {
          // Registration event
          items.push({
            icon: {
              type: "lucide",
              name: "CheckCircle",
              props: { className: "size-6 text-blue-500" },
            },
            title: "Registration created",
            time: toDisplayDate(registration.createdAt) ?? "",
            createdAt: registration.createdAt,
          });
          // Payment events
          for (const p of registration.payments ?? []) {
            items.push({
              icon: {
                type: "lucide",
                name: "CreditCard",
                props: { className: "size-6 text-blue-500" },
              },
              title:
                p.status === "succeeded"
                  ? `Payment of $${(p.amountCents / 100).toFixed(2)} succeeded`
                  : `Payment ${p.status}`,
              time: toDisplayDate(p.createdAt) ?? "",
              createdAt: p.createdAt,
            });
          }
          // Status changes
          for (const sh of registration.statusHistory ?? []) {
            items.push({
              icon: {
                type: "lucide",
                name: "Calendar",
                props: { className: "size-6 text-blue-500" },
              },
              title: `Status changed to ${sh.newStatus}`,
              time: toDisplayDate(sh.createdAt) ?? "",
              createdAt: sh.createdAt,
            });
          }
        }
        // Sort desc and take latest 4
        return items
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 4)
          .map(({ createdAt: _c, ...rest }) => rest);
      })(),
    }


  }),
});