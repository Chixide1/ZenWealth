import { Account, Transaction } from "@/types.ts";
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
        console.log(response)
        
        return response ? response.data : [];
    },
}));

export const transactionsAtom = atomWithInfiniteQuery(() => ({
    queryKey: ['transactions'],
    queryFn: async ({pageParam}) => {
        const response = await api<Transaction[]>("/transactions", { 
            params: { cursor: pageParam } 
        })
            .catch((e: AxiosError<Transaction[]>) => console.error(e));
        
        return response ? response.data : [];
    },
    getNextPageParam: (lastPage: Transaction[]) => {
        return lastPage.slice(-1)[0].id;
    },
    initialPageParam: 1,
    placeholderData: (previousData) => previousData,
}));
