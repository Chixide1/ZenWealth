import { createContext, ReactNode } from 'react';
import { Transaction } from "@/types";
import axios, { AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';

interface TransactionData {
    transactions: Transaction[]
    total_transactions: number
}

export const TransactionsContext = createContext<[TransactionData | undefined, boolean]>([
    undefined,
    true
]);

async function getTransactionsData(): Promise<TransactionData> {
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`;
    const response: AxiosResponse<TransactionData> = await axios.get(`${backend}/GetTransactions`, { withCredentials: true })
        .catch(error => {
            throw new Error(error)
        })
    return response.data
}

export default function TransactionsProvider({ children }: { children: ReactNode }) {
    const { data, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: getTransactionsData,
    });

    return (
        <TransactionsContext.Provider
            value={[data, isLoading]}
        >
            {children}
        </TransactionsContext.Provider>
    );
}

