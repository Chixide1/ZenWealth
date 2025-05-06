import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {ChartConfig} from "@/components/ui/chart.tsx";
import { format } from "date-fns";
import {Budget} from "@/types.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function camelCaseToSentence(text: string) {
    // Step 1: Add space before capital letters
    const withSpaces = text.replace(/([A-Z])/g, " $1");

    // Step 2: Capitalize the first letter and trim any leading space
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
}

/**
 * @param date - The date variable to format.
 * @returns Either a string version of the date suitable for the backend api or null if the variable is null.
 */
export function formatDate(date: Date | null){
    if(!date){
        return null;
    }

    return format(date, "yyyy-MM-dd");
}

export const currencyParser = new Intl.NumberFormat(["en-US", "en-GB"], {
    style: "currency",
    currency: "GBP",
    currencyDisplay: "symbol",
});

export const chartConfig = {
    id: {
        label: "ID",
    },
    name: {
        label: "Name",
    },
    currentBalance: {
        label: "Balance",
    },
    type: {
        label: "Type",
    },
    mask: {
        label: "Mask",
    },
    subtype: {
        label: "Subtype",
    },
    officialName: {
        label: "Official Name",
    }
} satisfies ChartConfig;

export const debitColors = Array.from({ length: 6 }, (_, i) => `hsl(var(--debit-chart-${i + 1}))`);
export const chartColors = Array.from({ length: 20 }, (_, i) => `hsl(var(--chart-${i + 1}))`);
export const creditColors = Array.from({ length: 5 }, (_, i) => `var(--credit-chart-${i + 1})`);

export function addColors<T>(items: T[], colors: string[]){
    return items.map((item, i) => ({...item, fill: colors[i % colors.length]}));
}

export const categories = [
    "BANK_FEES",
    "HOME_IMPROVEMENT",
    "RENT_AND_UTILITIES",
    "ENTERTAINMENT",
    "INCOME",
    "TRANSFER_IN",
    "FOOD_AND_DRINK",
    "LOAN_PAYMENTS",
    "TRANSFER_OUT",
    "GENERAL_MERCHANDISE",
    "MEDICAL",
    "TRANSPORTATION",
    "GENERAL_SERVICES",
    "PERSONAL_CARE",
    "TRAVEL",
    "GOVERNMENT_AND_NON_PROFIT",
    "OTHER"
] as const;

export type TransactionCategory = typeof categories[number];

export const categoryMap = new Map(
    categories.map(key => [
        key,
        `https://plaid-category-icons.plaid.com/PFC_${key}.png`
    ])
);

export function groupBy<T, K extends keyof never>(arr: T[], key: (i: T) => K) {
    return arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
    }, {} as Record<K, T[]>);
}

export function addSpaceBetweenCapitals(input: string): string {
    return input.replace(/([A-Z])/g, " $1").trim();
}

export function getAllBudgets(budgets: Budget[] | undefined) {
    if(!budgets){
        return [];    
    }
    
    // Extract categories from existing budgets
    const currentBudgets = budgets.map(budget => budget.category);

    // Create default budget items for categories that don't have budgets yet
    const defaultBudgets = categories.filter(c => !(c === "INCOME" || c === "TRANSFER_IN"))
        .filter(c => !currentBudgets.includes(c))
        .map(c => new Budget(c, budgets.length > 0 ? budgets[0]?.day : 1));

    // Combine existing and default budgets
    return [...budgets, ...defaultBudgets];
}

export function formatDayWithOrdinal(day: number) {
    // Create a date object with the day
    const date = new Date(2023, 0, day); // Using arbitrary year/month

    // Use format with 'do' token for day of month with ordinal
    return `${format(date, "do")} of the month`;
}