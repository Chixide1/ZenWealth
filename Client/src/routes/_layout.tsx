import { createFileRoute } from '@tanstack/react-router'
import {LinkStart} from "@/components/features/link/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import axios, { AxiosResponse } from "axios";
import {useEffect, useState } from "react";
import TransactionsProvider from "@/providers/TransactionsProvider.tsx";
import Loading from "@/components/shared/Loading.tsx";
import { SidebarProvider, SidebarTrigger } from "@/components/core/sidebar"
import { AppSidebar } from "@/components/shared/AppSidebar"

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
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    <div className="z-10 h-12 flex items-center ps-3">
                        <SidebarTrigger className="text-primary hover:bg-neutral-700/30 p-4" />
                    </div>
                    <Outlet />
                </main>
            </SidebarProvider>
        </TransactionsProvider>
    )
}

