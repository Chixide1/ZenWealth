import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
    SidebarProvider, SidebarTrigger
} from "@/components/core/sidebar.tsx";
import Logo from "@/components/shared/Logo.tsx";
import { Link, linkOptions, LinkProps, useLocation } from "@tanstack/react-router";
import { PieChartIcon as ChartPie, CircleUser, CreditCard, Home, PoundSterling, Search, WalletCards } from 'lucide-react';
import {LinkButton} from "@/components/features/link/LinkButton.tsx";
import {Input} from "@/components/core/input.tsx";

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

export default function DualNavbar({children}: DualNavbarProps) {
    const headerHeight = 'h-16'
    const location = useLocation();
    console.log(location.pathname)


    return (
        <SidebarProvider>
            <Sidebar className="bg-transparent" variant="sidebar" collapsible="offcanvas">
                <SidebarHeader className={`${headerHeight} md:flex flex-row items-center justify-center hidden`} >
                    <div className="flex items-center">
                        <Logo className="w-7 flex-shrink-0" />
                    </div>
                </SidebarHeader>
                <SidebarContent className={`pb-10`}>
                    <SidebarGroup className="my-auto">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-3 flex-row md:flex-col py-4 flex-wrap">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title + "-sidebar"} className="flex justify-center">
                                        <SidebarMenuButton
                                            asChild
                                            className={`bg-primary/[0.07] rounded-full p-[0.6rem] w-auto h-auto transition-colors duration-300
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
                <header className={`${headerHeight} z-10 gap-4 flex items-center ps-3 pe-6 py-3 flex-shrink-0 justify-between w-full`}>
                    <SidebarTrigger className="text-primary hover:bg-neutral-700/30 p-4"/>
                    <LinkButton className="w-auto rounded-full md:ml-20 mr-auto" size="sm">
                        <CreditCard />
                        <span className="hidden md:block">Add Accounts</span>
                    </LinkButton>
                    <form action="" className="md:mr-10 flex items-center">
                        <Search />
                        <Input
                            placeholder="Start Searching here..."
                            className="text-sm border-0 placeholder:text-neutral-400 focus-visible:ring-0
                            placeholder:text-xs placeholder:truncate"
                        />
                    </form>
                    <div className="flex items-center justify-center text-xs">
                        <CircleUser className="mr-2" />
                        <span>Chikezie Onuoha</span>
                    </div>
                </header>
                <section
                    className="flex-grow overflow-auto scrollbar-thin"
                >
                    {children}
                </section>
            </main>
        </SidebarProvider>
    )
}

