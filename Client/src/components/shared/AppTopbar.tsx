import { LinkButton } from "@/components/features/link/LinkButton.tsx";
import { LayoutDashboard, Plus } from "lucide-react";
import { NavigationTabs, type NavItem } from "@/components/shared/NavigationTabs.tsx";
import { Link, linkOptions } from "@tanstack/react-router";
import Logo from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChartPie, faCreditCard, faPiggyBank, faWallet } from "@fortawesome/free-solid-svg-icons";
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select.tsx";
import api from "@/lib/api.ts";

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
        icon: () => <FontAwesomeIcon icon={faWallet} />,
    },
    {
        title: "Transactions",
        url: linkOptions({
            to: "/transactions",
            label: "Transactions",
        }),
        icon: () => <FontAwesomeIcon icon={faCreditCard} />,
    },
    {
        title: "Budgets",
        url: linkOptions({
            to: "/budgets",
            label: "Budgets",
        }),
        icon: () => <FontAwesomeIcon icon={faPiggyBank} />,
    },
    {
        title: "Analytics",
        url: linkOptions({
            to: "/analytics",
            label: "Analytics",
        }),
        icon: () => <FontAwesomeIcon icon={faChartPie} />,
    },
];

export default function AppTopbar({ username }: { username: string }) {
    
    const handleSignOut = async () => {
        await api.post("/Auth/Logout");
        window.location.reload();
    };
    
    return (
        <header className="z-10 flex items-center justify-between gap-3 py-4 px-4 w-full text-sm">
            <Link className="flex items-center mr-16" to="/">
                <Logo className="w-auto h-7" iconProps={{className: "h-7 md:h-8"}} textProps={{ className: "hidden" }} />
            </Link>
            <NavigationTabs tabs={items} />
            <LinkButton className="rounded-full md:gap-1 ml-auto w-10 h-10 md:h-8 md:w-auto" size="sm">
                <Plus className="w-auto h-2"/>
                <span className="hidden md:inline">Add Account</span>
            </LinkButton>
            <Select
                onValueChange={(value) => {
                    if(value === "signout"){
                        handleSignOut();
                    }
                }}
            >
                <SelectTrigger className="w-fit inline-flex items-center gap-2 bg-background rounded-full md:p-1 md:border border-background">
                    <Avatar className="w-10 h-10 md:w-6 md:h-6">
                        <AvatarFallback className="text-black text-lg">
                            {username?.[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span>{username?.slice(0,1).toUpperCase() + username?.slice(1)}</span>
                </SelectTrigger>
                <SelectContent align="end">
                    <SelectItem value="signout" className="focus:text-primary focus:bg-background">
                        Sign Out
                    </SelectItem>
                </SelectContent>
            </Select>
        </header>
    );
}