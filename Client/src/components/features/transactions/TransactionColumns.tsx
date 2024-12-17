"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ReceiptText } from "lucide-react";
import ColumnSortingButton from "@/components/features/transactions/ColumnSortingButton.tsx";
import CategoryFilterButton from "@/components/features/transactions/CategoryFilterButton.tsx";
import AmountFilterButton from "@/components/features/transactions/AmountFilterButton.tsx";
import { useEffect, useState } from "react";

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

export const transactionColumns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "name",
        enableHiding: false,
        header: ({column}) => {
            return (
                <div className="flex items-center">
                    <span className="capitalize">{column.id}</span>
                    <ColumnSortingButton column={column}/>
                </div>
            )
        },
        size: 200,
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
        }
    },
    {
        id: 'category',
        size: 200,
        accessorFn: row => `${row.personal_finance_category.primary.replace(/_/g, " ")}`,
        header: ({column}) => {
            return (
                <div className="flex items-center">
                    <CategoryFilterButton column={column} />
                    <ColumnSortingButton column={column}/>
                </div>
            )
        },
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
        filterFn: (row, columnId: string, filterValue: Record<string, boolean>) => {
            let colVal = row.getValue<string>(columnId)
            return filterValue[colVal.toLowerCase()]
        }
    },
    {
        accessorKey: "amount",
        header: ({column, table}) => {
            const [minMax, setMinMax] = useState<[number, number]>([0,0])
            const t = table.getIsAllColumnsVisible()
            
            useEffect(() => {
                setMinMax(column.getFacetedMinMaxValues() ?? [0,1000])
            }, [table.getState()]);
            
            // const minMax = column.getFacetedMinMaxValues()
            console.log(minMax)
            
            return (
                <div className="flex items-center">
                    <AmountFilterButton column={column} minMax={minMax}/>
                    <ColumnSortingButton column={column}/>
                </div>
            )
        },
        cell: ({row}) => {
            const amount = row.getValue<number>("amount")
            const formatted = new Intl.NumberFormat(["en-US", "en-GB"], {
                style: "currency",
                currency: row.original.iso_currency_code || row.original.unofficial_currency_code,
                currencyDisplay: "symbol",
            }).format(amount)

            return (
                <div className="">
                    {formatted}
                </div>
            )
        },
        filterFn: (row, columnId: string, filterValue: {min: number, max: number}) => {
            let colVal = row.getValue<number>(columnId)
            
            return colVal > filterValue.min && colVal < filterValue.max
        }
    },
    {
        accessorKey: "date",
        sortingFn: 'datetime',
        header: ({column}) => {
            return (
                <div className="flex items-center">
                    <span className="capitalize">{column.id}</span>
                    <ColumnSortingButton column={column}/>
                </div>
            )
        },
        cell: ({row}) => {
            const dateTime = new Date(row.original.date_time || row.original.date)
            const formatted = new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(dateTime)

            return <div className="">{formatted}</div>
        },
    },
]