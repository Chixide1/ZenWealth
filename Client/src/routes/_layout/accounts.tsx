import { createFileRoute } from "@tanstack/react-router";
import {NetWorthCard} from "@/components/features/accounts/NetWorthCard.tsx";
import {accountsAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";

export const Route = createFileRoute("/_layout/accounts")({
    component: AccountsPage,
});

function AccountsPage() {
    const [{data}] = useAtom(accountsAtom);
    const accounts = data ?? [];
    
    return (
        <div className="">
            <NetWorthCard accounts={accounts} className="w-full"/>
        </div>
    );
}
