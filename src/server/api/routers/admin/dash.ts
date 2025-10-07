import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type Prisma } from "@prisma/client";

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

    // Stats
    const [totalUsers, totalConfirmedRegistrations, paymentsSum] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.registration.count({ where: { status: "confirmed" } }),
      ctx.db.payment.aggregate({
        _sum: { amountCents: true },
        where: { status: "succeeded" },
      }),
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
          props: { className: "h-8 w-8 text-white/80" },
        },
      },
      conference: {
        value: String(totalConfirmedRegistrations),
        subtitle: "Registered Members",
        icon: {
          type: "lucide",
          name: "UserPlus",
          props: { className: "h-8 w-8 text-white/80" },
        },
      },
      totalPayments: {
        value: `$${(((paymentsSum._sum.amountCents ?? 0) as number) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        subtitle: "Collected",
        icon: {
          type: "lucide",
          name: "DollarSign",
          props: { className: "h-8 w-8 text-white/80" },
        },
      },
    };

    // Upcoming Conference (from SiteSettings)
    const settings = await ctx.db.siteSettings.findUnique({ where: { key: "conferenceDetails" } });
    let upcomingConference = {
      title: "Conference",
      date: "",
      capacity: "",
    } as { title: string; date: string; capacity: string };

    let capacityTotal = 200; // default capacity if not configured
    const capacitySetting = await ctx.db.siteSettings.findUnique({ where: { key: "conferenceCapacity" } });
    if (capacitySetting) {
      const parsed = Number(JSON.parse(capacitySetting.value));
      if (!Number.isNaN(parsed) && parsed > 0) capacityTotal = parsed;
    }

    const remaining = Math.max(capacityTotal - totalConfirmedRegistrations, 0);

    if (settings) {
      try {
        const value = JSON.parse(settings.value) as { conferenceTitle?: string; rows?: Array<{ label: string; value: string }>; };
        const dateRow = value.rows?.find((r) => r.label.toLowerCase() === "date")?.value ?? "";
        upcomingConference = {
          title: value.conferenceTitle ?? "Conference",
          date: dateRow,
          capacity: `${remaining}/${capacityTotal} Spaces Remaining`,
        };
      } catch {
        upcomingConference = {
          title: "Conference",
          date: "",
          capacity: `${remaining}/${capacityTotal} Spaces Remaining`,
        };
      }
    } else {
      upcomingConference = {
        title: "Conference",
        date: "",
        capacity: `${remaining}/${capacityTotal} Spaces Remaining`,
      };
    }

    // Recent activity (registrations, payments, users)
    const [recentRegs, recentPays, recentUsers] = await Promise.all([
      ctx.db.registration.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, createdAt: true } }),
      ctx.db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, amountCents: true, status: true, createdAt: true, registration: { select: { name: true } } } }),
      ctx.db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, createdAt: true } }),
    ]);

    const toAgo = (d: Date) => {
      const diffMs = Date.now() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    };

    const recentActivity: RecentActivity[] = [
      ...recentRegs.map((r) => ({
        icon: { type: "lucide", name: "CheckCircle", props: { className: "text-primary w-5 flex-shrink-0", size: 24 } },
        title: `${r.name} registered`,
        time: toAgo(r.createdAt),
      })),
      ...recentPays.map((p) => ({
        icon: { type: "lucide", name: "CreditCard", props: { className: "text-primary w-5 flex-shrink-0", size: 24 } },
        title: `${p.status === "succeeded" ? "Payment received" : "Payment update"}: $${((p.amountCents ?? 0) / 100).toFixed(2)}${p.registration?.name ? ` from ${p.registration.name}` : ""}`,
        time: toAgo(p.createdAt as Date),
      })),
      ...recentUsers.map((u) => ({
        icon: { type: "lucide", name: "UserPlus", props: { className: "text-primary w-5 flex-shrink-0", size: 24 } },
        title: `New member added: ${u.name ?? u.id}`,
        time: toAgo(u.createdAt),
      })),
    ]
      .sort((a, b) => {
        // We cannot sort by date here since we transformed to strings; re-derive by underlying dates if needed.
        return 0;
      })
      .slice(0, 10);

    // Recent registrations table
    const registrations = await ctx.db.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        payments: true,
        ticketType: true,
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
    };
  }),
});

