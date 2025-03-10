import { useState, useEffect } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Cog, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn, getAllBudgets } from "@/lib/utils";
import type { Budget } from "@/types";
import { columns } from "@/components/features/budgets/BudgetColumns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCalendarDays, faSackXmark } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api.ts";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

interface BudgetTableProps {
    className?: string
    budgets: Budget[]
}

export function BudgetTable({ className, budgets }: BudgetTableProps) {
    "use no memo" // eslint-disable-line
    const queryClient = useQueryClient();

    // Add state management for budgets
    const [data, setData] = useState<Budget[]>(budgets);
    // Add state to track whether editing is enabled
    const [editMode, setEditMode] = useState(false);
    // Add loading state for save operation
    const [isSaving, setIsSaving] = useState(false);
    // Add toast for notifications
    const { toast } = useToast();
    // Add state for the selected day - initialize from the first budget if available
    const [selectedDay, setSelectedDay] = useState<string>(
        budgets.length > 0 ? budgets[0].day.toString() : "1"
    );

    // Update data when initialBudgets changes
    useEffect(() => {
        setData(budgets);
        // Also update the selected day when budgets change
        if (budgets.length > 0) {
            setSelectedDay(budgets[0].day.toString());
        }
    }, [budgets]);

    // Function to save budget data to the backend
    const saveBudgetData = async (dataToSave = data) => {
        try {
            setIsSaving(true);
            const response = await api.post("/Budgets", dataToSave);
            // Show success toast

            if (response.status === 200) {
                toast({
                    title: "Budget updated",
                    description: "Your budget limits have been saved successfully.",
                });
            } else {
                toast({
                    title: "Error saving budget",
                    description: "There was a problem saving your budget limits. Please try again.",
                    variant: "destructive",
                });
            }
            // Exit edit mode
            setEditMode(false);
        } catch (error) {
            console.error("Error saving budget data:", error);

            // Show error toast
            toast({
                title: "Error saving budget",
                description: "There was a problem saving your budget limits. Please try again.",
                variant: "destructive",
            });
        } finally {
            await queryClient.invalidateQueries({ queryKey: ["budgets"] });
            setIsSaving(false);
        }
    };

    const clearBudgetData = async () => {
        const defaultBudgets = getAllBudgets([]);

        try {
            setIsSaving(true);
            const response = await api.post("/Budgets", defaultBudgets);
            // Show success toast

            if (response.status === 200) {
                toast({
                    title: "Budget updated",
                    description: "Your budget limits have been saved successfully.",
                });
            } else {
                toast({
                    title: "Error saving budget",
                    description: "There was a problem saving your budget limits. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error saving budget data:", error);

            // Show error toast
            toast({
                title: "Error saving budget",
                description: "There was a problem saving your budget limits. Please try again.",
                variant: "destructive",
            });
        } finally {
            await queryClient.invalidateQueries({ queryKey: ["budgets"] });
            setIsSaving(false);
        }
    };

    const updateDayForAllBudgets = async (day: string) => {
        setSelectedDay(day);

        // Create a new array with updated day values
        const updatedData = data.map((budget) => ({
            ...budget,
            day: Number.parseInt(day, 10),
        }));

        // Update the state
        setData(updatedData);

        // Save the updated data
        try {
            setIsSaving(true);
            const response = await api.post("/Budgets", updatedData);

            if (response.status === 200) {
                toast({
                    title: "Budget day updated",
                    description: "Budget start day has been updated successfully.",
                });
            } else {
                toast({
                    title: "Error updating budget day",
                    description: "There was a problem updating the budget day. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error saving budget day:", error);
            toast({
                title: "Error updating budget day",
                description: "There was a problem updating the budget day. Please try again.",
                variant: "destructive",
            });
        } finally {
            await queryClient.invalidateQueries({ queryKey: ["budgets"] });
            setIsSaving(false);
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // Provide our data and functions to the meta allowing access through the table api
        meta: {
            editMode,
            saveBudgetData,
            updateData: (rowIndex, columnId, value) => {
                setData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex]!,
                                [columnId]: value,
                            };
                        }
                        return row;
                    }),
                );
            },
        },
    });

    return (
        <div className={cn("rounded-2xl bg-background border border-neutral-600/50 overflow-auto", className)}>
            <Table className="rounded-[inherit] text-primary text-sm">
                <TableHeader className="">
                    <TableRow>
                        <TableHead colSpan={columns.length ?? 1} className="px-0">
                            <div className="p-4 inline-flex items-center justify-between w-full text-primary">
                                <h2 className="text-xl font-medium">Monthly Budget</h2>
                                <div className="flex gap-2">
                                    <Button
                                        className="[&_svg]:size-3 items-center bg-red-500 hover:bg-red-500/80 gap-1 text-xs justify-center px-2"
                                        variant="accent"
                                        size="sm"
                                        disabled={isSaving}
                                        onClick={clearBudgetData}
                                    >
                                        <span>Clear Budgets</span>
                                        <FontAwesomeIcon icon={faSackXmark} />
                                    </Button>
                                    <Button
                                        id="SaveBudgetDataButton"
                                        className="flex items-center gap-1 text-xs justify-center px-2"
                                        variant="accent"
                                        size="sm"
                                        disabled={isSaving}
                                        onClick={() => {
                                            if (editMode) {
                                                saveBudgetData();
                                            } else {
                                                setEditMode(true);
                                            }
                                        }}
                                    >
                                        {editMode ? (
                                            isSaving ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Done</span>
                                                    <Cog />
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <span>Edit Limits</span>
                                                <Cog />
                                            </>
                                        )}
                                    </Button>
                                    <Select
                                        value={selectedDay}
                                        onValueChange={updateDayForAllBudgets}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger className="p-0 text-xs" icon={false}>
                                            <Button variant="accent" size="sm" className="[&_svg]:size-3 gap-1 px-2">
                                                <FontAwesomeIcon icon={faCalendarDays} />
                                            </Button>
                                        </SelectTrigger>
                                        <SelectContent className="w-fit !p-0 min-w-0 text-primary h-64" align="end" portal={false}>
                                            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                                <SelectItem key={day} value={day.toString()} className="w-full">
                                                    {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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