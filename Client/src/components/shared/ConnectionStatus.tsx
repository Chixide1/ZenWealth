import {LinkStart} from "@/components/features/link/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import axios, { AxiosResponse } from "axios";
import { Loader2 } from "lucide-react";
import {useEffect, useState } from "react";

export function ConnectionStatus() {
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
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 width={40} height={40} className={"animate-spin text-primary"}/>
            </div>
        )
    }
    
    if(!connected){
        return (
            <div className={"w-full h-screen flex items-center justify-center"}>
                <LinkStart />       
            </div>
        )
    }
    
    return <Outlet />
}