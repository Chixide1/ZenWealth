import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarProvider
} from "@/components/core/sidebar.tsx";
import { Link, linkOptions, LinkProps, useLocation } from "@tanstack/react-router";
import { PieChartIcon as ChartPie, Home, PoundSterling, WalletCards } from 'lucide-react';
import Topbar from "@/components/shared/Topbar.tsx";

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

type DualNavbarProps = {
    children?: React.ReactNode;
}

export default function DualBar({children}: DualNavbarProps) {
    const location = useLocation();

    return (
        <SidebarProvider>
            <Sidebar className="bg-transparent" variant="sidebar" collapsible="offcanvas">
                <SidebarContent className={`pb-4 md:pb-0`}>
                    <SidebarGroup className="my-auto">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-3 flex-row md:flex-col py-4 flex-wrap justify-center md:justify-start">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title + "-sidebar"} className="flex justify-center">
                                        <SidebarMenuButton
                                            asChild
                                            className={`bg-primary/[0.07] rounded-full py-2 px-4 md:p-2 w-auto h-auto transition-colors duration-300
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
            <main className="w-full h-screen flex flex-col overflow-hidden">
                <Topbar />
                <section
                    className="flex-grow overflow-auto scrollbar-thin px-4 md:pe-4 pb-10"
                >
                    {children}
                </section>
            </main>
        </SidebarProvider>
    )
}

