import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";

type RecentConferenceRegistration = {
  id: string;
  name: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  amountPaid: number;
  amountDue: number;
};

type StatIcon = {
  type: string;
  name: string;
  props: Record<string, string | number>;
};

type DashboardStat = {
  value: string;
  subtitle: string;
  icon: StatIcon;
};

type RecentActivity = {
  icon: StatIcon;
  title: string;
  time: string;
};

export const adminDashboardRouter = createTRPCRouter({
  // Get paginated list of all activities
  getAllActivities: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const [activities, totalCount] = await Promise.all([
        ctx.db.userActivity.findMany({
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        }),
        ctx.db.userActivity.count(),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        activities,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }),

  getAdminDashboard: adminProcedure.query(async ({ ctx }) => {
    const adminName: string = ctx.dbUser?.name ?? "Admin";

    // Get the latest active conference
    const latestConference = await ctx.db.conference.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    // Stats - Overall and Conference-specific
    const [
      totalUsers,
      totalConfirmedRegistrations,
      totalRegistrations,
      paymentsSum,
      conferenceRegistrations,
      conferencePaymentsSum,
      totalConferences,
      activeConferences,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.registration.count({ where: { status: "confirmed" } }),
      ctx.db.registration.count(),
      ctx.db.payment.aggregate({
        _sum: { amountCents: true },
        where: { status: "succeeded" },
      }),
      latestConference
        ? ctx.db.registration.count({
          where: {
            conferenceId: latestConference.id,
            status: "confirmed",
          },
        })
        : Promise.resolve(0),
      latestConference
        ? ctx.db.payment.aggregate({
          _sum: { amountCents: true },
          where: {
            status: "succeeded",
            registration: {
              conferenceId: latestConference.id,
            },
          },
        })
        : Promise.resolve({ _sum: { amountCents: 0 } }),
      ctx.db.conference.count(),
      ctx.db.conference.count({ where: { isActive: true } }),
    ]);

    const stats: {
      users: DashboardStat;
      conference: DashboardStat;
      totalPayments: DashboardStat;
      conferences?: DashboardStat;
    } = {
      users: {
        value: String(totalUsers),
        subtitle: "Total Members",
        icon: {
          type: "lucide",
          name: "Users",
          props: { className: "h-8 w-8 text-white/80" },
        },
      },
      conference: {
        value: latestConference
          ? `${conferenceRegistrations}`
          : String(totalConfirmedRegistrations),
        subtitle: latestConference
          ? `Registrations`
          : "Total Registrations",
        icon: {
          type: "lucide",
          name: "UserPlus",
          props: { className: "h-8 w-8 text-white/80" },
        },
      },
      totalPayments: {
        value: `$${((paymentsSum._sum.amountCents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        subtitle: "Total Collected",
        icon: {
          type: "lucide",
          name: "DollarSign",
          props: { className: "h-8 w-8 text-white/80" },
        },
      },
    };

    // Add conference stats if we have conferences
    if (totalConferences > 0) {
      stats.conferences = {
        value: `${activeConferences} / ${totalConferences}`,
        subtitle: "Active Conferences",
        icon: {
          type: "lucide",
          name: "Calendar",
          props: { className: "h-8 w-8 text-white/80" },
        },
      };
    }

    // Upcoming Conference - Now using Conference table
    let upcomingConference = {
      title: "Conference",
      date: "",
      capacity: "",
      id: "",
    } as { title: string; date: string; capacity: string; id: string };

    if (latestConference) {
      const registrationCount = latestConference._count.registrations;
      const maxReg = latestConference.maxRegistrations;
      const remaining = maxReg > 0 ? Math.max(maxReg - registrationCount, 0) : registrationCount;

      const startDate = new Date(latestConference.startDate);
      const endDate = new Date(latestConference.endDate);
      const dateStr =
        startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        " - " +
        endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      upcomingConference = {
        id: latestConference.id,
        title: latestConference.name,
        date: dateStr,
        capacity:
          maxReg > 0
            ? `${remaining} / ${maxReg} Spaces Remaining`
            : `${registrationCount} Registered (Unlimited)`,
      };
    }

    // Recent activity - Get last 5 activities from any user
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
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    const recentActivity: RecentActivity[] = userActivities.map((activity) => ({
      icon: {
        type: "lucide",
        name: activity.icon,
        props: { className: "text-primary w-5 flex-shrink-0", size: 24 },
      },
      title: activity.title,
      time: toAgo(activity.createdAt),
    }));

    // Recent registrations table - prioritize latest conference registrations
    const registrations = await ctx.db.registration.findMany({
      where: latestConference ? { conferenceId: latestConference.id } : {},
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        payments: true,
        ticketType: true,
        conference: { select: { name: true } },
      },
    });

    const recentRegistrations: RecentConferenceRegistration[] = registrations.map((reg) => {
      const ticketPrice = reg.priceCents ?? reg.ticketType?.priceCents ?? 0;
      const amounts = reg.payments.reduce(
        (acc, p) => {
          if (p.status === "succeeded") acc.paid += p.amountCents;
          if (p.status === "refunded") acc.refunded += p.amountCents;
          return acc;
        },
        { paid: 0, refunded: 0 },
      );
      const netPaid = Math.max(amounts.paid - amounts.refunded, 0);
      const due = Math.max(ticketPrice - netPaid, 0);
      const status: RecentConferenceRegistration["status"] = netPaid >= ticketPrice && ticketPrice > 0 ? "Paid" : "Pending";
      const date = reg.createdAt.toLocaleDateString();
      return {
        id: reg.id,
        name: reg.name,
        date,
        status,
        amountPaid: Number((netPaid / 100).toFixed(2)),
        amountDue: Number((due / 100).toFixed(2)),
      };
    });

    return {
      adminName,
      stats,
      upcomingConference,
      recentActivity,
      recentRegistrations,
      latestConferenceId: latestConference?.id,
      totalConferences,
      activeConferences,
    };
  }),

  // New endpoint for conference-specific analytics
  getConferenceAnalytics: adminProcedure
    .input(
      z.object({
        conferenceId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.dbUser.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      // Get conference (either specified or latest active)
      const conference = input?.conferenceId
        ? await ctx.db.conference.findUnique({
          where: { id: input.conferenceId },
          include: {
            _count: { select: { registrations: true } },
          },
        })
        : await ctx.db.conference.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { registrations: true } },
          },
        });

      if (!conference) {
        return null;
      }

      // Get detailed analytics for this conference
      const [
        totalRegistrations,
        confirmedRegistrations,
        pendingRegistrations,
        cancelledRegistrations,
        totalRevenue,
        paidRegistrations,
        unpaidRegistrations,
        registrationsByStatus,
        registrationsByPaymentStatus,
        recentRegistrations,
      ] = await Promise.all([
        ctx.db.registration.count({
          where: { conferenceId: conference.id },
        }),
        ctx.db.registration.count({
          where: { conferenceId: conference.id, status: "confirmed" },
        }),
        ctx.db.registration.count({
          where: { conferenceId: conference.id, status: "pending" },
        }),
        ctx.db.registration.count({
          where: { conferenceId: conference.id, status: "cancelled" },
        }),
        ctx.db.payment.aggregate({
          _sum: { amountCents: true },
          where: {
            status: "succeeded",
            registration: { conferenceId: conference.id },
          },
        }),
        ctx.db.registration.count({
          where: {
            conferenceId: conference.id,
            paymentStatus: "paid",
          },
        }),
        ctx.db.registration.count({
          where: {
            conferenceId: conference.id,
            paymentStatus: { in: ["unpaid", "pending"] },
          },
        }),
        ctx.db.registration.groupBy({
          by: ["status"],
          where: { conferenceId: conference.id },
          _count: true,
        }),
        ctx.db.registration.groupBy({
          by: ["paymentStatus"],
          where: { conferenceId: conference.id },
          _count: true,
        }),
        ctx.db.registration.findMany({
          where: { conferenceId: conference.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            payments: true,
          },
        }),
      ]);

      const capacityUsed =
        conference.maxRegistrations > 0
          ? (confirmedRegistrations / conference.maxRegistrations) * 100
          : 0;

      const expectedRevenue = confirmedRegistrations * (conference.priceCents / 100);
      const actualRevenue = (totalRevenue._sum.amountCents ?? 0) / 100;
      const revenueCollectionRate =
        expectedRevenue > 0 ? (actualRevenue / expectedRevenue) * 100 : 0;

      // Calculate daily registration trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const registrationTrend = await Promise.all(
        last7Days.map(async (date) => {
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);

          const count = await ctx.db.registration.count({
            where: {
              conferenceId: conference.id,
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          });

          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count,
          };
        })
      );

      return {
        conference: {
          id: conference.id,
          name: conference.name,
          description: conference.description,
          startDate: conference.startDate,
          endDate: conference.endDate,
          maxRegistrations: conference.maxRegistrations,
          price: conference.priceCents / 100,
          currency: conference.currency,
        },
        summary: {
          totalRegistrations,
          confirmedRegistrations,
          pendingRegistrations,
          cancelledRegistrations,
          capacityUsed: capacityUsed.toFixed(1),
          capacityRemaining:
            conference.maxRegistrations > 0
              ? conference.maxRegistrations - confirmedRegistrations
              : "Unlimited",
        },
        financial: {
          expectedRevenue,
          actualRevenue,
          revenueCollectionRate: revenueCollectionRate.toFixed(1),
          paidRegistrations,
          unpaidRegistrations,
          averagePaymentPerRegistration:
            confirmedRegistrations > 0
              ? (actualRevenue / confirmedRegistrations).toFixed(2)
              : 0,
        },
        breakdown: {
          byStatus: registrationsByStatus.map((item) => ({
            status: item.status,
            count: item._count,
          })),
          byPaymentStatus: registrationsByPaymentStatus.map((item) => ({
            status: item.paymentStatus,
            count: item._count,
          })),
        },
        trend: registrationTrend,
        recentRegistrations: recentRegistrations.map((reg) => ({
          id: reg.id,
          name: reg.name,
          email: reg.email,
          status: reg.status,
          paymentStatus: reg.paymentStatus,
          createdAt: reg.createdAt,
          amountPaid:
            reg.payments
              .filter((p) => p.status === "succeeded")
              .reduce((sum, p) => sum + p.amountCents, 0) / 100,
        })),
      };
    }),
});

