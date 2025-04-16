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
import { ChevronDown, LogOut, Settings, UserPlus } from "lucide-react";
import api from "@/lib/api.ts";
import Loading from "@/components/shared/Loading.tsx";
import { useNavigate } from "@tanstack/react-router";

type UserDropdownMenuItem = {
    icon: React.ReactNode,
    text: string,
    onSelect: () => void
}

type UserDropdownMenuProps = {
    dialogStateSetter:  React.Dispatch<React.SetStateAction<boolean>>,
}

export function UserDropdownMenu({ dialogStateSetter }: UserDropdownMenuProps) {
    const [{data: userDetails}] = useAtom(userDetailsAtom);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const UserDropdownMenuItems: UserDropdownMenuItem[] = [
        {
            icon: <LogOut />,
            text: "Sign Out",
            onSelect: handleSignOut,
        },
        {
            icon: <Settings />,
            text: "Settings",
            onSelect: () => {
                setIsDropdownOpen(false);
                dialogStateSetter(true);
            },
        },
        {
            icon: <UserPlus />,
            text: "Register",
            onSelect: () => { navigate({ to: "/register" });},
        }
    ];

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="max-h-10 cursor-pointer group inline-flex items-center gap-1 bg-background rounded-full md:p-1 md:border border-background focus:outline-none">
                {(userDetails ? <>
                    <Avatar className="w-10 h-10 md:w-6 md:h-6">
                        <AvatarFallback className="text-black text-lg">
                            {userDetails.userName ? userDetails.userName[0].toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span>{userDetails.userName ?
                        (userDetails.userName[0].toUpperCase() + userDetails.userName.slice(1)) :
                        "User"
                    }</span>
                    <ChevronDown className="h-auto w-4 mr-1 group-data-[state=open]:rotate-180 duration-300 transition-transform"/>
                </> : <Loading className="w-6 h-auto" />)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-700 text-primary border-neutral-600">
                {(UserDropdownMenuItems.map(item => (
                    <DropdownMenuItem
                        key={item.text}
                        className="cursor-pointer focus:text-secondary transition-colors duration-300 focus:bg-background"
                        onSelect={item.onSelect}
                    >
                        {item.icon}
                        <span>{item.text}</span>
                    </DropdownMenuItem>
                )))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const handleSignOut = async () => {
    await api.post("/Auth/Logout");
    window.location.reload();
};