import { ChartPie, Home, PoundSterling, WalletCards } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/core/sidebar"
import {Link, linkOptions, LinkProps } from '@tanstack/react-router'

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
            to: "/",
            label: "Analytics",
        }),
        icon: ChartPie,
    },
    {
        title: "Accounts",
        url: linkOptions({
            to: "/",
            label: "Accounts",
        }),
        icon: WalletCards,
    },
]

export function AppSidebar() {
    return (
        <Sidebar className="bg-transparent" variant="sidebar" collapsible="icon">
            <SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title + "-sidebar"}>
                                    <SidebarMenuButton asChild>
                                        <Link {...item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            </SidebarHeader>
        </Sidebar>
    )
}
