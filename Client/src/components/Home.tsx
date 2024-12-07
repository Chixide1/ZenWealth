import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

interface Transaction {
    transaction_id: string;
    merchant_name: string;
    name: string;
    amount: number;
    personal_finance_category: {
        primary: string;
    }
    date: string;
    date_time: string;
}

export default function Home(){
    const [transactions, setTransactions] = useState<Transaction[]>([])
    
    useEffect(() => {
        async function getTransactions(){
            const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
            await axios.get(`${backend}/GetTransactions`, { withCredentials: true })
                .then((response: AxiosResponse<Transaction[]>) => {
                    setTransactions(response.data);
                })
                .catch((error: AxiosResponse) => {
                    console.error("Error occurred", error)
                })
        }
        getTransactions();
    },[])
    
    console.log(transactions)
    return(
        <div className="w-96 bg-primary/[0.06] p-6 rounded-2xl text-primary">
            {transactions && transactions.map((transaction) => (
                <div key={transaction.transaction_id}>
                    {transaction.merchant_name || transaction.name} |&nbsp;
                    £{transaction.amount} |&nbsp;
                    {transaction.personal_finance_category.primary} |&nbsp;
                    {new Date(transaction.date_time || transaction.date).toLocaleDateString()}
                </div>
            ))}
        </div>
    )
}