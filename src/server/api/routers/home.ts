
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export type ConferenceTitle = {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
};


export type ConferenceWhyJoin = {
  title: string;
  description: string;
  icon: {
    type: string;
    name: string;
    props: { className: string; };
  };
};

export type ConferenceDetails = {
  conferenceTitle: string;
  rows: { label: string; value: string }[];
  included: string[];
  contacts: { role: string; name?: string; phone?: string; email?: string }[];
};

export const homeRouter = createTRPCRouter({
  getConferenceTitle: publicProcedure.query(async ({ ctx }) => {
    let conferenceTitle = await ctx.db.siteSettings.findUnique({
      where: {
        key: "conferenceTitle",
      },
    });
    if (!conferenceTitle) {
      const defualtValue: ConferenceTitle = {
        titleLine1: "Fiji Principals Association",
        titleLine2: "Conference System",
        subtitle: "Join educational leaders from across the Pacific for three days of inspiring sessions, networking, and professional development in the heart of Fiji.",
      };
      conferenceTitle = await ctx.db.siteSettings.create({
        data: {
          key: "conferenceTitle",
          value: JSON.stringify(defualtValue),
        },
      });
      return conferenceTitle;
    }
    return conferenceTitle;
  }),

  getConferenceWhyJoin: publicProcedure.query(async ({ ctx }) => {
    let conferenceWhyJoin = await ctx.db.siteSettings.findUnique({
      where: {
        key: "conferenceWhyJoin",
      },
    });
    if (!conferenceWhyJoin) {
      const defualtValue: ConferenceWhyJoin[] = [
        {
          title: "Professional Development and Leadership Training",
          description: "Access to expert-led sessions on school leadership, management, and innovation.",
          icon: {
            type: 'lucide',
            name: 'Users',
            props: { className: 'mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]' }
          }
        },
        {
          title: "Networking & Peer Collaboration",
          description: "Opportunities to connect with fellow principals, share experiences, and build support systems.",
          icon: {
            type: 'lucide',
            name: 'Network',
            props: { className: 'mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]' }
          }
        },
        {
          title: "Sharing Innovations and Best Practices",
          description: "Platforms to present and learn from impactful school-based programmes and ideas.",
          icon: {
            type: 'lucide',
            name: 'Lightbulb',
            props: { className: 'mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]' }
          }
        },
        {
          title: "Policy Alignment and National Priorities",
          description: "Insight into national education strategies and alignment with government expectations.",
          icon: {
            type: 'lucide',
            name: 'Shield',
            props: { className: 'mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]' }
          }
        },
      ];
      conferenceWhyJoin = await ctx.db.siteSettings.create({
        data: {
          key: "conferenceWhyJoin",
          value: JSON.stringify(defualtValue),
        },
      });
    }
    return conferenceWhyJoin;
  }),

  getConferenceDetails: publicProcedure.query(async ({ ctx }) => {
    // Get the latest active conference
    const conference = await ctx.db.conference.findFirst({
      where: {
        isActive: true,
      },
      include: {
        contacts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!conference) {
      // Return null if no active conference found
      return null;
    }

    // Transform conference data to match ConferenceDetails format
    const conferenceDetails: ConferenceDetails = {
      conferenceTitle: conference.name,
      rows: [
        {
          label: "Date",
          value: `${conference.startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} - ${conference.endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`
        },
        {
          label: "Registration Fee",
          value: `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
        },
        {
          label: "Payment Methods",
          value: `Bank transfer to ${conference.bankTransferAccountName} (${conference.bankTransferBranch} - Account: ${conference.bankTransferAccountNumber})`
        },
        { label: "Location", value: conference.location },
        { label: "Description", value: conference.description },
        {
          label: "Registration Period",
          value: `${conference.registrationStartDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} - ${conference.registrationEndDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`
        },
      ],
      included: [
        "Official Opening Ceremony",
        "Conference Sessions",
        "Networking Opportunities",
        "All Meals Included",
      ],
      contacts: conference.contacts.map(contact => {
        const fields = contact.fields as { name?: string; phone?: string; email?: string } | null;
        return {
          role: contact.name,
          name: fields?.name ?? undefined,
          phone: fields?.phone ?? undefined,
          email: fields?.email ?? undefined,
        };
      }),
    };

    return {
      key: "conferenceDetails",
      value: JSON.stringify(conferenceDetails),
    };
  }),

  getPreviousConferences: publicProcedure.query(async ({ ctx }) => {
    const previousConferences = await ctx.db.conference.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return previousConferences.filter((x, idx) => idx !== 0);
  }),

  getConferenceById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conference = await ctx.db.conference.findUnique({
        where: { id: input.id },
        include: {
          contacts: true,
          _count: {
            select: { registrations: true },
          },
        },
      });

      if (!conference) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conference not found",
        });
      }

      // Check if this is the current active conference
      const currentConference = await ctx.db.conference.findFirst({
        where: {
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        ...conference,
        isCurrent: currentConference?.id === conference.id,
      };
    }),

  getCurrentConference: publicProcedure.query(async ({ ctx }) => {
    const conference = await ctx.db.conference.findFirst({
      where: {
        isActive: true,
      },
      include: {
        contacts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return conference;
  }),
});