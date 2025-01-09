import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/core/sidebar.tsx";
import { Link, linkOptions, LinkProps, useLocation} from "@tanstack/react-router";
import { PieChartIcon as ChartPie, Home, PoundSterling, WalletCards } from 'lucide-react';
import { useCallback } from "react";


type MenuItem = {
    title: string,
    url: LinkProps,
    icon: React.FC,
}

// Menu items.
const items: MenuItem[] = [
    {
        title: "Home",
        url: linkOptions({
            to: "/",
            label: "Home",
        }),
        icon: Home,
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
        icon: ChartPie,
    },
    {
        title: "Accounts",
        url: linkOptions({
            to: "/accounts",
            label: "Accounts",
        }),
        icon: WalletCards,
    },
]

export function AppSidebar() {
    const location = useLocation();
    const {isMobile, setOpenMobile} = useSidebar()
    
    const closeMobileMenu = useCallback(() => {
        if (isMobile) {
            setOpenMobile(false)
        }
    },[isMobile])
    
    return (
        <Sidebar className="bg-transparent" variant="sidebar" collapsible="none">
            <SidebarContent className={`pb-4 md:pb-0`}>
                <SidebarGroup className="my-auto">
                    <SidebarGroupContent>
                        <SidebarMenu className="relative gap-3 flex-row md:flex-col py-4 flex-wrap justify-center md:justify-start items-center md:bg-primary/[0.07] rounded-full">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title + "-sidebar"} className="flex justify-center">
                                    <SidebarMenuButton
                                        asChild
                                        onClick={closeMobileMenu}
                                        className={`rounded-full py-2 px-4 md:p-2 w-auto h-auto transition-colors duration-300
                                            ${item.url.to === location.pathname && "bg-secondary/90 text-black hover:bg-secondary/90 hover:text-black"}`}
                                        tooltip={item.title}
                                    >
                                        <Link {...item.url}>
                                            <item.icon/>
                                            <span className={"md:hidden"}>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}