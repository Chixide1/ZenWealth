import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {ChartConfig} from "@/components/ui/chart.tsx";
import { format } from "date-fns";

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

export const debitColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export const creditColors = [
    "var(--red-chart-1)",
    "var(--red-chart-2)",
    "var(--red-chart-3)",
    "var(--red-chart-4)",
    "var(--red-chart-5)",
];

export function addColors<T>(items: T[], colors: string[]){
    return items.map((item, i) => ({...item, fill: colors[i % colors.length]}));
}

export const categoryMap = new Map([
    ["BANK_FEES", "https://plaid-category-icons.plaid.com/PFC_BANK_FEES.png"],
    ["HOME_IMPROVEMENT", "https://plaid-category-icons.plaid.com/PFC_HOME_IMPROVEMENT.png"],
    ["RENT_AND_UTILITIES", "https://plaid-category-icons.plaid.com/PFC_RENT_AND_UTILITIES.png"],
    ["ENTERTAINMENT", "https://plaid-category-icons.plaid.com/PFC_ENTERTAINMENT.png"],
    ["INCOME", "https://plaid-category-icons.plaid.com/PFC_INCOME.png"],
    ["TRANSFER_IN", "https://plaid-category-icons.plaid.com/PFC_TRANSFER_IN.png"],
    ["FOOD_AND_DRINK", "https://plaid-category-icons.plaid.com/PFC_FOOD_AND_DRINK.png"],
    ["LOAN_PAYMENTS", "https://plaid-category-icons.plaid.com/PFC_LOAN_PAYMENTS.png"],
    ["TRANSFER_OUT", "https://plaid-category-icons.plaid.com/PFC_TRANSFER_OUT.png"],
    ["GENERAL_MERCHANDISE", "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png"],
    ["MEDICAL", "https://plaid-category-icons.plaid.com/PFC_MEDICAL.png"],
    ["TRANSPORTATION", "https://plaid-category-icons.plaid.com/PFC_TRANSPORTATION.png"],
    ["GENERAL_SERVICES", "https://plaid-category-icons.plaid.com/PFC_GENERAL_SERVICES.png"],
    ["PERSONAL_CARE", "https://plaid-category-icons.plaid.com/PFC_PERSONAL_CARE.png"],
    ["TRAVEL", "https://plaid-category-icons.plaid.com/PFC_TRAVEL.png"],
    ["GOVERNMENT_AND_NON_PROFIT", "https://plaid-category-icons.plaid.com/PFC_GOVERNMENT_AND_NON_PROFIT.png"],
    ["OTHER", "https://plaid-category-icons.plaid.com/PFC_OTHER.png"]
]);

export function groupBy<T, K extends keyof never>(arr: T[], key: (i: T) => K) {
    return arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
    }, {} as Record<K, T[]>);
}

export function addSpaceBetweenCapitals(input: string): string {
    return input.replace(/([A-Z])/g, " $1").trim();
}