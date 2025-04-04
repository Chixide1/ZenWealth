import { TransactionCategory } from "@/lib/utils.ts";

export type Transaction = {
    id: number,
    name: string,
    accountName: string,
    amount: number,
    category: string,
    date: string,
    datetime?: string,
    isoCurrencyCode: string,
    logoUrl?: string,
    categoryIconUrl: string,
}

export type TransactionData = {
    transactions: Transaction[],
    nextCursor: number | null,
    nextDate: Date | null,
    nextAmount: number | null,
}

export type TransactionParams = {
    name: string | null
    sort: string
    minAmount: number | null
    maxAmount: number | null
    beginDate: Date | null
    endDate: Date | null
    excludeCategories: string[]
    excludeAccounts: string[]
}

export type Account = {
    id: number,
    currentBalance: number,
    availableBalance: number,
    mask: string,
    name: string,
    officialName: string,
    type: "Credit" | "Loan" | "Depository" | "Other",
    subtype: string,
    fill?: string
}

export type MonthlySummary = {
    month: string,
    income: number,
    expenditure: number,
}

export type RecentTransactions = {
    all: Transaction[],
    income: Transaction[]
    expenditure: Transaction[]
}

export type TopExpenseCategory = {
    category: string,
    expenditure: number,
    total: number,
    iconUrl: string,
}

export type MinMaxAmount = {
    min: number,
    max: number,
}

export class Budget {
    readonly category: TransactionCategory;
    readonly limit: number;
    readonly spent: number;
    readonly remaining: number;
    readonly day: number;

    constructor(category: TransactionCategory, day: number = 1, limit: number = 0, spent: number = 0) {
        this.category = category;
        this.limit = limit;
        this.spent = spent;
        this.remaining = limit - spent;
        this.day = day;
    }
}

export type CategoryTotal = {
    category: TransactionCategory,
    total: number,
}

export type FinancialPeriod = {
    year: number;
    month: number;
    categories: Record<TransactionCategory, number>;
    totals: {
        income: number;
        expenses: number;
        netProfit: number;
    };
}