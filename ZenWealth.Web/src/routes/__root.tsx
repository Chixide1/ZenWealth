﻿import { createRootRoute, Outlet, } from "@tanstack/react-router";
import {Toaster} from "@/components/ui/toaster.tsx";

export const Route = createRootRoute({
    component: Root
});

function Root(){
    return (
        <>
            <Outlet/>
            <Toaster/>
        </>
    );
}