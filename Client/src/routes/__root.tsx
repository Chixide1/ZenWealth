import { createRootRoute, Outlet, } from '@tanstack/react-router'
import {Auth} from "@/components/Auth.tsx";

export const Route = createRootRoute({
    beforeLoad: Auth,
    component: Root
})

function Root(){
    return (
        <Outlet />
    )
}