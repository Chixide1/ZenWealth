import { createContext, useEffect, useState } from 'react';
import {Transaction} from "@/types.ts";
import axios, { AxiosResponse } from 'axios';

interface TransactionData {
    transactions: Transaction[]
    total_transactions: number
}

export const TransactionsContext = createContext<TransactionData>({
    transactions: [],
    total_transactions: 0,
});

export default function TransactionsProvider({ children }: {children: React.ReactNode}) {
    const [transactionsData, setTransactionsData] = useState<TransactionData>({
        transactions: [],
        total_transactions: 0,
    })

    useEffect(() => {
        async function getTransactionsData() {
            const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
            await axios
                .get(`${backend}/GetTransactions`, { withCredentials: true })
                .then((response: AxiosResponse<TransactionData>) => {
                    setTransactionsData(response.data)
                })
                .catch((error: AxiosResponse) => {
                    console.error('Error occurred', error)
                })
        }
        getTransactionsData()
    }, [])
    
    return (
        <TransactionsContext.Provider value={transactionsData}>
            {children}
        </TransactionsContext.Provider>
    )
}