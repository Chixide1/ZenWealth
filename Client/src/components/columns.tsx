"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

export interface Transaction {
    transaction_id: string;
    merchant_name: string;
    name: string;
    amount: number;
    personal_finance_category: {
        primary: string;
    }
    date: string;
    date_time: string;
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "date",
        header: "Date",
    },
]
