import { createFileRoute } from '@tanstack/react-router'
import {LinkStart} from "@/components/features/link/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import axios, { AxiosResponse } from "axios";
import {useEffect, useState } from "react";
import TransactionsProvider from "@/providers/TransactionsProvider.tsx";
import Loading from "@/components/shared/Loading.tsx";
import DualBar from "@/components/shared/DualBar.tsx";

export const Route = createFileRoute('/_layout')({
    component: Layout,
})

export function Layout() {
    const [connected, setConnected] = useState<boolean | null>(null)
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`

    useEffect(() => {
        async function fetchStatus(){
            await axios
                .get(`${backend}/IsAccountConnected`, { withCredentials: true })
                .then((response: AxiosResponse<{ connected: boolean }>) => {
                    setConnected(response.data.connected)
                })
                .catch((error: AxiosResponse) => {
                    console.error('Error occurred', error)
                })
        }
        fetchStatus()
    }, []);

    if(connected == null){
        return <Loading/>
    }

    if(!connected){
        return (
            <div className={"w-full h-screen flex items-center justify-center"}>
                <LinkStart />
            </div>
        )
    }

    return (
        <TransactionsProvider>
            <DualBar>
                <Outlet />
            </DualBar>
        </TransactionsProvider>
    )
}

