"use client";

import { type ColumnDef } from "@tanstack/react-table";

export type RecentConferenceRegistration = {
  id: string;
  name: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  amountPaid: number;
  amountDue: number;
};

export const columns: ColumnDef<RecentConferenceRegistration>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "date",
    header: "Date Registered",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "amountPaid",
    header: "Amount Paid",
    cell: ({ row }) => {
        const value = row.getValue("amountPaid") as number;
        return `$${value.toFixed(2)}`;
    }
    
  },
  {
    accessorKey: "amountDue",
    header: "Amount Due",
    cell: ({ row }) => {
        const value = row.getValue("amountPaid") as number;
        return `$${value.toFixed(2)}`;
    }
  },
];
