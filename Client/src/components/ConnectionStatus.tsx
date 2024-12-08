import {LinkStart} from "@/components/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import axios, { AxiosResponse } from "axios";

export async function ConnectionStatus() {
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}/api`
    const connected = await axios
        .get(`${backend}/IsAccountConnected`, { withCredentials: true })
        .then((response: AxiosResponse<{ connected: boolean }>) => {
            return response.data.connected;
        })
        .catch((error: AxiosResponse) => {
            console.error('Error occurred', error)
        })

    console.log("layout worked!")
    
    if(!connected){
        return <LinkStart />
    }
    
    return <Outlet />
}