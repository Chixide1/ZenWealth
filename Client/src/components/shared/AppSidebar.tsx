"use client"

import * as React from "react"
import { BarChart3, CircleUser, HelpCircle, LayoutDashboard, LucideProps,
    PoundSterling, Search, Settings, Wallet, X } from 'lucide-react'

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    // useSidebar,
} from "@/components/ui/sidebar"
import Logo from "@/components/shared/Logo.tsx";
import {Link, linkOptions, LinkProps, useLocation } from "@tanstack/react-router"

type MenuItem = {
    title: string,
    url: LinkProps,
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
}

// Menu items.
const items: MenuItem[] = [
    {
        title: "Dashboard",
        url: linkOptions({
            to: "/",
            label: "Dashboard",
        }),
        icon: LayoutDashboard,
    },
    {
        title: "Transactions",
        url: linkOptions({
            to: "/transactions",
            label: "Transactions",
        }),
        icon: PoundSterling,
    },
    {
        title: "Analytics",
        url: linkOptions({
            to: "/analytics",
            label: "Analytics",
        }),
        icon: BarChart3,
    },
    {
        title: "Accounts",
        url: linkOptions({
            to: "/accounts",
            label: "Accounts",
        }),
        icon: Wallet,
    },
]


const systemItems = [
    {
        title: "Settings",
        icon: Settings,
        href: "#",
    },
    {
        title: "Help",
        icon: HelpCircle,
        href: "#",
    },
]

export function AppSidebar({username}: {username: string}) {
    const location = useLocation();
    // const {isMobile, setOpenMobile} = useSidebar()

    // const closeMobileMenu = React.useCallback(() => {
    //     if (isMobile) {
    //         setOpenMobile(false)
    //     }
    // },[isMobile])
    const [searchQuery, setSearchQuery] = React.useState("")

    return (
        <Sidebar className="bg-sidebar border-r border-sidebar-border">
            <SidebarHeader className="h-16 flex flex-row items-center border-b border-sidebar-border">
                <div className="flex items-center ps-2 gap-2">
                    <Logo className="w-5"/>
                    <span className="font-semibold text-white">ZenWealth</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <div className="relative mt-5 mx-4">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"/>
                    <input
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full border border-sidebar-border rounded-md bg-inherit pl-8 pr-8 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    )}
                </div>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                className="hover:bg-inherit data-[active=true]:text-foreground data-[active=true]:bg-inherit active:bg-inherit"
                                asChild={true}
                                data-active={item.url.to === location.pathname}
                            >
                                <Link
                                    {...item.url}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-400"
                                >
                                    <item.icon className="h-4 w-4"/>
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <SidebarMenu className="mt-auto">
                    {systemItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-300"
                                >
                                    <item.icon className="h-4 w-4"/>
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="py-2 w-full">
                <SidebarMenu className="w-full">
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-gray-400 hover:text-gray-300 p-0">
                            <div className="flex items-center  text-xs">
                                <CircleUser className="mr-2 w-4"/>
                                <span>{username}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

