"use client"

import { ColumnDef } from "@tanstack/react-table"
import {ArrowUpDown, ReceiptText } from "lucide-react";
import { Button } from "../../core/button.tsx";

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
    logo_url: string;
}

export const transactionsCols: ColumnDef<Transaction>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
            const name = row.original.merchant_name || row.original.name
            const imageSize = 30

            return (
                <div className="flex gap-2 items-center">
                    {row.original.logo_url ? 
                        (<img 
                            src={row.original.logo_url}
                            alt="an image of the transaction logo"
                            className="rounded"
                            height={imageSize}
                            width={imageSize}
                        />):
                        <ReceiptText height={imageSize} width={imageSize} className="text-primary"/>
                    }
                    <span>{name}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "personal_finance_category",
        header: ({ column }) => {
            return (
                <Button
                    className="text-left p-0 flex items-center"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({row}) => {
            const category = row.original.personal_finance_category.primary || row.original.category
         
         return <div>{category}</div>   
        }
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    className="text-left p-0 flex items-center"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Amount
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat(["en-US", "en-GB"], {
                style: "currency",
                currency: row.original.iso_currency_code || row.original.unofficial_currency_code,
                currencyDisplay: "symbol",
            }).format(amount)

            return <div className="">{formatted}</div>
        },
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    className="text-left p-0 flex items-center"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.date_time || row.original.date)

            return <div className="">{date.toLocaleDateString()}</div>
        },
    },
]