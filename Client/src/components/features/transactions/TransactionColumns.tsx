"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { ReceiptText } from 'lucide-react';
import ColumnSortingButton from "@/components/features/transactions/ColumnSortingButton.tsx";
import CategoryFilterButton from "@/components/features/transactions/CategoryFilterButton.tsx";
import AmountFilterButton from "@/components/features/transactions/AmountFilterButton.tsx";
import DateFilterButton from "@/components/features/transactions/DateFilterButton.tsx";
import {DateTimePicker} from "@/components/core/date-time-picker.tsx";

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
    personal_finance_category_icon_url: string;
}

const columnHelper = createColumnHelper<Transaction>()

export const transactionColumns = [
    columnHelper.accessor("name", {
        header: ({column}) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
                <ColumnSortingButton column={column}/>
            </div>
        ),
        cell: ({row}) => {
            const name = row.original.merchant_name || row.original.name
            const imageSize = 30

            return (
                <div className="flex gap-2 items-center justify-start">
                    {row.original.logo_url ?
                        (<img
                            src={row.original.logo_url}
                            alt="an image of the transaction logo"
                            className="rounded min-w-6 h-auto ms-1"
                            width={imageSize}
                        />):
                        <ReceiptText width={imageSize} height={imageSize} className="text-primary min-w-9"/>
                    }
                    <span>{name}</span>
                </div>
            )
        },
        enableHiding: false,
        size: 200,
    }),
    columnHelper.accessor(row => `${row.personal_finance_category.primary.replace(/_/g, " ")}`, {
        id: 'category',
        header: ({column}) => (
            <div className="flex items-center">
                <CategoryFilterButton column={column} />
                <ColumnSortingButton column={column}/>
            </div>
        ),
        cell: ({row}) => {
            const category: string = row.getValue("category")

            return (
                <div className="flex gap-2 items-center">
                    <img
                        src={row.original.personal_finance_category_icon_url}
                        alt="an image of the transaction logo"
                        className="rounded min-w-6 h-auto ms-1 w-7"
                    />
                    {category}
                </div>
            )
        },
        filterFn: (row, columnId, filterValue: Record<string, boolean>) => {
            let colVal = row.getValue<string>(columnId)
            return filterValue[colVal.toLowerCase()]
        },
        size: 200,
    }),
    columnHelper.accessor("amount", {
        header: ({column}) => (
            <div className="flex items-center">
                <AmountFilterButton column={column} />
                <ColumnSortingButton column={column} />
            </div>
        ),
        cell: ({row}) => {
            const amount = row.getValue<number>("amount")
            const formatted = new Intl.NumberFormat(["en-US", "en-GB"], {
                style: "currency",
                currency: row.original.iso_currency_code || row.original.unofficial_currency_code,
                currencyDisplay: "symbol",
            }).format(amount)

            return <div className="">{formatted}</div>
        },
        filterFn: (row, columnId, filterValue: {min: number, max: number}) => {
            let colVal = row.getValue<number>(columnId)
            return colVal >= filterValue.min && colVal <= filterValue.max
        },
    }),
    columnHelper.accessor("date", {
        sortingFn: 'datetime',
        header: ({column}) => (
            <div className="flex items-center">
                <DateFilterButton column={column}/>
                <ColumnSortingButton column={column}/>
            </div>
        ),
        cell: ({row}) => {
            const dateTime = new Date(row.original.date_time || row.original.date)
            const formatted = new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(dateTime)

            return <div className="">{formatted}</div>
        },
        filterFn: (row, columnId, filterValue: {from: Date, to: Date}) => {
            if(filterValue == undefined){
                return true
            }
            
            let colVal = new Date(row.getValue<string>(columnId))
            return colVal >= filterValue.from && colVal <= filterValue.to
        },
    }),
]

