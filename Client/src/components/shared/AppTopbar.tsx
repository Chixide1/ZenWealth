import {LinkButton} from "@/components/features/link/LinkButton.tsx";
import {
    CircleUser,
    CopyPlus,
    LayoutDashboard,
    PoundSterling,
    Wallet,
    BarChart3,
    LucideProps
} from "lucide-react";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/navigation-tabs.tsx";
import {Link, linkOptions, LinkProps, useLocation, useRouter } from "@tanstack/react-router";
import Logo from "./Logo";
import React from "react";

type MenuItem = {
    title: string,
    url: LinkProps,
    Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
}

// Menu items.
const items: MenuItem[] = [
    {
        title: "Dashboard",
        url: linkOptions({
            to: "/",
            label: "Dashboard",
        }),
        Icon: LayoutDashboard,
    },
    {
        title: "Accounts",
        url: linkOptions({
            to: "/accounts",
            label: "Accounts",
        }),
        Icon: Wallet,
    },
    {
        title: "Transactions",
        url: linkOptions({
            to: "/transactions",
            label: "Transactions",
        }),
        Icon: PoundSterling,
    },
    {
        title: "Analytics",
        url: linkOptions({
            to: "/analytics",
            label: "Analytics",
        }),
        Icon: BarChart3,
    },
]

export default function AppTopbar({username}: {username?: string}) {
    
    return (
        <header className="h-20 z-10 gap-4 flex items-center px-4 flex-shrink-0 w-full justify-between text-sm">
            <Link className="flex items-center" to="/">
                <Logo className="w-auto h-7" textProps={{className: "hidden md:block"}} />
            </Link>
            <Tabs >
                <TabsList className="gap-1">
                    {items.map((item) => (
                        <TabsTrigger
                            key={item.title + "::AppTopbar"}
                            value={item.url.to || "/"}
                            className="flex px-4 py-2 bg-primary/10 rounded-full items-center gap-2 text-primary font-medium transition-colors duration-300"
                        >
                            <item.Icon className={"h-auto w-4 pt-px"}/>
                            <span className="text-xs">{item.title}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
                <LinkButton className="w-auto rounded-full p-2 ml-auto" size="sm">
                    <CopyPlus/>
                    {/*<span className="hidden md:block">Add Accounts</span>*/}
                </LinkButton>
                <div className="flex items-center justify-center text-xs ml-auto pe-2 md:pe-0">
                    <CircleUser className="mr-2"/>
                    {/*<span>{username}</span>*/}
                </div>
            </div>
        </header>
    )
}