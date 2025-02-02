import { Plus } from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {LinkButton} from "@/components/features/link/LinkButton.tsx";

export function LinkStart() {
    return (
        <Card className={"w-[26rem] border border-neutral-700 bg-primary/[0.125] rounded-2xl text-primary flex flex-col items-center justify-center"}>
            <CardHeader className={"text-center"}>
                <CardTitle className={"text-2xl"}>Connect Your Bank Account</CardTitle>
                <CardDescription className={"text-neutral-400 text-lg"}>Securely link your accounts to get started with our financial services.</CardDescription>
            </CardHeader>
            <CardContent className={"rounded mb-4"}>
                <LinkButton className="rounded-full gap-1 ml-auto" size="lg">
                    <Plus />
                    <span className="">Add Account</span>
                </LinkButton>
            </CardContent>
        </Card>
    )
}