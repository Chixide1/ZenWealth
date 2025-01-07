import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {LinkStart} from "@/components/features/link/LinkStart.tsx";
import { Outlet } from "@tanstack/react-router";
import axios, {AxiosError, AxiosResponse } from "axios";
import {useEffect, useState } from "react";
import Loading from "@/components/shared/Loading.tsx";
import AppWrapper from "@/components/shared/AppWrapper.tsx";

export const Route = createFileRoute('/_layout')({
    component: Layout,
})

type AuthResponse = {
    hasItems: boolean | null,
    userName: string,
}

export function Layout() {
    const [userDetails, setUserDetails] = useState<AuthResponse>({hasItems: null, userName: ""})
    const backend = `${import.meta.env.VITE_ASPNETCORE_URLS}`
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchAuth(){
            await axios
                .get(`${backend}`, { withCredentials: true })
                .then((response: AxiosResponse<AuthResponse>) => {
                    setUserDetails(response.data);
                })
                .catch((error: AxiosError) => {
                    if(error.response!.status === 401 || error.response!.status === 500){
                        navigate({to: "/login"})
                    } else {
                        console.error('Error occurred', error)
                        navigate({to: "/login"})
                    }
                })
        }
        fetchAuth()
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
        <AppWrapper username={userDetails.userName} >
            <Outlet />
        </AppWrapper>
    )
}

