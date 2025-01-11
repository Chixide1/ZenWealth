import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {LinkButton} from "@/components/features/link/LinkButton.tsx";
import { CopyPlus } from "lucide-react";
import { useLocation } from "@tanstack/react-router";

export default function AppTopbar() {
    const location = (useLocation()).pathname.replace("/", "");
    return (
        <header
            className={`bg-sidebar border-b border-sidebar-border h-16 z-10 gap-4 flex items-center px-6 flex-shrink-0 w-full justify-between text-sm`}
        >
            <SidebarTrigger
                className="text-primary md:hidden p-2 h-auto w-auto "
                size="sm"
            />
            <h1 className="mr-auto text-xl">
                {!location ? "Dashboard": (location.charAt(0).toUpperCase() + location.slice(1))}
            </h1>
            <div className="flex items-center gap-6 md:gap-8">
                <LinkButton className="w-auto rounded-full ml-auto" size="sm">
                    <CopyPlus/>
                    <span className="hidden md:block">Add Accounts</span>
                </LinkButton>
            </div>
        </header>
    )
}