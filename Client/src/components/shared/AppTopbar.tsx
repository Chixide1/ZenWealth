import { LinkButton } from "@/components/features/link/LinkButton.tsx"
import { LayoutDashboard, PoundSterling, Wallet, PieChartIcon as ChartPie, Plus, ChevronDown, HandCoins } from "lucide-react"
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
    {
        title: "Budgets",
        url: linkOptions({
            to: "/budgets",
            label: "Budgets",
        }),
        icon: HandCoins,
    },
]

export default function AppTopbar({ username }: { username: string }) {
    return (
        <header className="z-10 flex items-center justify-between py-4 px-4 w-full text-sm">
            <Link className="flex items-center mr-16" to="/">
                <Logo className="w-auto h-7" iconProps={{className: "h-7 md:h-8"}} textProps={{ className: "hidden" }} />
            </Link>
            <NavigationTabs tabs={items} />
            <LinkButton className="rounded-full md:gap-1 ml-auto w-10 h-10 md:h-8 md:w-auto" size="sm">
                <Plus className="w-auto h-2"/>
                <span className="hidden md:inline">Add Account</span>
            </LinkButton>
            <div className="inline-flex items-center gap-2 bg-background rounded-full ms-2 md:p-1 md:border border-background">
                <Avatar className="w-10 h-10 md:w-6 md:h-6">
                    <AvatarFallback className="text-black text-lg">
                        {username?.[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="md:inline-flex items-center gap-1 text-sm hidden">
                    {username?.slice(0,1).toUpperCase() + username?.slice(1)}
                    <ChevronDown className={`w-[1em] h-auto transition-transform duration-300 me-2`}/>
                </span>
            </div>
        </header>
    )
}

