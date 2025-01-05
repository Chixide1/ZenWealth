export type Transaction = {
    transactionId: string,
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
    id: string,
    balance: number,
    mask: string,
    name: string,
    officialName: string,
    type: string,
    subtype: string,
}