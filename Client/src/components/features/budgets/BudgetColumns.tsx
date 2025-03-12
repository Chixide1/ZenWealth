import { createColumnHelper } from "@tanstack/react-table";
import { categoryMap, currencyParser } from "@/lib/utils";
import type { Budget } from "@/types";
import CurrencyInput from "react-currency-input-field";
import { useEffect, useState } from "react";
import ColumnSortingButton from "@/components/features/transactions/ColumnSortingButton.tsx";

const columnHelper = createColumnHelper<Budget>();

export const columns = [
    columnHelper.accessor("category", {
        header: ({column}) => (
            <ColumnSortingButton
                name={column.id}
                className=""
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            />
        ),
        cell: ({ row }) => (
            <div className="flex gap-2 items-center">
                <img
                    src={categoryMap.get(row.original.category) || "/placeholder.svg"}
                    alt="an image of the category logo"
                    className="rounded min-w-6 h-auto ms-1 w-7"
                />
                {row.original.category.replace(/_/g, " ")}
            </div>
        ),
    }),
    columnHelper.accessor("limit", {
        header: ({column}) => (
            <ColumnSortingButton
                name={column.id}
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            />
        ),
        cell: ({ getValue, row, column, table }) => {
            const initialValue = getValue();
            const editMode = table.options.meta?.editMode || false;
            // We need to keep and update the state of the cell normally
            const [value, setValue] = useState(initialValue);

            // When the input is blurred, we'll call our table meta's updateData function
            const onBlur = () => {
                table.options.meta?.updateData(row.index, column.id, value);
            };

            // If the initialValue is changed external, sync it up with our state
            useEffect(() => {
                setValue(initialValue);
            }, [initialValue]);

            // console.log(inputRef);

            return (
                <div className={`text-right text-sm font-medium text-primary ${editMode && "p-0"}`}>
                    {editMode ? (
                        <CurrencyInput
                            className="max-w-28 text-end ml-auto p-2 rounded-md border border-input bg-background"
                            value={value}
                            decimalsLimit={2}
                            prefix="£"
                            decimalScale={2}
                            step={1.01}
                            decimalSeparator="."
                            groupSeparator=","
                            onValueChange={(value) => setValue(value ? Number.parseFloat(value) : 0)}
                            onBlur={onBlur}
                            onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                    onBlur();
                                    setTimeout(() => {
                                        table.options.meta?.saveBudgetData();
                                    }, 0);
                                }
                            }}
                        />
                    ) : (
                        <div className="max-w-36 text-end px-3 py-2">{currencyParser.format(value as number)}</div>
                    )}
                </div>
            );
        },
    }),
    columnHelper.accessor("spent", {
        header: ({column}) => (
            <ColumnSortingButton
                name={column.id}
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            />
        ),
        cell: ({ row }) => (
            <div className="text-right text-sm font-medium text-primary">{currencyParser.format(row.original.spent)}</div>
        ),
    }),
    columnHelper.accessor("remaining", {
        header: ({column}) => (
            <ColumnSortingButton
                name={column.id}
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            />
        ),
        cell: ({ row }) => {
            const { remaining } = row.original;
            const bgColor = remaining < 0 ? "bg-red-500/20" : "bg-secondary/20";
            const textColor = remaining < 0 ? "text-red-500" : "text-secondary";

            return (
                <div className="flex justify-end">
                    <div className={`rounded px-2 py-1 ${bgColor}`}>
                        <span className={`text-sm font-medium text-nowrap ${textColor}`}>{currencyParser.format(remaining)}</span>
                    </div>
                </div>
            );
        },
    }),
];

