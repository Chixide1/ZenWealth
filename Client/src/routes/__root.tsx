import { createRootRoute, Outlet, } from '@tanstack/react-router'
import {Auth} from "@/components/shared/Auth.tsx";
import Loading from '@/components/shared/Loading';

export const Route = createRootRoute({
    pendingComponent: Loading,
    beforeLoad: Auth,
    component: Root
})

function Root(){
    return (
        <Outlet />
    )
}