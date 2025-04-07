import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import { useState } from "react";
import {userDetailsAtom} from "@/lib/atoms.ts";
import { useAtom } from "jotai";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import api from "@/lib/api.ts";
import Loading from "@/components/shared/Loading.tsx";

type UserDropdownMenuProps = {
    dialogStateSetter:  React.Dispatch<React.SetStateAction<boolean>>,
}

export function UserDropdownMenu({ dialogStateSetter }: UserDropdownMenuProps) {
    const [{data: userDetails}] = useAtom(userDetailsAtom);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="max-h-10 cursor-pointer group inline-flex items-center gap-1 bg-background rounded-full md:p-1 md:border border-background focus:outline-none">
                {(userDetails? <>
                    <Avatar className="w-10 h-10 md:w-6 md:h-6">
                        <AvatarFallback className="text-black text-lg">
                            {userDetails?.userName[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span>{userDetails?.userName.slice(0, 1).toUpperCase() + userDetails?.userName.slice(1)}</span>
                    <ChevronDown className="h-auto w-4 mr-1 group-data-[state=open]:rotate-180 duration-300 transition-transform"/>
                </> : <Loading className="w-6 h-auto" />)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-700 text-primary border-neutral-600">
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer focus:text-secondary transition-colors duration-300 focus:bg-background"
                >
                    <LogOut />
                    <span>Sign Out</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer focus:text-secondary transition-colors duration-300 focus:bg-background"
                    onSelect={() => {
                        setIsDropdownOpen(false);
                        dialogStateSetter(true);
                    }}
                >
                    <Settings />
                    <span>Settings</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const handleSignOut = async () => {
    await api.post("/Auth/Logout");
    window.location.reload();
};