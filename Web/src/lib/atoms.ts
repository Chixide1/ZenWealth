import type {
    Account, Budget, CategoryTotal, FinancialPeriod, Institution,
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
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { format } from "date-fns";
import { SetStateAction } from "react";
import {addColors, creditColors, debitColors} from "@/lib/utils.ts";

type TransactionRequest = {
    cursor: number | null
    date: Date | null
    amount: number | null
}

type ApiTransactionParams = Omit<TransactionParams, "beginDate" | "endDate"> & {
    beginDate: string | null
    endDate: string | null
} & TransactionRequest & { pageSize: number | null }

export const transactionsPaginationAtom = atom({
    pageIndex: 0,
    pageSize: 10,
});

const initDateStorage = <T>() => createJSONStorage<T>(
    () => localStorage,
    {
        // Custom replacer for JSON.stringify to handle Date objects
        replacer: (key, value) => {
            if (key === "beginDate" || key === "endDate") {
                return value instanceof Date ? value.toISOString() : value;
            }
            return value;
        },

        // Custom reviver for JSON.parse to reconstruct Date objects
        reviver: (key, value) => {
            if ((key === "beginDate" || key === "endDate") && value !== null) {
                return new Date(value as string | number | Date);
            }
            return value;
        }
    }
);

const baseTransactionsParamsAtom = atomWithStorage<TransactionParams>(
    "baseTransactionsParamsAtom",
    {
        name: null,
        sort: "date-desc",
        minAmount: null,
        maxAmount: null,
        beginDate: null,
        endDate: null,
        excludeAccounts: [],
        excludeCategories: [],
    },
    initDateStorage(),
    {getOnInit: true}
);

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
    endDate: Date | null,
}

type ApiCategoryTotalsParams = {
    beginDate: string | null,
    endDate: string | null,
    count: number,
}

export const categoryTotalsParamsAtom = atomWithStorage<CategoryTotalsParams>(
    "categoryTotalsParamsAtom",
    {
        beginDate: null, endDate: null
    },
    initDateStorage(),
    {getOnInit: true},
);

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
            count: 6
        };
        
        const response = await api<CategoryTotal[]>("/transactions/categoryTotals", {
            params: {...params}
        })
            .catch((e: AxiosError<CategoryTotal[]>) => console.error(e));

        return response ? response.data : [];
    }
}));

export const financialPeriodsAtom = atomWithQuery(() => ({
    queryKey: ["financialPeriods"],
    queryFn: async () => {
        const response = await api<FinancialPeriod[]>("Transactions/FinancialPeriods").catch(
            (e: AxiosError<FinancialPeriod[]>) => console.error(e),
        );

        return response ? response.data : [];
    },
}));

type UserDetails = {
    userName: string,
    email: string,
    institutions: Institution[],
}

export const userDetailsAtom = atomWithQuery(() => ({
    queryKey: ["userDetails"],
    queryFn: async () => {
        const response = await api<UserDetails>("User").catch(
            (e: AxiosError<UserDetails>) => console.error(e),
        );

        return response ? response.data : {userName: "user", email: "", institutions: []};
    },
}));