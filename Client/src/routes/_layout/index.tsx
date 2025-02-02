import { createFileRoute } from '@tanstack/react-router'
import {AccountSummaryCard} from "@/components/features/accounts/AccountSummaryCard.tsx";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import {TransactionsCard} from "@/components/features/transactions/TransactionsCard.tsx";
import {BudgetLimitCard} from "@/components/features/budgets/BudgetLimitCard.tsx";
import {cn} from "@/lib/utils.ts";
import {accountsAtom, transactionsAtom, transactionsPaginationAtom} from "@/lib/atoms.ts";
import {useAtom} from "jotai";
import {MonthlyComparisonLineGraph} from "@/components/features/accounts/MonthlyComparisonLineGraph.tsx";
import TopExpenseCategoriesCard, { GaugeProps } from "@/components/features/transactions/TopExpenseCategoriesCard.tsx";
import TotalBalanceCard from "@/components/features/accounts/TotalBalanceCard.tsx";

export const Route = createFileRoute('/_layout/')({
  component: DashboardPage,
})

function DashboardPage() {
    const [{data: transactionsData}] = useAtom(transactionsAtom);
    const [{data: accounts}] = useAtom(accountsAtom);
    const [pagination] = useAtom(transactionsPaginationAtom)
    
    const transactions = transactionsData?.pages[pagination.pageIndex];
    
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

    const gaugeData: GaugeProps[] = [
        {
            categoryName: 'Bank Fees',
            categoryIconUrl: "https://plaid-category-icons.plaid.com/PFC_BANK_FEES.png",
            categoryAmount: 12000,
            totalAmount: 20000,
        },
        {
            categoryName: 'General Services',
            categoryIconUrl: "https://plaid-category-icons.plaid.com/PFC_GENERAL_SERVICES.png",
            categoryAmount: 8500,
            totalAmount: 10000,
        },
        {
            categoryName: 'Entertainment',
            categoryIconUrl: "https://plaid-category-icons.plaid.com/PFC_ENTERTAINMENT.png",
            categoryAmount: 350,
            totalAmount: 500,
        },
    ];
    
    return (
      <div className="grid grid-cols-12 auto-rows-auto gap-4 px-3 md:px-4 pb-8">
          <AccountSummarySection className="col-span-full">
              <AccountSummaryCard dataTitle="Income" amount={2100} previousAmount={1950}/>
              <AccountSummaryCard dataTitle="Expenditure" amount={1500} previousAmount={1900} invert={true}/>
              <AccountSummaryCard dataTitle="Savings" amount={500} previousAmount={627}/>
              <AccountSummaryCard dataTitle="Liabilities" amount={750} previousAmount={543} invert={true}/>
          </AccountSummarySection>
          <MonthlyComparisonLineGraph data={MonthlySummaryData} className="col-span-full md:col-span-7"/>
          <TransactionsCard
              transactionsData={transactions}
              title="Recent Transactions"
              className="col-span-full md:col-span-5 row-span-2" 
          />
          <BudgetLimitCard spent={2000} limit={7000} className="col-span-full md:col-span-7"/>
          <TopExpenseCategoriesCard gaugeData={gaugeData} className="col-span-full md:col-span-5" />
          <TotalBalanceCard accounts={accounts ?? []} className="col-span-full md:col-span-7"/>
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