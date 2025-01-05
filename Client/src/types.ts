export type Transaction = {
    transactionId: string;
    merchantName: string;
    name: string;
    amount: number;
    personalFinanceCategory: string,
    category: string;
    date: string;
    datetime?: string;
    isoCurrencyCode: string;
    unofficialCurrencyCode: string;
    logoUrl?: string;
    personalFinanceCategoryIconUrl?: string;
    website?: string;
}