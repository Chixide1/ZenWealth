import { Account, Transaction } from "@/types.ts";
import { atomWithQuery } from 'jotai-tanstack-query';
import api from "@/lib/api.ts";
import { AxiosError } from "axios";

export const accountsAtom = atomWithQuery(() => ({
    queryKey: ['accounts'],
    queryFn: async () => {
        const response = await api<Account[]>("/accounts")
            .catch((e: AxiosError<Account[]>) => console.error(e))
        console.log(response)
        
        return response ? response.data : [];
    },
}));

export const transactionsAtom = atomWithQuery(() => ({
    queryKey: ['transactions'],
    queryFn: async () => {
        const response = await api<Transaction[]>("/transactions")
            .catch((e: AxiosError<Transaction[]>) => console.error(e));
        
        return response ? response.data : [];
    }
}));
