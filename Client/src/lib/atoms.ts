﻿import type {
    Account, Budget, CategoryTotal,
    MinMaxAmount,
    MonthlySummary,
    RecentTransactions,
    TopExpenseCategory,
    TransactionData,
    TransactionParams,
} from "@/types.ts";
import { atomWithQuery, atomWithInfiniteQuery } from "jotai-tanstack-query";
import api from "@/lib/api.ts";
import type { AxiosError } from "axios";
import { atom } from "jotai";
import { format } from "date-fns";
import { SetStateAction } from "react";
import {addColors, creditColors, debitColors} from "@/lib/utils.ts";

type TransactionRequest = {
    cursor: number | null
    date: Date | null
    amount: number | null
}

type ApiTransactionParams = Omit<TransactionParams, "beginDate" | "endDate"> & {
    beginDate: string | null // Overwrite with new type
    endDate: string | null // Overwrite with new type
} & TransactionRequest & { pageSize: number | null }

export const transactionsPaginationAtom = atom({
    pageIndex: 0,
    pageSize: 10,
});

const baseTransactionsParamsAtom = atom<TransactionParams>({
    name: null,
    sort: "date-desc",
    minAmount: null,
    maxAmount: null,
    beginDate: null,
    endDate: null,
    excludeAccounts: [],
    excludeCategories: [],
});

export const transactionsParamsAtom = atom<
    TransactionParams,
    [SetStateAction<TransactionParams>],
    void
>(
    (get) => get(baseTransactionsParamsAtom),
    (get, set, update) => {
        set(baseTransactionsParamsAtom, update);

        // Reset pagination whenever filters change
        set(transactionsPaginationAtom, {
            pageIndex: 0,
            pageSize: get(transactionsPaginationAtom).pageSize,
        });
    },
);

export const accountsAtom = atomWithQuery(() => ({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
        const response = await api<Account[]>("/accounts").catch((e: AxiosError<Account[]>) => console.error(e));

        if(response){
            const credit = response.data.filter((account: Account) => account.type === "Credit" || account.type === "Loan");
            const debit = response.data.filter((account: Account) => account.type === "Depository" || account.type === "Other");
            
            return [...addColors(credit, creditColors), ...addColors(debit, debitColors)];
        }
        
        return [];
    },
}));

export const AccountsAccordionAtom = atom<string[]>([]);

export const transactionsAtom = atomWithInfiniteQuery((get) => ({
    queryKey: ["transactions", get(transactionsParamsAtom), get(transactionsPaginationAtom).pageSize],
    queryFn: async ({ pageParam }) => {
        const params: ApiTransactionParams = {
            ...(pageParam as TransactionRequest),
            ...get(transactionsParamsAtom),
            name: get(transactionsParamsAtom).name === "" ? null : get(transactionsParamsAtom).name,
            pageSize: get(transactionsPaginationAtom).pageSize,
            beginDate: get(transactionsParamsAtom).beginDate
                ? format(get(transactionsParamsAtom).beginDate!, "yyyy-MM-dd")
                : null,
            endDate: get(transactionsParamsAtom).endDate ? format(get(transactionsParamsAtom).endDate!, "yyyy-MM-dd") : null,
        };

        const response = await api<TransactionData>("/transactions", {
            params: { ...params },
            paramsSerializer: {
                indexes: null,
            },
        }).catch((e: AxiosError<TransactionData>) => console.error(e));

        return response
            ? response.data
            : {
                transactions: [],
                nextCursor: null,
                nextDate: new Date(),
                nextAmount: null,
            };
    },
    getNextPageParam: (lastPage): TransactionRequest | null => {
        if (lastPage.nextAmount) {
            return { cursor: lastPage.nextCursor, date: null, amount: lastPage.nextAmount };
        }

        if (
            (lastPage.nextCursor === null && lastPage.nextDate === null) ||
            (lastPage.nextAmount === null && lastPage.nextCursor === null)
        ) {
            return null;
        }

        return { cursor: lastPage.nextCursor, date: lastPage.nextDate, amount: null };
    },
    initialPageParam: {},
    placeholderData: (previousData) => previousData,
}));

export const monthlySummaryDataAtom = atomWithQuery(() => ({
    queryKey: ["monthlySummary"],
    queryFn: async () => {
        const response = await api<MonthlySummary[]>("Charts/MonthlySummary").catch((e: AxiosError<MonthlySummary[]>) =>
            console.error(e),
        );

        return response ? response.data : [];
    },
}));

export const recentTransactionsAtom = atomWithQuery(() => ({
    queryKey: ["recentTransactions"],
    queryFn: async () => {
        const response = await api<RecentTransactions>("Charts/RecentTransactions").catch(
            (e: AxiosError<RecentTransactions>) => console.error(e),
        );

        return response ? response.data : { all: [], income: [], expenditure: [] };
    },
}));

export const topExpenseCategoriesAtom = atomWithQuery(() => ({
    queryKey: ["topExpenseCategories"],
    queryFn: async () => {
        const response = await api<TopExpenseCategory[]>("Charts/TopExpenseCategories").catch(
            (e: AxiosError<TopExpenseCategory>) => console.error(e),
        );

        return response ? response.data : [];
    },
}));

export const minMaxAmountAtom = atomWithQuery(() => ({
    queryKey: ["minMax"],
    queryFn: async () => {
        const response = await api<MinMaxAmount>("/transactions/minmax")
            .catch(
                (e: AxiosError<MinMaxAmount>) => console.error(e)
            );

        return response ? response.data : { min: 0, max: 0 };
    },
}));

export const budgetsAtom = atomWithQuery(() => ({
    queryKey: ["budgets"],
    queryFn: async () => {
        const response = await api<Budget[]>("/Budgets")
            .catch((e: AxiosError<Budget[]>) => console.error(e));
        
        return response ? response.data : [];
    }
}));

export const budgetTotalsAtom = atom(get => {
    const {data: budgets} = get(budgetsAtom);
    const defaultTotals = { totalLimit: 0, totalSpent: 0, totalRemaining: 0 };
    
    return budgets?.reduce(
        (totals, budget) => ({
            totalLimit: totals.totalLimit + budget.limit,
            totalSpent: totals.totalSpent + budget.spent,
            totalRemaining: totals.totalRemaining + budget.remaining
        }),
        defaultTotals
    ) ?? defaultTotals;
});

type CategoryTotalsParams = {
    beginDate: Date | null,
    endDate: Date | null
}

type ApiCategoryTotalsParams = {
    beginDate: string | null,
    endDate: string | null
}

export const categoryTotalsParamsAtom = atom<CategoryTotalsParams>({
    beginDate: null, endDate: null
});

export const categoryTotalsAtom = atomWithQuery((get) => ({
    queryKey: ["categoryTotals", get(categoryTotalsParamsAtom)],
    queryFn: async () => {
        const params: ApiCategoryTotalsParams = {
            beginDate: get(categoryTotalsParamsAtom).beginDate ? 
                format(get(categoryTotalsParamsAtom).beginDate!, "yyyy-MM-dd") :
                null,
            endDate: get(categoryTotalsParamsAtom).endDate ?
                format(get(categoryTotalsParamsAtom).endDate!, "yyyy-MM-dd") :
                null,
        };
        
        const response = await api<CategoryTotal[]>("/transactions/categoryTotals", {
            params: {...params}
        })
            .catch((e: AxiosError<CategoryTotal[]>) => console.error(e));

        return response ? response.data : [];
    }
}));