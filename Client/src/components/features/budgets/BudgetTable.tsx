import { useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Cog } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {columns, defaultBudgetItems } from "@/components/features/budgets/BudgetColumns";
import {BudgetItem} from "@/types.ts";

export function BudgetTable({ className }: { className?: string }) {
    const [data] = useState<BudgetItem[]>(defaultBudgetItems);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className={cn("rounded-2xl bg-background border border-neutral-600/50", className)}>
            <Table className="rounded-[inherit] text-primary text-sm">
                <TableHeader className="">
                    <TableRow>
                        <TableHead colSpan={columns.length} className="px-0">
                            <div className="p-4 inline-flex items-center justify-between w-full text-primary">
                                <h2 className="text-xl font-medium">Monthly Budget</h2>
                                <Button className="flex items-center gap-1 text-xs justify-center px-2" variant="accent" size="sm">
                                    <Cog />
                                </Button>
                            </div>
                        </TableHead>
                    </TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="bg-background">
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className="px-4 text-primary first:text-start text-end">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, rowIndex) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-primary/5">
                                {row.getVisibleCells().map((cell, cellIndex) => (
                                    <TableCell
                                        className={cn(
                                            "px-4 text-start",
                                            // Apply rounded corners to the last row
                                            rowIndex === table.getRowModel().rows.length - 1 && cellIndex === 0 && "rounded-bl-2xl",
                                            rowIndex === table.getRowModel().rows.length - 1 &&
                                            cellIndex === row.getVisibleCells().length - 1 &&
                                            "rounded-br-2xl",
                                        )}
                                        key={cell.id}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center rounded-b-2xl">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

