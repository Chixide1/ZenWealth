import { LinkButton } from "@/components/features/link/LinkButton.tsx"
import { LayoutDashboard, PoundSterling, Wallet, PieChartIcon as ChartPie, Plus, ArrowUpDown, ChevronDown } from "lucide-react"
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

export default function AppTopbar({ username }: { username: string }) {
    return (
        <header className="z-10 flex items-center justify-between py-4 px-4 w-full text-sm">
            <Link className="flex items-center mr-16" to="/">
                <Logo className="w-auto h-7" textProps={{ className: "hidden" }} />
            </Link>
            <NavigationTabs tabs={items} />
            <LinkButton className="rounded-full gap-1 ml-auto" size="sm">
                <Plus />
                <span className="">Add Account</span>
            </LinkButton>
            <div className="flex items-center gap-2 bg-primary/10 rounded-full ms-2 py-1 px-1 border border-primary/10">
                <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-black text-lg">
                        {username?.[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="flex items-center gap-1 text-sm">
                    {username?.slice(0,1).toUpperCase() + username?.slice(1)}
                    <ChevronDown className={`mt-1 w-[1em] h-auto transition-transform duration-300`}/>
                </span>
            </div>
        </header>
    )
}

