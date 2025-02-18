import { createFileRoute } from "@tanstack/react-router";
import {MonthlyTransactionsWidget} from "@/components/features/transactions/MonthlyTransactionsWidget.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {RecentTransactionsCard} from "@/components/features/transactions/RecentTransactionsCard.tsx";
import {BudgetLimitCard} from "@/components/features/budgets/BudgetLimitCard.tsx";
import {cn} from "@/lib/utils.ts";
import {accountsAtom, monthlySummaryDataAtom, recentTransactionsAtom, topExpenseCategoriesAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {IncomeOutcomeLineGraph} from "@/components/features/transactions/IncomeOutcomeLineGraph.tsx";
import TopExpenseCategoriesCard from "@/components/features/transactions/TopExpenseCategoriesCard.tsx";
import LiabilitiesTreeMap from "@/components/features/accounts/LiabilitiesTreeMap.tsx";
import {MonthlyAccountsWidget} from "@/components/features/accounts/MonthlyAccountsWidget.tsx";

export const Route = createFileRoute("/_layout/")({
    component: DashboardPage,
});

function DashboardPage() {
    const [{data: accounts}] = useAtom(accountsAtom);
    const [{data: monthlySummaryData}]  = useAtom(monthlySummaryDataAtom);
    const [{data: recentTransactions}]  = useAtom(recentTransactionsAtom);
    const [{data: topExpenseCategories}]  = useAtom(topExpenseCategoriesAtom);
    // console.log(accounts);
    
    return (
        <div className="grid grid-cols-12 auto-rows-auto gap-4 px-3 md:px-4 pb-8">
            <AccountSummarySection className="col-span-full">
                <MonthlyAccountsWidget title="Total Balance" amount={accounts?.reduce((total, a) => total + a.currentBalance, 0) ?? 0} />
                <MonthlyTransactionsWidget
                    title="Total Expenditure"
                    amount={monthlySummaryData?.[monthlySummaryData?.length - 1]?.expenditure ?? 0}
                    previousAmount={monthlySummaryData?.[monthlySummaryData?.length - 2]?.expenditure ?? 0}
                    invert={true}
                />
                <MonthlyAccountsWidget title="Total Savings" amount={accounts?.reduce((total, a) => a.subtype === "Savings" ? total + a.currentBalance : total, 0) ?? 0} />
                <MonthlyTransactionsWidget
                    title="Total Income"
                    amount={monthlySummaryData?.[monthlySummaryData?.length - 1]?.income ?? 0}
                    previousAmount={monthlySummaryData?.[monthlySummaryData?.length - 2]?.income ?? 0}
                />
            </AccountSummarySection>
            <IncomeOutcomeLineGraph data={monthlySummaryData ?? []} className="col-span-full md:col-span-7"/>
            <RecentTransactionsCard
                recentTransactions={recentTransactions}
                className="col-span-full md:col-span-5 row-span-2" 
            />
            <BudgetLimitCard spent={2000} limit={7000} className="col-span-full md:col-span-7"/>
            <TopExpenseCategoriesCard gaugeData={topExpenseCategories ?? []} className="col-span-full md:col-span-5" />
            <LiabilitiesTreeMap accounts={accounts?.filter((account) => account.type === "Credit") ?? []} className="col-span-full md:col-span-7"/>
        </div>
    );
}

function AccountSummarySection({children, className}: {children: React.ReactNode, className?: string}) {
    return (
        <ScrollArea className={cn("",className)}>
            <div className="w-full  gap-6 flex">
                {children}
            </div>
            <ScrollBar orientation="horizontal"></ScrollBar>
        </ScrollArea>
    );
    
}