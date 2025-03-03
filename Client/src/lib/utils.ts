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

export const categories = [
    "Bank_Fees",
    "Home_Improvement",
    "Rent_And_Utilities",
    "Entertainment",
    "Income",
    "Transfer_In",
    "Food_And_Drink",
    "Loan_Payments",
    "Transfer_Out",
    "General_Merchandise",
    "Medical",
    "Transportation",
    "General_Services",
    "Personal_Care",
    "Travel",
    "Government_And_Non_Profit",
    "Other",
];

export function groupBy<T, K extends keyof never>(arr: T[], key: (i: T) => K) {
    return arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
    }, {} as Record<K, T[]>);
}

export function addSpaceBetweenCapitals(input: string): string {
    return input.replace(/([A-Z])/g, " $1").trim();
}