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
    // TODO: Replace with actual database queries
    // For now, returning the same structure as the hardcoded data in Admin.tsx

    const adminName: string = ctx.dbUser.name ?? "Admin";

    const stats: {
      users: DashboardStat;
      conference: DashboardStat;
      totalPayments: DashboardStat;
    } = {
      users: {
        value: "69",
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
        value: "124",
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
        value: "$31,000",
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

    const upcomingConference = {
      title: "133rd Fiji Principals Association Conference",
      date: "17th - 19th September 2025",
      capacity: "135/200 Spaces Remaining",
    };

    const recentActivity: RecentActivity[] = [
      {
        icon: {
          type: "lucide",
          name: "CheckCircle",
          props: {
            className: "text-primary w-5 flex-shrink-0",
            size: 24,
          },
        },
        title: "John Doe registered for the APC 2025",
        time: "2 days ago",
      },
      {
        icon: {
          type: "lucide",
          name: "CreditCard",
          props: {
            className: "text-primary w-5 flex-shrink-0",
            size: 24,
          },
        },
        title: "New payment recieved: $250 from Bob Ross",
        time: "4 days ago",
      },
      {
        icon: {
          type: "lucide",
          name: "UserPlus",
          props: {
            className: "text-primary w-5 flex-shrink-0",
            size: 24,
          },
        },
        title: "New member added: Jane Smith",
        time: "1 week ago",
      },
    ];

    const recentRegistrations: RecentConferenceRegistration[] = [
      {
        id: "1",
        name: "John Doe",
        date: "17/05/2025",
        status: "Paid",
        amountPaid: 250,
        amountDue: 0,
      },
      {
        id: "2",
        name: "Bob Ross",
        date: "21/07/2025",
        status: "Pending",
        amountPaid: 50,
        amountDue: 150,
      },
      {
        id: "3",
        name: "Stephen Prosser",
        date: "26/08/2025",
        status: "Pending",
        amountPaid: 150,
        amountDue: 50,
      },
    ];

    return {
      adminName,
      stats,
      upcomingConference,
      recentActivity,
      recentRegistrations,
    };
  }),
});

