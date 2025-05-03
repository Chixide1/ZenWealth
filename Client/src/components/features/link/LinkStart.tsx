import { Plus } from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {LinkButton} from "@/components/features/link/LinkButton.tsx";
import { SettingsDialog } from "@/components/shared/SettingsDialog";
import { UserDropdownMenu } from "@/components/shared/UserDropdownMenu";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import Logo from "@/components/shared/Logo";

export function LinkStart() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="w-full h-dvh flex flex-col items-center overflow-hidden">
            <header className="fixed w-full p-4 flex justify-between">
                <Link className="flex items-center mr-16" to="/">
                    <Logo className="w-7 h-auto" iconProps={{className: "h-7 md:h-8"}} textProps={{ className: "hidden" }} />
                </Link>
                <UserDropdownMenu dialogStateSetter={setIsDialogOpen} />
                <SettingsDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
            </header>
            <Card className={"md:w-[26rem] mx-10 my-auto border border-neutral-600 bg-primary/[0.125] rounded-2xl text-primary flex flex-col items-center justify-center"}>
                <CardHeader className={"text-center"}>
                    <CardTitle className={"text-2xl"}>Connect Your Bank Account</CardTitle>
                    <CardDescription className={"text-neutral-400 text-lg"}>Securely link your accounts to get started with our financial services.</CardDescription>
                </CardHeader>
                <CardContent className={"rounded mb-4"}>
                    <LinkButton className="rounded-full gap-1 ml-auto" size="lg" reload={true}>
                        {<Plus/>}
                        <span className="">Add Account</span>
                    </LinkButton>
                </CardContent>
            </Card>
        </div>

    );
}