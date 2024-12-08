import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import {transactionsCols, Transaction} from "@/components/transactions-cols.tsx";
import {TransactionsTable} from "@/components/transactions-table.tsx";

interface TransactionData {
    transactions: Transaction[];
    total_transactions: number;
}

export default function Home(){
    const [transactionsData, setTransactionsData] = useState<TransactionData>({transactions: [], total_transactions: 0});
    
    useEffect(() => {
        async function getTransactionsData(){
            const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
            await axios.get(`${backend}/GetTransactions`, { withCredentials: true })
                .then((response: AxiosResponse<TransactionData>) => {
                    setTransactionsData(response.data);
                })
                .catch((error: AxiosResponse) => {
                    console.error("Error occurred", error)
                })
        }
        getTransactionsData();
    },[])
    
    console.log(transactionsData)
    return(
        <TransactionsTable
            columns={transactionsCols}
            data={transactionsData.transactions}
            total_transactions={transactionsData.total_transactions} 
        />
    )
}