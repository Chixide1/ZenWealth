import {cn} from "@/lib/utils.ts";
import {Account} from "@/types.ts";
import axios, { AxiosResponse } from "axios";
import { useEffect } from "react";

type AccountSummaryCardProps = {
    children?: React.ReactNode,
    className?: string
}

export function AccountSummaryCard({children, className}: AccountSummaryCardProps) {

    useEffect(() => {
        async function getAccountsData(): Promise<Account[]> {
            const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}`;
            const response: AxiosResponse<Account[]> = await axios.get(`${backend}/transactions`, { withCredentials: true })
                .catch(error => {
                    throw new Error(error)
                })
            return response.data
        }
        getAccountsData();
    }, []);
    
    return (
        <div className={cn("bg-primary/10 col-span-4 p-4 rounded-2xl border border-neutral-700", className)}>
            {children}
        </div>
    )
}