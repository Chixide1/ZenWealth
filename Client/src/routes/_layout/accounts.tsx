import { createFileRoute } from '@tanstack/react-router'
import {NetWorthCard} from "@/components/features/accounts/NetWorthCard.tsx";
import {accountsAtom} from "@/lib/atoms.ts";
import {useAtom} from 'jotai';

export const Route = createFileRoute('/_layout/accounts')({
    component: AccountsPage,
})

function AccountsPage() {
    const [{data}] = useAtom(accountsAtom);
    const accounts = data ?? [];
    
    return (
        <div className="grid grid-cols-12 auto-rows-auto gap-4 px-6 md:px-4 pb-8">
            <NetWorthCard accounts={accounts} className="col-span-full"/>
        </div>
    )
}
