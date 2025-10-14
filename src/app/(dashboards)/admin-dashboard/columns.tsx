"use client";

import { type ColumnDef } from "@tanstack/react-table";

export type RecentConferenceRegistration = {
  id: string;
  name: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  amountPaid: number;
  amountDue: number;
  createdAtISO?: string;
};

export const columns: ColumnDef<RecentConferenceRegistration>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "date",
    header: "Date Registered",
    cell: ({ row }) => {
      const date = row.original.date;
      const iso = row.original.createdAtISO ?? "";
      // For a simple native tooltip, format in desired style if ISO exists
      const formatted = iso ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toLowerCase().replace(",", "") : "";
      return (
        <div>
          <span title={formatted || iso}>{date}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "amountPaid",
    header: "Amount Paid",
    cell: ({ row }) => {
      const value = row.getValue("amountPaid");
      return `$${(value as number)?.toFixed(2)}`;
    }

  },
  {
    accessorKey: "amountDue",
    header: "Amount Due",
    cell: ({ row }) => {
      const value = row.getValue("amountDue");
      return `$${(value as number)?.toFixed(2)}`;
    }
  },
];
