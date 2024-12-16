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
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    VisibilityState,
} from "@tanstack/react-table"

import {
    Table, TableBody, TableCell, TableFooter,
    TableHead, TableHeader, TableRow,
} from "@/components/core/table"
import {Button} from "@/components/core/button.tsx";
import { useState } from "react";
import { Input } from "@/components/core/input";
import { Search } from "lucide-react";
import {Label} from "@/components/core/label.tsx";
import VisibilityButton from "@/components/features/transactions/VisibilityButton.tsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
}

export function TransactionsTable<TData, TValue>({columns, data}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
        {
            id: "category",
            value: {
                "bank fees": true,
                "home improvement": true,
                "rent and utilities": true,
                "entertainment": true,
                "income": true,
                "transfer in": true,
                "food and drink": true,
                "loan payments": true,
                "transfer out": true,
                "general merchandise": true,
                "medical": true,
                "transportation": true,
                "general services": true,
                "personal care": true,
                "travel": true,
                "government and non profit": true,
            }
        },
        {
           id: "amount",
           value: {
               min: Number.NEGATIVE_INFINITY,
               max: Number.POSITIVE_INFINITY,
           } 
        },
    ])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        name: true,
        category: true,
        amount: true,
        date: true,
    });
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });
    
    const table = useReactTable({
        data,
        columns,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            pagination,
            sorting,
            columnFilters,
            columnVisibility,
        },
    })
    // console.log(table.getState().columnFilters)
    
    return (
        <div className="border bg-primary/[0.09] backdrop-blur-sm border-neutral-500/[0.3] overflow-auto rounded-2xl">
            <Table className="rounded-2xl text-primary text-sm w-full">
                <TableHeader>
                    <TableRow>
                        <TableCell className="px-6 py-6" colSpan={columns.length}>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-2xl font-semibold mr-auto pr-10">Transactions</span>
                                <div className="relative w-full max-w-sm">
                                    <Label htmlFor="searchTransactions"
                                           className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <Search className="h-4 w-4 text-muted-foreground"/>
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
                                <VisibilityButton columns={table.getAllColumns() as any}/>
                            </div>
                        </TableCell>
                    </TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="text-primary bg-neutral-600/[0.2] px-6"
                                        style={{width: header.getSize()}}
                                    >
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
                                    <TableCell key={cell.id} className="px-6" style={{width: cell.column.getSize()}}>
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
                        <TableCell colSpan={columns.length} className="px-6 py-6">
                            <div className="flex items-center justify-between">
                                <span className="pl-2 font-semibold">Total Transactions: <span className="text-secondary font-medium">{table.getFilteredRowModel().rows.length}</span></span>
                                <div className="">
                                    <Button
                                        className="me-2"
                                        variant="accent"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        className=""
                                        variant="accent"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                    </Button></div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}
