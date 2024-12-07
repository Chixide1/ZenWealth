"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface Transaction {
    transaction_id: string;
    merchant_name: string;
    name: string;
    amount: number;
    personal_finance_category: {
        primary: string;
    }
    category: string;
    date: string;
    date_time: string;
    iso_currency_code: string;
    unofficial_currency_code: string;
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
            const name = row.original.merchant_name || row.original.name

            return <div>{name}</div>
        }
    },
    {
        accessorKey: "personal_finance_category",
        header: "Category",
        cell: ({row}) => {
            const category = row.original.personal_finance_category.primary || row.original.category
         
         return <div>{category}</div>   
        }
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat(["en-US", "en-GB"], {
                style: "currency",
                currency: row.original.iso_currency_code || row.original.unofficial_currency_code,
                currencyDisplay: "symbol",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.original.date_time || row.original.date)

            return <div className="font-medium">{date.toLocaleDateString()}</div>
        },
    },
]