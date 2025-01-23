import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {RecentTransactionsCard} from "@/components/features/transactions/RecentTransactionsCard.tsx";
import {BudgetLimitCard} from "@/components/features/budgets/BudgetLimitCard.tsx";
import {cn} from "@/lib/utils.ts";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    return (
      <div className="grid grid-cols-12 auto-rows-auto gap-4 px-6 md:px-4 pb-8">
          <AccountSummarySection className="col-span-full">
              <AccountSummaryCard dataTitle="Income" amount={2100} previousAmount={1950}/>
              <AccountSummaryCard dataTitle="Expenditure" amount={1500} previousAmount={1900} invert={true}/>
              <AccountSummaryCard dataTitle="Savings" amount={500} previousAmount={627}/>
              <AccountSummaryCard dataTitle="Liabilities" amount={750} previousAmount={543} invert={true}/>
          </AccountSummarySection>
          <RecentTransactionsCard />
          <BudgetLimitCard spent={2000} limit={7000} className="col-span-full md:col-span-7"/>
      </div>
    )
}

function AccountSummarySection({children, className}: {children: React.ReactNode, className?: string}) {

        return (
            <ScrollArea className={cn("",className)}>
                <div className="w-full  gap-6 flex">
                    {children}
                </div>
                <ScrollBar orientation="horizontal"></ScrollBar>
            </ScrollArea>
        )
    
}