"use client"

import {
    ColumnDef,
    flexRender,
    ColumnFiltersState,
    getCoreRowModel,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    useReactTable,
    getFilteredRowModel,
} from "@tanstack/react-table"

import {
    Table, TableBody, TableCell, TableFooter,
    TableHead, TableHeader, TableRow,
} from "@/components/core/table"
import {Button} from "@/components/core/button.tsx";
import { useState } from "react";
import { Input } from "@/components/core/input";
import {Filter, Loader2, Search } from "lucide-react";
import {Label} from "@/components/core/label.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    total_transactions: number,
}

export function TransactionsTable<TData, TValue>({columns, data, total_transactions,}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });
    
    const table = useReactTable({
        data,
        columns,
        defaultColumn: {
          size: 100,
          minSize: 100,
          maxSize: 150,  
        },
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            pagination,
            sorting,
            columnFilters,
        },
    })

    return (
        <div className="border border-neutral-500/[0.3] overflow-auto rounded-2xl">
            <Table className="bg-primary/[0.09] rounded-2xl text-primary text-sm max-w-screen-lg w-full">
                <TableHeader>
                    <TableRow>
                        <TableCell className="px-6 py-6 text-2xl font-semibold" colSpan={1}>Transactions</TableCell>
                        <TableCell className="px-6 py-6" colSpan={3}>
                            <div className="flex items-center justify-end gap-4">
                                <div className="relative w-full max-w-sm">
                                    <Label htmlFor="searchTransactions" className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                    </Label>
                                    <Input
                                        id="searchTransactions"
                                        placeholder="Search"
                                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                        onChange={(event) =>
                                            table.getColumn("name")?.setFilterValue(event.target.value)
                                        }
                                        className="pl-10 border-0 ring-0 shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none bg-primary/[0.09] h-[2.085rem]"
                                    />
                                </div>
                                <Button variant="accent" className="flex items-center gap-1" size="sm">
                                    <Filter className="mt-0.5"/> Filters
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="text-primary bg-neutral-600/[0.2] px-6">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="border-0">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                className="transition-colors hover:bg-muted/[0.03] rounded-2xl"
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-6">
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
                    <TableRow className="border-t-[0.5px] border-t-neutral-600/[0.2]">
                        <TableCell colSpan={columns.length} className="px-6 py-6 text-center">
                            <Button
                                className="mx-10"
                                variant="accent"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <span>{pagination.pageIndex + 1}</span>
                            <Button
                                className="mx-10"
                                variant="accent"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
