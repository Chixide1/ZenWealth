import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {TransactionsCard} from "@/components/features/transactions/TransactionsCard.tsx";
import {BudgetLimitCard} from "@/components/features/budgets/BudgetLimitCard.tsx";
import {cn} from "@/lib/utils.ts";
import {transactionsAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {MonthlyComparisonLineGraph} from "@/components/features/accounts/MonthlyComparisonLineGraph.tsx";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    const [{data: transactions}] = useAtom(transactionsAtom);
    const MonthlySummaryData = [
        { month: "Jan", income: 4200, expenses: 2800 },
        { month: "Feb", income: 3500, expenses: 2500 },
        { month: "Mar", income: 3800, expenses: 3200 },
        { month: "Apr", income: 4000, expenses: 3000 },
        { month: "May", income: 4800, expenses: 5800 },
        { month: "Jun", income: 5000, expenses: 4500 },
        { month: "Jul", income: 5600, expenses: 4200 },
        { month: "Aug", income: 5200, expenses: 4000 },
        { month: "Sep", income: 4800, expenses: 6600 },
        { month: "Oct", income: 4500, expenses: 3500 },
        { month: "Nov", income: 4200, expenses: 3200 },
        { month: "Dec", income: 4800, expenses: 4000 },
    ];
    
    return (
      <div className="grid grid-cols-12 auto-rows-auto gap-4 px-6 md:px-4 pb-8">
          <AccountSummarySection className="col-span-full">
              <AccountSummaryCard dataTitle="Income" amount={2100} previousAmount={1950}/>
              <AccountSummaryCard dataTitle="Expenditure" amount={1500} previousAmount={1900} invert={true}/>
              <AccountSummaryCard dataTitle="Savings" amount={500} previousAmount={627}/>
              <AccountSummaryCard dataTitle="Liabilities" amount={750} previousAmount={543} invert={true}/>
          </AccountSummarySection>
          <MonthlyComparisonLineGraph data={MonthlySummaryData} className="col-span-full md:col-span-7"/>
          <TransactionsCard
              transactions={transactions?.slice(0,11) ?? []}
              title="Recent Transactions"
              className="col-span-full md:col-span-5 row-span-2" 
          />
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