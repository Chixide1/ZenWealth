import {Account, MonthlySummary, RecentTransactions, TopExpenseCategory, TransactionData} from "@/types.ts";
import { atomWithQuery, atomWithInfiniteQuery } from "jotai-tanstack-query";
import api from "@/lib/api.ts";
import { AxiosError } from "axios";
import { atom } from "jotai";
import { VisibilityState } from "@tanstack/react-table";

type TransactionRequest = {
    cursor: number | null,
    date: Date | null,
}

type TransactionFilters = {
    name: string | null,
    sort: string | null,
    minAmount: number | null,
    maxAmount: number | null,
    beginDate: Date | null,
    endDate: Date | null,
    category: string | null,
}

type TransactionParams = TransactionRequest & TransactionFilters & {pageSize: number | null};

export const columnVisibilityAtom = atom<VisibilityState>({
    name: true,
    category: true,
    amount: true,
    date: true,
});

export const transactionsPaginationAtom = atom({
    pageIndex: 0,
    pageSize: 10,
});

export const transactionsParamsAtom = atom<TransactionFilters>({
    name: null,
    sort: null,
    minAmount: null,
    maxAmount: null,
    beginDate: null,
    endDate: null,
    category: null,
});

export const accountsAtom = atomWithQuery(() => ({
    queryKey: ["accounts"],
    queryFn: async () => {
        const response = await api<Account[]>("/accounts")
            .catch((e: AxiosError<Account[]>) => console.error(e));
        
        return response ? response.data : [];
    },
}));

export const transactionsAtom = atomWithInfiniteQuery((get) => ({
    queryKey: ["transactions", get(transactionsParamsAtom), get(transactionsPaginationAtom).pageSize],
    queryFn: async ({pageParam}) => {
        const params: TransactionParams = {
            ...pageParam as TransactionRequest,
            ...get(transactionsParamsAtom),
            pageSize: get(transactionsPaginationAtom).pageSize,
        };

        const response = await api<TransactionData>("/transactions", { 
            params: { ...params }
        })
            .catch((e: AxiosError<TransactionData>) => console.error(e));
        
        return response ? response.data : {
            transactions: [],
            nextCursor: null,
            nextDate: new Date(),
        };
    },
    getNextPageParam: (lastPage: TransactionData): TransactionRequest => {
        return {cursor: lastPage.nextCursor, date: lastPage.nextDate};
    },
    initialPageParam: {cursor: null, date: null,},
    placeholderData: (previousData) => previousData,
}));

export const monthlySummaryDataAtom  = atomWithQuery(() => ({
    queryKey: ["monthlySummary"],
    queryFn: async () => {
        const response = await api<MonthlySummary[]>("Charts/MonthlySummary")
            .catch((e: AxiosError<MonthlySummary[]>) => console.error(e));

        return response ? response.data : [];
    }
}));

export const recentTransactionsAtom  = atomWithQuery(() => ({
    queryKey: ["recentTransactions"],
    queryFn: async () => {
        const response = await api<RecentTransactions>("Charts/RecentTransactions")
            .catch((e: AxiosError<RecentTransactions>) => console.error(e));

        return response ? response.data : {all: [], income: [], expenditure: []};
    }
}));

export const topExpenseCategoriesAtom  = atomWithQuery(() => ({
    queryKey: ["topExpenseCategories"],
    queryFn: async () => {
        const response = await api<TopExpenseCategory[]>("Charts/TopExpenseCategories")
            .catch((e: AxiosError<TopExpenseCategory>) => console.error(e));

        return response ? response.data : [];
    }
}));
