import { BadgePoundSterling } from "lucide-react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/core/card.tsx";
import {LinkButton} from "@/components/features/link/LinkButton.tsx";

export function LinkStart() {
    return (
        <Card className={"w-[26rem] bg-primary/[0.06] rounded-2xl border-0 text-primary flex flex-col items-center justify-center"}>
            <CardHeader className={"text-center"}>
                <CardTitle className={"text-2xl"}>Connect Your Bank Account</CardTitle>
                <CardDescription className={"text-neutral-400"}>Securely link your accounts to get started with our financial services.</CardDescription>
            </CardHeader>
            <CardContent className={"bg-neutral-100/[0.08] rounded p-6 mb-4"}>
                <BadgePoundSterling size={64} strokeWidth={1}/>
            </CardContent>
            <CardFooter className={"w-full"}>
                <LinkButton>Connect Your Accounts</LinkButton>
            </CardFooter>
        </Card>
    )
}