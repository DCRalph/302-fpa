
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export type ConferenceTitle = {
  title: string;
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
        title: "Fiji Principals Association Conference 2025",
        subtitle: "Join educational leaders from across the Pacific for three days of inspiring sessions, networking, and professional development in the heart of Fiji.",
      };
      conferenceTitle = await ctx.db.siteSettings.create({
        data: {
          key: "conferenceTitle",
          value: JSON.stringify(defualtValue),
        },
      });
      return null;
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

    let conferenceDetails = await ctx.db.siteSettings.findUnique({
      where: {
        key: "conferenceDetails",
      },
    });
    if (!conferenceDetails) {
      const defualtValue: ConferenceDetails = {
        conferenceTitle: "133rd Fiji Principals Association Conference",
        rows: [
          { label: "Date", value: "17th - 19th of September 2025" },
          { label: "Registration Fee", value: "FJD $250" },
          { label: "Payment Methods", value: "Crossed cheque or Bank transfer to BSP Samabula (Account: 10065568)" },
          { label: "Location", value: "Sheraton Golf and Beach Resort" },
          { label: "Theme", value: "Future Ready Schools - Embracing Digital, Cultural and Global Shift" },
          { label: "Chief Guest", value: "Minister for Education - Hon Aseri Radrodro" },
          { label: "Official Opening", value: "6.30 PM on 17th September" },
        ],
        included: [
          "Official Opening Ceremony",
          "Conference Sessions",
          "Networking Opportunities",
          "All Meals Included",
        ],
        contacts: [
          { role: "President", name: "Mr. Vishnu Deo Sharma", phone: "9278360" },
          { role: "Secretary", name: "Mr. Praveen Chand", phone: "9088290" },
          { role: "Treasurer", name: "Mr. Pranesh Kumar", phone: "9951918" },
          { role: "Email", email: "fijiprincipalsassociation@gmail.com" },
        ],
      };
      conferenceDetails = await ctx.db.siteSettings.create({
        data: {
          key: "conferenceDetails",
          value: JSON.stringify(defualtValue),
        },
      });
    }
    return conferenceDetails;
  }),
});