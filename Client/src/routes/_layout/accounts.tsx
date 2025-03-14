import { createFileRoute } from "@tanstack/react-router";
import {NetWorthPieChart} from "@/components/features/accounts/NetWorthPieChart.tsx";
import {accountsAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {AccountsOverviewCard} from "@/components/features/accounts/AccountsOverviewCard.tsx";
import {groupBy} from "@/lib/utils.ts";
import {AccountsAccordion} from "@/components/features/accounts/AccountsAccordion.tsx";

export const Route = createFileRoute("/_layout/accounts")({
    component: AccountsPage,
});

function AccountsPage() {
    const [{data}] = useAtom(accountsAtom);
    const accounts = data ?? [];
    
    const accountTypes =  Object.entries(groupBy(accounts, (account) => account.type));
    
    return (
        <div className="w-dvw flex flex-col md:flex-row px-4 pb-8 gap-4">
            <section className="md:w-8/12 rounded-xl h-fit space-y-4">
                <NetWorthPieChart accounts={accounts} className="w-full rounded-[inherit]"/>
                <AccountsAccordion accountTypes={accountTypes} />
            </section>
            <section className="md:w-4/12 p-6 bg-background border border-neutral-600 rounded-xl h-fit sticky top-0">
                <h2 className="mb-4 text-lg font-medium">Accounts Overview</h2>
                {accountTypes.map((type, i) => (
                    <AccountsOverviewCard
                        key={`${type}-${i}::AccountsOverviewCard`}
                        title={type[0]}
                        accounts={type[1]}
                    /> 
                ))}
            </section>
        </div>
    );
}
