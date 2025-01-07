import { Account, Transaction } from "@/types.ts";
import axios, { AxiosResponse } from "axios";
import { atomWithQuery } from 'jotai-tanstack-query';

export const accountsAtom = atomWithQuery(() => ({
    queryKey: ['accounts'],
    queryFn: async () => {
        const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}`;
        const response: AxiosResponse<Account[]> = await axios.get(`${backend}/accounts`, { withCredentials: true })
            .catch(error => {
                throw new Error(error)
            })
        return response.data
    }
}));

export const transactionsAtom = atomWithQuery(() => ({
    queryKey: ['transactions'],
    queryFn: async () => {
        const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}`;
        const response: AxiosResponse<Transaction[]> = await axios.get(`${backend}/transactions`, { withCredentials: true })
            .catch(error => {
                throw new Error(error)
            })
        return response.data
    }
}));
