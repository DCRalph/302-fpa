import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
  getAdminDashboard: protectedProcedure.query(async ({ ctx }) => {
    const adminName: string = ctx.dbUser?.name ?? "Admin";

    // Aggregate stats
    const [totalUsers, totalConfirmedRegistrations, totalSucceededPaymentsCents] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.registration.count({ where: { status: "confirmed" } }),
      (async () => {
        const payments = await ctx.db.payment.findMany({ where: { status: "succeeded" }, select: { amountCents: true } });
        return payments.reduce((sum, p) => sum + (p.amountCents ?? 0), 0);
      })(),
    ]);

    const stats: {
      users: DashboardStat;
      conference: DashboardStat;
      totalPayments: DashboardStat;
    } = {
      users: {
        value: String(totalUsers),
        subtitle: "Total Members",
        icon: {
          type: "lucide",
          name: "Users",
          props: {
            className: "h-8 w-8 text-white/80",
          },
        },
      },
      conference: {
        value: String(totalConfirmedRegistrations),
        subtitle: "Registered Members",
        icon: {
          type: "lucide",
          name: "UserPlus",
          props: {
            className: "h-8 w-8 text-white/80",
          },
        },
      },
      totalPayments: {
        value: `$${(totalSucceededPaymentsCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: "Collected",
        icon: {
          type: "lucide",
          name: "DollarSign",
          props: {
            className: "h-8 w-8 text-white/80",
          },
        },
      },
    };

    // Upcoming conference from settings
    const conf = await ctx.db.siteSettings.findUnique({ where: { key: "conferenceDetails" } });
    let upcomingConference = {
      title: "Upcoming Conference",
      date: "TBA",
      capacity: "",
    };
    if (conf) {
      try {
        const parsed = JSON.parse(conf.value) as { conferenceTitle?: string; rows?: { label: string; value: string }[] };
        upcomingConference.title = parsed.conferenceTitle ?? upcomingConference.title;
        const dateRow = parsed.rows?.find((r) => r.label.toLowerCase() === "date");
        if (dateRow) upcomingConference.date = dateRow.value;
        // capacity not tracked; leave as empty or derive if later added
      } catch {
        // ignore parse errors
      }
    }

    // Recent activity built from latest registrations and payments
    const [latestRegs, latestPayments] = await Promise.all([
      ctx.db.registration.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      }),
      ctx.db.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { amountCents: true, status: true, createdAt: true },
      }),
    ]);

    const recentActivity: RecentActivity[] = [
      ...latestRegs.map((r) => ({
        icon: { type: "lucide", name: "CheckCircle", props: { className: "text-primary w-5 flex-shrink-0", size: 24 } },
        title: `${r.name} registered for the conference`,
        time: r.createdAt.toLocaleDateString("en-GB"),
      })),
      ...latestPayments.map((p) => ({
        icon: { type: "lucide", name: "CreditCard", props: { className: "text-primary w-5 flex-shrink-0", size: 24 } },
        title: p.status === "succeeded" ? `New payment received: $${(p.amountCents / 100).toFixed(2)}` : `Payment ${p.status}`,
        time: p.createdAt.toLocaleDateString("en-GB"),
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    // Recent conference registrations table
    const recentRegs = await ctx.db.registration.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true, status: true, payments: true, priceCents: true },
    });
    const recentRegistrations: RecentConferenceRegistration[] = recentRegs.map((r) => {
      const paidCents = (r.payments ?? [])
        .filter((p) => p.status === "succeeded")
        .reduce((sum, p) => sum + p.amountCents, 0);
      const amountDueCents = Math.max((r.priceCents ?? 0) - paidCents, 0);
      return {
        id: r.id,
        name: r.name,
        date: r.createdAt.toLocaleDateString("en-GB"),
        status: paidCents >= (r.priceCents ?? 0) && (r.priceCents ?? 0) > 0 ? "Paid" : paidCents > 0 ? "Pending" : "Overdue",
        amountPaid: paidCents / 100,
        amountDue: amountDueCents / 100,
      };
    });

    return {
      adminName,
      stats,
      upcomingConference,
      recentActivity,
      recentRegistrations,
    };
  }),
});

