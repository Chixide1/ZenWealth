import {SidebarTrigger} from "@/components/core/sidebar.tsx";
import {LinkButton} from "@/components/features/link/LinkButton.tsx";
import {CircleUser, CopyPlus } from "lucide-react";

export default function AppTopbar({username}: {username?: string}) {
    
    return (
        <header
            className={`h-16 z-10 gap-4 flex items-center px-3 md:pe-8 flex-shrink-0 w-full justify-between text-sm`}
        >
            <SidebarTrigger
                className="text-primary p-2 h-auto w-auto hover:bg-neutral-700/20 transition-colors duration-300"
                size="sm"
            />
            <div className="flex items-center gap-6 md:gap-8">
                <LinkButton className="w-auto rounded-full ml-auto" size="sm">
                    <CopyPlus/>
                    <span className="hidden md:block">Add Accounts</span>
                </LinkButton>
                <div className="flex items-center justify-center text-xs ml-auto pe-2 md:pe-0">
                    <CircleUser className="mr-2"/>
                    <span>{username}</span>
                </div>
            </div>
        </header>
    )
}