import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {ChartConfig} from "@/components/ui/chart.tsx";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function camelCaseToSentence(text: string) {
    // Step 1: Add space before capital letters
    const withSpaces = text.replace(/([A-Z])/g, " $1");

    // Step 2: Capitalize the first letter and trim any leading space
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
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

export const assetColors = [
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