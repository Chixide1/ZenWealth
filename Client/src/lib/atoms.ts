import {Account, TransactionData} from "@/types.ts";
import { atomWithQuery, atomWithInfiniteQuery } from 'jotai-tanstack-query';
import api from "@/lib/api.ts";
import { AxiosError } from "axios";
import { atom } from "jotai";

export const transactionsPaginationAtom = atom({
    pageIndex: 0,
    pageSize: 10,
});

export const accountsAtom = atomWithQuery(() => ({
    queryKey: ['accounts'],
    queryFn: async () => {
        const response = await api<Account[]>("/accounts")
            .catch((e: AxiosError<Account[]>) => console.error(e))
        
        return response ? response.data : [];
    },
}));

type TransactionRequest = {
    cursor: number | null,
    date: Date | null,
}

export const transactionsAtom = atomWithInfiniteQuery(() => ({
    queryKey: ['transactions'],
    queryFn: async ({pageParam}) => {
        const response = await api<TransactionData>("/transactions", { 
            params: { cursor: pageParam.cursor, date: pageParam.date } 
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
    initialPageParam: {cursor: null, date: null},
    placeholderData: (previousData) => previousData,
}));
