import { createContext, ReactNode } from 'react';
import { Transaction } from "@/types";
import axios, { AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';
import Loading from "@/components/shared/Loading.tsx";

interface TransactionData {
    transactions: Transaction[]
    total_transactions: number
}

export const TransactionsContext = createContext<TransactionData>({
    transactions: [],
    total_transactions: 0,
});

async function getTransactionsData(): Promise<TransactionData> {
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`;
    const response: AxiosResponse<TransactionData> = await axios.get(`${backend}/GetTransactions`, { withCredentials: true })
        .catch(error => {
            throw new Error(error)
        })
    return response.data
}

export default function TransactionsProvider({ children }: { children: ReactNode }) {
    const { data, dataUpdatedAt, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: getTransactionsData,
    });

    if (isLoading) {
        return <Loading />
    }
    console.log(new Date(dataUpdatedAt))

    return (
        <TransactionsContext.Provider value={data ?? { transactions: [], total_transactions: 0 }}>
            {children}
        </TransactionsContext.Provider>
    );
}

