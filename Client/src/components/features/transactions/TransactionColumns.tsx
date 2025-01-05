"use client"

import {ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { ReceiptText } from 'lucide-react';
import ColumnSortingButton from "@/components/features/transactions/ColumnSortingButton.tsx";
import CategoryFilterButton from "@/components/features/transactions/CategoryFilterButton.tsx";
import AmountFilterButton from "@/components/features/transactions/AmountFilterButton.tsx";
import DateFilterButton from "@/components/features/transactions/DateFilterButton.tsx";
import { Transaction } from "@/types";

const columnHelper = createColumnHelper<Transaction>()

export const transactionColumns: ColumnDef<Transaction, any>[] = [
    columnHelper.accessor("name", {
        header: ({column}) => (
            <div className="flex items-center">
                <span className="capitalize">{column.id}</span>
                <ColumnSortingButton column={column}/>
            </div>
        ),
        cell: ({row}) => {
            const name = row.original.merchantName || row.original.name
            const imageSize = 30

            return (
                <div className="flex gap-2 items-center justify-start">
                    {row.original.logoUrl ?
                        (<img
                            src={row.original.logoUrl}
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
    columnHelper.accessor(row => {
        if(!row.personalFinanceCategory){
            return "Unknown"
        }
        return row.personalFinanceCategory.replace(/_/g, " ")
    }, {
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
                        src={row.original.personalFinanceCategoryIconUrl || "https://plaid-category-icons.plaid.com/PFC_OTHER.png"}
                        alt="an image of the transaction logo"
                        className="rounded min-w-6 h-auto ms-1 w-7"
                    />
                    {category}
                </div>
            )
        },
        filterFn: (row, columnId, filterValue: Record<string, boolean>) => {
            if(!filterValue){
                return true
            }
            
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
                currency: row.original.isoCurrencyCode || row.original.unofficialCurrencyCode,
                currencyDisplay: "symbol",
            }).format(amount)

            return <div className="">{formatted}</div>
        },
        filterFn: (row, columnId, filterValue: {min: number, max: number}) => {
            if(!filterValue){
                return true
            }
            
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
            const dateTime = new Date(row.original.datetime || row.original.date)
            const formatted = new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(dateTime)

            return <div className="">{formatted}</div>
        },
        filterFn: (row, columnId, filterValue: {from: Date, to: Date}) => {
            if(!filterValue){
                return true
            }
            
            let colVal = new Date(row.getValue<string>(columnId))
            return colVal >= filterValue.from && colVal <= filterValue.to
        },
    }),
]

