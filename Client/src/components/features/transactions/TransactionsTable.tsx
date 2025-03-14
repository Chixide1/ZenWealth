﻿import {ColumnDef, flexRender, getCoreRowModel, useReactTable, type VisibilityState } from "@tanstack/react-table";
import { useAtom } from "jotai";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import ColumnVisibilityButton from "@/components/features/transactions/ColumnVisibilityButton.tsx";
import TransactionSearchButton from "@/components/features/transactions/TransactionSearchButton.tsx";
import type { Transaction, TransactionData } from "@/types";
import Loading from "@/components/shared/Loading.tsx";
import { cn } from "@/lib/utils";
import { transactionsPaginationAtom, transactionsParamsAtom } from "@/lib/atoms.ts";
import { ColumnFilterButton } from "@/components/features/transactions/ColumnFilterButton.tsx";
import { DateFilterButton } from "@/components/features/transactions/DateFilterButton.tsx";
import { NextButton, PageSizeButton, PrevButton } from "@/components/features/transactions/TransactionsPagination.tsx";
import type { DateRange } from "react-day-picker";

interface TransactionTableProps {
    columns: ColumnDef<Transaction, any>[] //eslint-disable-line
    data: TransactionData | undefined
    isLoading?: boolean
    className?: string
}

export function TransactionsTable({ columns, data, isLoading, className }: TransactionTableProps) {
    "use no memo" // eslint-disable-line

    const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
    const [filters, setFilters] = useAtom(transactionsParamsAtom);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        name: true,
        category: true,
        amount: true,
        date: true,
        account: true,
    });
    const [columnOrder] = useState<string[]>([
        "name",
        "amount",
        "date",
        "category",
        "account"
    ]);

    // Handler for date range changes
    const handleDateRangeChange = (range: DateRange | undefined) => {
        setFilters(prev => ({
            ...prev,
            beginDate: range?.from ?? null,
            endDate: range?.to ?? null,
        }));
    };

    // Create an initial date range from the filters
    const initialDateRange = filters.beginDate && filters.endDate
        ? { from: filters.beginDate, to: filters.endDate }
        : undefined;

    const table = useReactTable({
        data: data?.transactions ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            pagination,
            columnVisibility,
            columnOrder,
        },
        manualPagination: true,
        rowCount: -1,
    });

    return (
        <div
            className={cn(
                "relative overflow-auto border bg-background backdrop-blur-sm border-neutral-600/50 rounded-2xl scrollbar-custom",
                className,
            )}
        >
            <Table className="rounded-2xl text-primary text-sm">
                <TableHeader>
                    <TableRow>
                        <TableHead className="p-6" colSpan={columns.length}>
                            <div className="flex items-center justify-end gap-4">
                                <h2 className="text-nowrap text-primary text-xl font-medium mr-auto md:pr-10">Transaction History</h2>
                                <TransactionSearchButton />
                                <DateFilterButton
                                    initialDateRange={initialDateRange}
                                    onDateRangeChange={handleDateRangeChange}
                                />
                                <ColumnFilterButton />
                                <ColumnVisibilityButton columns={table.getAllColumns()} />
                            </div>
                        </TableHead>
                    </TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="text-primary bg-background px-6"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="border-0">
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                <Loading fullScreen={false} />
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                className="transition-colors hover:bg-primary/5 rounded-2xl"
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-6" style={{ width: cell.column.getSize() }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No Results Found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                <TableFooter className="bg-transparent">
                    <TableRow className="border-t-[0.5px] border-t-neutral-600/50">
                        <TableCell colSpan={columns.length} className="px-6 py-6">
                            <div className="flex items-center justify-between px-6">
                                <div className="inline-flex gap-2 items-center">
                                    <span className="text-nowrap">Per Page:</span>
                                    <PageSizeButton />
                                </div>
                                <div>
                                    <PrevButton />
                                    <NextButton />
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}