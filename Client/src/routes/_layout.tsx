import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {LinkStart} from "@/components/features/link/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import axios, {AxiosError, AxiosResponse } from "axios";
import {useEffect, useState } from "react";
import TransactionsProvider from "@/providers/TransactionsProvider.tsx";
import Loading from "@/components/shared/Loading.tsx";
import DualBar from "@/components/shared/DualBar.tsx";

export const Route = createFileRoute('/_layout')({
    component: Layout,
})

export function Layout() {
    const [hasItems, setHasItems] = useState<boolean | null>(null)
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}`
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchStatus(){
            await axios
                .get(`${backend}`, { withCredentials: true })
                .then((response: AxiosResponse<{ hasItems: boolean }>) => {
                    setHasItems(response.data.hasItems)
                })
                .catch((error: AxiosError) => {
                    if(error.response!.status === 401){
                        navigate({to: "/login"})
                    } else {
                        console.error('Error occurred', error)
                    }
                })
        }
        fetchStatus()
    }, []);

    if(hasItems == null){
        return <Loading/>
    }

    if(!hasItems){
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

