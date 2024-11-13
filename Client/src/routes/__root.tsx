import { createRootRoute, Outlet } from '@tanstack/react-router'
// import { LoginPage } from '../components/Login-Page.tsx'

export const Route = createRootRoute({
    component: () => <Outlet />
})