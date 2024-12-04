import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";

export default function Home(){
    const [transactions, setTransactions] = useState([])
    
    useEffect(() => {
        async function getConnectionStatus(){
            const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
            await axios.get(`${backend}/GetTransactions`, { withCredentials: true })
                .then((response: AxiosResponse) => {
                    setTransactions(response.data);
                    console.log(response.data)
                })
                .catch((error: AxiosResponse) => {
                    console.error("Error occurred", error)
                })
        }

        getConnectionStatus();
    },[transactions])
    
    return(
        <div className="w-96 bg-primary/[0.06] p-6 rounded-2xl text-primary">
            {transactions && transactions.map((transaction) => (
                <div>{transaction.name}</div>
            ))}
        </div>
    )
}