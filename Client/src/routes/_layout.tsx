import { createFileRoute,} from '@tanstack/react-router'
import {LinkStart} from "@/components/features/link/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import { AxiosResponse } from "axios";
import {useEffect, useState } from "react";
import Loading from "@/components/shared/Loading.tsx";
import AppWrapper from "@/components/shared/AppWrapper.tsx";
import api from "@/lib/api.ts";
import AppTopbar from "@/components/shared/AppTopbar.tsx";

export const Route = createFileRoute('/_layout')({
    component: Layout,
})

type UserDetailsResponse = {
    hasItems: boolean | null,
    userName: string,
}

export function Layout() {
    const [userDetails, setUserDetails] = useState<UserDetailsResponse>({hasItems: null, userName: ""})

    useEffect(() => {
        async function fetchUserDetails(){
            await api("/")
                .then((response: AxiosResponse<UserDetailsResponse>) => {
                    setUserDetails(response.data);
                })
                .catch(e => console.error("You need to reauthenticate:" + e))
        }
        fetchUserDetails()
    }, []);

    if(userDetails.hasItems === null){
        return <Loading/>
    }

    if (userDetails.hasItems === false) {
        return (
            <div className={"w-full h-screen flex items-center justify-center"}>
                <LinkStart />
            </div>
        );
    }
    
    return (
        <div className="w-full h-screen flex flex-col overflow-hidden">
            <AppTopbar />
            <main className="h-full overflow-auto scrollbar-thin">
                <Outlet />
            </main>
        </div>
    )
}

