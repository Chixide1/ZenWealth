import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { LinkStart } from "@/components/features/link/LinkStart.tsx";
import { AxiosResponse } from "axios";
import api from "@/lib/api.ts";
import AppTopbar from "@/components/shared/AppTopbar.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { useQueryClient } from "@tanstack/react-query";

type UserDetailsResponse = {
    hasItems: boolean | null,
};

export const Route = createFileRoute("/_layout")({
    component: Layout,
    loader: fetchUserDetails,
});

function Layout() {
    const queryClient = useQueryClient();
    const userDetails = useLoaderData({ from: Route.id });

    if (!userDetails.hasItems) {
        return (
            <LinkStart />
        );
    }
    
    queryClient.prefetchQuery({queryKey: ["transactions"]});
    
    return (
        <main className="w-full h-screen flex flex-col overflow-hidden min-w-[350px]">
            <AppTopbar />
            <ScrollArea className="w-full h-full max-w-screen-[1700px] mx-auto">
                <Outlet />
            </ScrollArea>
            <Toaster />
        </main>
    );
}

async function fetchUserDetails() {
    try {
        const response: AxiosResponse<UserDetailsResponse> = await api("/Auth/ItemsStatus");

        if (!response) {
            throw new Error();
        }
        return response.data;
    } catch (e) {
        console.error(e);
        throw new Error("Couldn't contact the Server", { cause: e });
    }
}