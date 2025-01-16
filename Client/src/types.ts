﻿export type Transaction = {
    Id: number,
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