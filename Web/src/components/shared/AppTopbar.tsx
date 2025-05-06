import { LinkButton } from "@/components/features/link/LinkButton.tsx";
import { LayoutDashboard, Plus } from "lucide-react";
import { NavigationTabs, type NavItem } from "@/components/shared/NavigationTabs.tsx";
import { Link, linkOptions } from "@tanstack/react-router";
import Logo from "./Logo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChartPie, faCreditCard, faPiggyBank, faWallet } from "@fortawesome/free-solid-svg-icons";
import {SettingsDialog} from "@/components/shared/SettingsDialog.tsx";
import { useState } from "react";
import {UserDropdownMenu} from "@/components/shared/UserDropdownMenu.tsx";

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

export default function AppTopbar() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    return (
        <header className="z-10 flex items-center justify-between gap-3 p-4 w-full text-sm">
            <Link className="flex items-center mr-16" to="/">
                <Logo className="w-7 h-auto" iconProps={{className: "h-7 md:h-8"}} textProps={{ className: "hidden" }} />
            </Link>
            <NavigationTabs tabs={items} />
            <LinkButton className="rounded-full md:gap-1 ml-auto w-10 h-10 md:h-8 md:w-auto" size="sm">
                <Plus className="w-auto h-2"/>
                <span className="hidden md:inline">Add Account</span>
            </LinkButton>
            <UserDropdownMenu dialogStateSetter={setIsDialogOpen} />
            <SettingsDialog
                setIsOpen={setIsDialogOpen}
                isOpen={isDialogOpen}
            />
        </header>
    );
}