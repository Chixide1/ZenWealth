export type Transaction = {
    id: number,
    merchantName: string,
    name: string,
    amount: number,
    personalFinanceCategory: string,
    category: string,
    date: string,
    datetime?: string,
    isoCurrencyCode: string,
    unofficialCurrencyCode: string,
    logoUrl?: string,
    personalFinanceCategoryIconUrl?: string,
    website?: string,
}

export type TransactionData = {
    transactions: Transaction[],
    nextCursor: number | null,
    nextDate: Date | null
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