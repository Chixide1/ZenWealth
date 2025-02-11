import {
    ColumnDef,
    flexRender,
    ColumnFiltersState,
    getCoreRowModel,
    SortingState,
    getSortedRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    VisibilityState,
} from "@tanstack/react-table";
import { useAtom } from "jotai";
import {
    Table, TableBody, TableCell, TableFooter,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button.tsx";
import { useState } from "react";
import ColumnVisibilityButton from "@/components/features/transactions/ColumnVisibilityButton.tsx";
import TransactionSearchButton from "@/components/features/transactions/TransactionSearchButton.tsx";
import {Transaction, TransactionData} from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import { ChevronDown } from "lucide-react";
import Loading from "@/components/shared/Loading.tsx";
import { cn } from "@/lib/utils";
import {transactionsAtom, transactionsPaginationAtom} from "@/lib/atoms.ts";
import { ColumnFilterButton } from "@/components/features/transactions/ColumnFilterButton.tsx";

interface TransactionTableProps {
    columns: ColumnDef<Transaction, never>[]
    data: TransactionData | undefined,
    isLoading?: boolean,
    className?: string,
}

export function TransactionsTable({columns, data, isLoading, className}: TransactionTableProps) {
    "use no memo"; // eslint-disable-line
    
    const [{fetchNextPage, hasNextPage}] = useAtom(transactionsAtom);
    const [sorting, setSorting] = useState<SortingState>([]);
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
                "other": true,
                "unknown": true,
            }
        },
        {
            id: "amount",
            value: {
                min: Number.MIN_SAFE_INTEGER,
                max: Number.MAX_SAFE_INTEGER,
            }
        },
    ]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        name: true,
        category: true,
        amount: true,
        date: true,
    });
    const [pagination, setPagination] = useAtom(transactionsPaginationAtom);
    const [columnOrder] = useState<string[]>(["name", "amount", "date", "category"]);
    const [pageSizeOpen, setPageSizeOpen] = useState(false);

    const table = useReactTable<Transaction>({
        data: data?.transactions ?? [],
        columns,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
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
            columnOrder,
        },
        manualPagination: true,
        rowCount: -1
    });

    const pageSizeOptions = [10, 20, 30, 40, 50];
    
    return (
        <div className={cn("relative overflow-auto border bg-primary/[0.125] backdrop-blur-sm border-neutral-500/[0.3] rounded-2xl scrollbar-custom", className)}>
            <Table className="rounded-2xl text-primary text-sm">
                <TableHeader>
                    <TableRow>
                        <TableCell className="px-6 py-6" colSpan={columns.length}>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-xl font-medium mr-auto md:pr-10">Transaction History</span>
                                <TransactionSearchButton />
                                <ColumnFilterButton />
                                <ColumnVisibilityButton columns={table.getAllColumns()}/>
                            </div>
                        </TableCell>
                    </TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="text-primary bg-neutral-300/10 px-6"
                                        style={{width: header.getSize()}}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
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
                                <Loading fullScreen={false}/>
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
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
                                <span className="pl-2">
                                    <span className="font-bold text-secondary">
                                        {table.getFilteredRowModel().rows.length}
                                    </span>
                                    &nbsp;Total Transaction{table.getFilteredRowModel().rows.length > 1 && "s"}
                                </span>
                                <div>
                                    <span className="mr-2">Per Page:</span>
                                    <DropdownMenu modal={false} open={pageSizeOpen} onOpenChange={setPageSizeOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="accent" className="gap-0.5 p-2 font-medium" size="sm">
                                                {pagination.pageSize}
                                                <ChevronDown className={"h-4 w-4 transition-all duration-300" + (pageSizeOpen && " " + "rotate-180")} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-fit min-w-0 bg-accent">
                                            {pageSizeOptions.map((size) => (
                                                <DropdownMenuItem
                                                    key={size}
                                                    onClick={() => table.setPageSize(size)}
                                                    className={
                                                        "justify-center my-1 py-1 px-2.5 text-sm focus:bg-black/10 hover:bg-black/10" +
                                                        (pagination.pageSize === size && " bg-black/10")
                                                    }
                                                >
                                                    {size}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="">
                                    <Button
                                        className="me-2"
                                        variant="accent"
                                        size="sm"
                                        onClick={async () => {
                                            table.previousPage();
                                        }}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        className=""
                                        variant="accent"
                                        size="sm"
                                        onClick={async () => {
                                            await fetchNextPage();
                                            table.nextPage();
                                        }}
                                        disabled={!hasNextPage}
                                    >
                                        Next
                                    </Button></div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

