import { createColumnHelper } from "@tanstack/react-table";
import {categoryMap, currencyParser} from "@/lib/utils.ts";
import {BudgetItem} from "@/types.ts";

const columnHelper = createColumnHelper<BudgetItem>();

export const columns = [
    columnHelper.accessor("category", {
        header: "Category",
        cell: ({ row }) => (
            <div className="flex gap-2 items-center">
                <img
                    src={categoryMap.get(row.original.category)}
                    alt="an image of the category logo"
                    className="rounded min-w-6 h-auto ms-1 w-7"
                />
                {row.original.category.replace(/_/g, " ")}
            </div>
        ),
    }),
    columnHelper.accessor("limit", {
        header: "Limit",
        cell: ({ row }) => (
            <div className="text-right text-sm font-medium text-primary">
                {currencyParser.format(row.original.limit)}
            </div>
        ),
    }),
    columnHelper.accessor("spent", {
        header: "Spent",
        cell: ({ row }) => (
            <div className="text-right text-sm font-medium text-primary">
                {currencyParser.format(row.original.spent)}
            </div>
        ),
    }),
    columnHelper.accessor("remaining", {
        header: "Remaining",
        cell: ({ row }) => {
            const { remaining } = row.original;
            const bgColor = remaining < 0 ? "bg-red-500/20" : "bg-secondary/20";
            const textColor = remaining < 0 ? "text-red-500" : "text-secondary";

            return (
                <div className="flex justify-end">
                    <div className={`rounded px-2 py-1 ${bgColor}`}>
                        <span className={`text-sm font-medium ${textColor}`}>
                            {currencyParser.format(remaining)}
                        </span>
                    </div>
                </div>
            );
        },
    }),
];

export const defaultBudgetItems: BudgetItem[] = [
    {
        id: 1,
        category: "BANK_FEES",
        limit: 50,
        spent: 30,
        remaining: 20,
    },
    {
        id: 2,
        category: "HOME_IMPROVEMENT",
        limit: 300,
        spent: 200,
        remaining: 100,
    },
    {
        id: 3,
        category: "RENT_AND_UTILITIES",
        limit: 700,
        spent: 680,
        remaining: 20,
    },
    {
        id: 4,
        category: "ENTERTAINMENT",
        limit: 200,
        spent: 50,
        remaining: 150,
    },
    {
        id: 7,
        category: "FOOD_AND_DRINK",
        limit: 150,
        spent: 70,
        remaining: 80,
    },
    {
        id: 8,
        category: "LOAN_PAYMENTS",
        limit: 300,
        spent: 300,
        remaining: 0,
    },
    {
        id: 9,
        category: "TRANSFER_OUT",
        limit: 100,
        spent: 100,
        remaining: 0,
    },
    {
        id: 10,
        category: "GENERAL_MERCHANDISE",
        limit: 200,
        spent: 150,
        remaining: 50,
    },
    {
        id: 11,
        category: "MEDICAL",
        limit: 300,
        spent: 264,
        remaining: 36,
    },
    {
        id: 12,
        category: "TRANSPORTATION",
        limit: 100,
        spent: 120,
        remaining: -20,
    },
    {
        id: 13,
        category: "GENERAL_SERVICES",
        limit: 100,
        spent: 90,
        remaining: 10,
    },
    {
        id: 14,
        category: "PERSONAL_CARE",
        limit: 100,
        spent: 150,
        remaining: -50,
    },
    {
        id: 15,
        category: "TRAVEL",
        limit: 100,
        spent: 250,
        remaining: -150,
    },
    {
        id: 16,
        category: "GOVERNMENT_AND_NON_PROFIT",
        limit: 50,
        spent: 60,
        remaining: -10,
    },
    {
        id: 17,
        category: "OTHER",
        limit: 100,
        spent: 90,
        remaining: 10,
    },
];