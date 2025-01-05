import { createContext, ReactNode } from 'react';
import { Transaction } from "@/types";
import axios, { AxiosResponse } from 'axios';
import { useQuery } from '@tanstack/react-query';

export const TransactionsContext = createContext<[Transaction[] | undefined, boolean]>([
    undefined,
    true
]);

async function getTransactionsData(): Promise<Transaction[]> {
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}`;
    const response: AxiosResponse<Transaction[]> = await axios.get(`${backend}/transactions`, { withCredentials: true })
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
    
    console.log(data)

    return (
        <TransactionsContext.Provider
            value={[data, isLoading]}
        >
            {children}
        </TransactionsContext.Provider>
    );
}

