import {LinkStart} from "@/components/Link-Start.tsx";
import axios, { AxiosResponse } from "axios";
import {useEffect, useState } from "react";
import Home from "@/components/Home.tsx";


export function DashboardPage() {
    const [connected, setConnected] = useState<Boolean>(false);
    
    useEffect(() => {
        async function getConnectionStatus(){
            const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
            await axios.get(`${backend}/IsAccountConnected`, { withCredentials: true })
                .then((response: AxiosResponse<{connected: boolean}>) => {
                    setConnected(response.data.connected);
                    console.log(response)
                })
                .catch((error: AxiosResponse) => {
                    console.error("Error occurred", error)
                })
        }
        getConnectionStatus();  
    },[connected])
    
    return (
        <main className={"h-screen w-full flex flex-col items-center justify-center"}>
            { connected ? <Home />: <LinkStart />}
        </main>
    )
}