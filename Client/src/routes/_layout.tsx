import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { LinkStart } from "@/components/features/link/LinkStart.tsx";
import { AxiosResponse } from "axios";
import api from "@/lib/api.ts";
import AppTopbar from "@/components/shared/AppTopbar.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_layout")({
    component: LayoutComponent,
    loader: fetchUserDetailsLoader,
});

function LayoutComponent() {
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
        </main>
    );
}

type UserDetailsResponse = {
    hasItems: boolean | null,
};

async function fetchUserDetailsLoader() {
    const response: AxiosResponse<UserDetailsResponse> = await api("/User/ItemsStatus");
    return response.data;
}