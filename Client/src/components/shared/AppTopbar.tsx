import { LinkButton } from "@/components/features/link/LinkButton.tsx"
import { LayoutDashboard, PoundSterling, Wallet, PieChartIcon as ChartPie, Plus } from "lucide-react"
import { NavigationTabs, type NavItem } from "@/components/shared/NavigationTabs.tsx"
import { Link, linkOptions } from "@tanstack/react-router"
import Logo from "./Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx"

const items: NavItem[] = [
    {
        title: "Dashboard",
        url: linkOptions({
            to: "/",
            label: "Dashboard",
        }),
        icon: LayoutDashboard,
    },
    {
        title: "Accounts",
        url: linkOptions({
            to: "/accounts",
            label: "Accounts",
        }),
        icon: Wallet,
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
]

export default function AppTopbar({ username }: { username?: string }) {
    return (
        <header className="z-10 flex items-center justify-between py-4 px-4 w-full text-sm">
            <Link className="flex items-center mr-16" to="/">
                <Logo className="w-auto h-7" textProps={{ className: "hidden" }} />
            </Link>
            <NavigationTabs tabs={items} />
            <div className="flex items-center gap-2 ml-auto bg-primary/10 rounded-full p-1">
                <LinkButton className="text-xl rounded-full w-8 h-8" size="sm">
                    <Plus />
                </LinkButton>
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-black text-lg">
                        {username?.[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}

